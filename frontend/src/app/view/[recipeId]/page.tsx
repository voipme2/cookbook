'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import ViewRecipe from '@/components/ViewRecipe';

interface ViewRecipePageProps {
  params: Promise<{
    recipeId: string;
  }>;
}

export default function ViewRecipePage({ params }: ViewRecipePageProps) {
  const unwrappedParams = React.use(params);
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', unwrappedParams.recipeId],
    queryFn: () => api.getRecipe(unwrappedParams.recipeId),
    enabled: !!unwrappedParams.recipeId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !recipe) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Recipe not found or failed to load.
          </h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={true}>
      <ViewRecipe recipe={recipe} />
    </Layout>
  );
} 