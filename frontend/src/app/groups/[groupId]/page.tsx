'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import { SearchRecipe } from '@/types';

interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default function GroupPage({ params }: GroupPageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', unwrappedParams.groupId],
    queryFn: () => api.getGroup(unwrappedParams.groupId),
  });

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['group-recipes', unwrappedParams.groupId],
    queryFn: () => api.getGroupRecipes(unwrappedParams.groupId),
  });

  const removeRecipeMutation = useMutation({
    mutationFn: (recipeId: string) => api.removeRecipeFromGroup(unwrappedParams.groupId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-recipes', unwrappedParams.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', unwrappedParams.groupId] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => api.deleteGroup(unwrappedParams.groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.push('/groups');
    },
  });

  const handleRemoveRecipe = (recipeId: string) => {
    if (confirm('Are you sure you want to remove this recipe from the group?')) {
      removeRecipeMutation.mutate(recipeId);
    }
  };

  const handleDeleteGroup = () => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      deleteGroupMutation.mutate();
    }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/groups/${unwrappedParams.groupId}/add-recipes`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Recipes
            </button>
            <button
              onClick={() => router.push(`/groups/${unwrappedParams.groupId}/edit`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Edit Group
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={deleteGroupMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
            </button>
          </div>
        </div>

        {/* Recipe Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {recipes?.length || 0} recipe{(recipes?.length || 0) !== 1 ? 's' : ''} in this group
          </p>
        </div>

        {/* Recipes List */}
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe: SearchRecipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-2xl">🍽️</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {recipe.name}
                  </h3>
                  
                  {recipe.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/view/${recipe.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Recipe
                    </button>
                    <button
                      onClick={() => handleRemoveRecipe(recipe.id)}
                      disabled={removeRecipeMutation.isPending}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recipes in this group
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by adding some recipes to this group.
            </p>
            <button
              onClick={() => router.push(`/groups/${unwrappedParams.groupId}/add-recipes`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Recipes
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
} 