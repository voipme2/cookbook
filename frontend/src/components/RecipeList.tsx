'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchRecipe } from '@/types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes?: SearchRecipe[];
  showSkeleton?: boolean;
}

export default function RecipeList({ recipes, showSkeleton = false }: RecipeListProps) {
  const { data: allRecipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: api.getRecipes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use provided recipes or fall back to all recipes
  const displayRecipes = recipes || allRecipes || [];

  if (showSkeleton || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile skeleton - horizontal layout */}
        <div className="sm:hidden space-y-2">
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
        
        {/* Desktop skeleton - card layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load recipes</p>
        </div>
      </div>
    );
  }

  if (!displayRecipes || displayRecipes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {recipes ? 'No recipes match your filters' : 'No recipes found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile layout - horizontal compact cards like search results */}
      <div className="sm:hidden space-y-2">
        {displayRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            variant="mobile"
            showGroups={true}
          />
        ))}
      </div>
      
      {/* Desktop layout - card grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            variant="desktop"
            showGroups={true}
          />
        ))}
      </div>
    </div>
  );
} 