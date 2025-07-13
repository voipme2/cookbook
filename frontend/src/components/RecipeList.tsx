'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SearchRecipe } from '@/types';
import RecipePlaceholderIcon from './RecipePlaceholderIcon';

interface RecipeListProps {
  recipes?: SearchRecipe[];
  showSkeleton?: boolean;
}

export default function RecipeList({ recipes, showSkeleton = false }: RecipeListProps) {
  const router = useRouter();
  
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
          <div
            key={recipe.id}
            onClick={() => router.push(`/view/${recipe.id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
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
                  <RecipePlaceholderIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
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
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop layout - card grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => router.push(`/view/${recipe.id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <RecipePlaceholderIcon className="w-14 h-14 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {recipe.name}
              </h3>
              
              {recipe.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {recipe.description}
                </p>
              )}
              
              {/* Dietary Options */}
              {recipe.options && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipe.options.isGlutenFree && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      🌾
                    </span>
                  )}
                  {recipe.options.isDairyFree && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      🥛
                    </span>
                  )}
                  {recipe.options.isVegan && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      🌱
                    </span>
                  )}
                  {recipe.options.isVegetarian && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      🥬
                    </span>
                  )}
                  {recipe.options.isCrockPot && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                      🍲
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 