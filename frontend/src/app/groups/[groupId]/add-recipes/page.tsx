'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import { SearchBox } from '@/components/SearchBox';
import { SearchRecipe } from '@/types';

interface AddRecipesPageProps {
  params: Promise<{ groupId: string }>;
}

export default function AddRecipesPage({ params }: AddRecipesPageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [filteredRecipes, setFilteredRecipes] = useState<SearchRecipe[]>([]);

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', unwrappedParams.groupId],
    queryFn: () => api.getGroup(unwrappedParams.groupId),
  });

  // Fetch all recipes
  const { data: allRecipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => api.getRecipes(),
  });

  // Fetch recipes already in the group
  const { data: groupRecipes } = useQuery({
    queryKey: ['group-recipes', unwrappedParams.groupId],
    queryFn: () => api.getGroupRecipes(unwrappedParams.groupId),
  });

  // Add recipes to group mutation
  const addRecipesMutation = useMutation({
    mutationFn: async (recipeIds: string[]) => {
      // Add recipes one by one since the API only supports single recipe addition
      for (const recipeId of recipeIds) {
        await api.addRecipeToGroup(unwrappedParams.groupId, recipeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-recipes', unwrappedParams.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', unwrappedParams.groupId] });
      router.push(`/groups/${unwrappedParams.groupId}`);
    },
  });

  // Initialize filtered recipes with all available recipes
  useEffect(() => {
    if (allRecipes && groupRecipes) {
      const groupRecipeIds = new Set(groupRecipes.map(r => r.id));
      const availableRecipes = allRecipes.filter(recipe => !groupRecipeIds.has(recipe.id));
      setFilteredRecipes(availableRecipes);
    }
  }, [allRecipes, groupRecipes]);

  const handleRecipeToggle = (recipeId: string) => {
    setSelectedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    if (selectedRecipes.size > 0) {
      addRecipesMutation.mutate(Array.from(selectedRecipes));
    }
  };

  const handleSelectAll = () => {
    if (filteredRecipes.length > 0) {
      setSelectedRecipes(new Set(filteredRecipes.map(r => r.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedRecipes(new Set());
  };

  if (groupLoading || recipesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Group not found</h1>
            <button
              onClick={() => router.push('/groups')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Groups
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add Recipes to {group.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select recipes to add to this group
            </p>
          </div>
          <button
            onClick={() => router.push(`/groups/${unwrappedParams.groupId}`)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back to Group
          </button>
        </div>

        {/* Search and Selection Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <SearchBox
                mode="filter"
                allRecipes={allRecipes || []}
                onFilterChange={(filtered) => setFilteredRecipes(filtered)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleClearSelection}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Recipe List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Recipes ({filteredRecipes.length})
            </h2>
            {selectedRecipes.size > 0 && (
              <button
                onClick={handleAddSelected}
                disabled={addRecipesMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addRecipesMutation.isPending ? 'Adding...' : `Add ${selectedRecipes.size} Recipe${selectedRecipes.size !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No recipes available to add.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 transition-all duration-200 ${
                    selectedRecipes.has(recipe.id) ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded flex-shrink-0">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRecipeToggle(recipe.id)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedRecipes.has(recipe.id)
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {selectedRecipes.has(recipe.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 