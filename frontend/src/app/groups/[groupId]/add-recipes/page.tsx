'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface AddRecipesPageProps {
  params: Promise<{ groupId: string }>;
}

export default function AddRecipesPage({ params }: AddRecipesPageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ['group', unwrappedParams.groupId],
    queryFn: () => api.getGroup(unwrappedParams.groupId),
    enabled: !!unwrappedParams.groupId,
  });

  const { data: allRecipes, isLoading: recipesLoading, error: recipesError } = useQuery({
    queryKey: ['recipes'],
    queryFn: api.getRecipes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: groupRecipes } = useQuery({
    queryKey: ['group-recipes', unwrappedParams.groupId],
    queryFn: () => api.getGroupRecipes(unwrappedParams.groupId),
    enabled: !!unwrappedParams.groupId,
  });

  const addRecipeMutation = useMutation({
    mutationFn: ({ groupId, recipeId }: { groupId: string; recipeId: string }) =>
      api.addRecipeToGroup(groupId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-recipes', unwrappedParams.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', unwrappedParams.groupId] });
    },
  });

  // Filter recipes based on search term and exclude already added recipes
  const filteredRecipes = useMemo(() => {
    if (!allRecipes) return [];
    
    const groupRecipeIds = new Set(groupRecipes?.map(r => r.id) || []);
    
    return allRecipes.filter(recipe => {
      const matchesSearch = !searchTerm.trim() || 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const notInGroup = !groupRecipeIds.has(recipe.id);
      
      return matchesSearch && notInGroup;
    });
  }, [allRecipes, searchTerm, groupRecipes]);

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

  const handleAddSelected = async () => {
    if (selectedRecipes.size === 0) return;
    
    const promises = Array.from(selectedRecipes).map(recipeId =>
      addRecipeMutation.mutateAsync({ groupId: unwrappedParams.groupId, recipeId })
    );
    
    try {
      await Promise.all(promises);
      setSelectedRecipes(new Set());
      router.push(`/groups/${unwrappedParams.groupId}`);
    } catch (error) {
      console.error('Failed to add recipes:', error);
    }
  };

  const handleAddSingle = async (recipeId: string) => {
    try {
      await addRecipeMutation.mutateAsync({ groupId: unwrappedParams.groupId, recipeId });
    } catch (error) {
      console.error('Failed to add recipe:', error);
    }
  };

  if (groupLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (groupError || !group) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Group not found or failed to load</p>
            <button
              onClick={() => router.push('/groups')}
              className="mt-4 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/groups/${group.id}`)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Group</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Recipes to Group</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Add recipes to &ldquo;{group.name}&rdquo;
              </p>
            </div>
            
            {selectedRecipes.size > 0 && (
              <button
                onClick={handleAddSelected}
                disabled={addRecipeMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Add {selectedRecipes.size} Recipe{selectedRecipes.size !== 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Recipes List */}
        {recipesLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recipesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Failed to load recipes</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {recipe.name}
                    </h3>
                    
                    {recipe.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {recipe.description}
                      </p>
                    )}
                    
                    {/* Dietary Options */}
                    {recipe.options && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recipe.options.isVegetarian && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            🥬
                          </span>
                        )}
                        {recipe.options.isVegan && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            🌱
                          </span>
                        )}
                        {recipe.options.isDairyFree && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            🥛
                          </span>
                        )}
                        {recipe.options.isGlutenFree && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            🌾
                          </span>
                        )}
                        {recipe.options.isCrockPot && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            🍲
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/view/${recipe.id}`)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      title="View recipe"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleRecipeToggle(recipe.id)}
                      className={`p-1 rounded transition-colors duration-200 ${
                        selectedRecipes.has(recipe.id)
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                      title={selectedRecipes.has(recipe.id) ? 'Remove from selection' : 'Add to selection'}
                    >
                      {selectedRecipes.has(recipe.id) ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleAddSingle(recipe.id)}
                      disabled={addRecipeMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 disabled:opacity-50"
                      title="Add to group"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recipes found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm.trim() 
                ? `No recipes match "${searchTerm}"`
                : 'All available recipes are already in this group'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
} 