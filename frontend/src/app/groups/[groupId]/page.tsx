'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import RecipeList from '@/components/RecipeList';
import { api } from '@/lib/api';
import Image from 'next/image';

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ['group', unwrappedParams.groupId],
    queryFn: () => api.getGroup(unwrappedParams.groupId),
    enabled: !!unwrappedParams.groupId,
  });

  const { data: recipes, isLoading: recipesLoading, error: recipesError } = useQuery({
    queryKey: ['group-recipes', unwrappedParams.groupId],
    queryFn: () => api.getGroupRecipes(unwrappedParams.groupId),
    enabled: !!unwrappedParams.groupId,
  });

  const deleteGroupMutation = useMutation({
    mutationFn: api.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.push('/groups');
    },
  });

  const removeRecipeMutation = useMutation({
    mutationFn: ({ groupId, recipeId }: { groupId: string; recipeId: string }) =>
      api.removeRecipeFromGroup(groupId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-recipes', unwrappedParams.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', unwrappedParams.groupId] });
    },
  });

  const handleDeleteGroup = () => {
    if (group && confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`)) {
      deleteGroupMutation.mutate(group.id);
    }
  };

  const handleRemoveRecipe = (recipeId: string, recipeName: string) => {
    if (confirm(`Remove "${recipeName}" from this group?`)) {
      removeRecipeMutation.mutate({ groupId: unwrappedParams.groupId, recipeId });
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
            onClick={() => router.push('/groups')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Groups</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{group.description}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {group.recipeCount || 0} recipe{(group.recipeCount || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/groups/${group.id}/edit`)}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center space-x-2 text-sm transition-colors duration-200"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={deleteGroupMutation.isPending}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center space-x-2 text-sm transition-colors duration-200 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleteGroupMutation.isPending ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recipes in this group</h2>
            <button
              onClick={() => router.push(`/groups/${group.id}/add-recipes`)}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Recipes</span>
            </button>
          </div>

          {recipesLoading ? (
            <RecipeList showSkeleton={true} />
          ) : recipesError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Failed to load recipes</p>
            </div>
          ) : recipes && recipes.length > 0 ? (
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div
                        onClick={() => router.push(`/view/${recipe.id}`)}
                        className="flex items-center space-x-4 flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors duration-200"
                      >
                        {recipe.imageUrl ? (
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.name}
                            className="w-16 h-16 rounded object-cover"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500 text-2xl">🍽️</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{recipe.name}</h3>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipe(recipe.id, recipe.name)}
                        disabled={removeRecipeMutation.isPending}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded transition-colors duration-200 disabled:opacity-50"
                        title="Remove from group"
                      >
                        <Trash2 className="h-4 w-4" />
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recipes in this group</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add some recipes to get started
              </p>
              <button
                onClick={() => router.push(`/groups/${group.id}/add-recipes`)}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Add Recipes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 