'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Folder } from 'lucide-react';
import { api } from '@/lib/api';
import { SearchRecipe } from '@/types';
import RecipePlaceholderIcon from './RecipePlaceholderIcon';
import Image from 'next/image';

interface RecipeCardProps {
  recipe: SearchRecipe;
  variant?: 'mobile' | 'desktop';
  showGroups?: boolean;
  className?: string;
}

export default function RecipeCard({ 
  recipe, 
  variant = 'desktop', 
  showGroups = true,
  className = '' 
}: RecipeCardProps) {
  const router = useRouter();

  const { data: recipeGroups } = useQuery({
    queryKey: ['recipe-groups', recipe.id],
    queryFn: () => api.getRecipeGroups(recipe.id),
    enabled: showGroups && !!recipe.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleClick = () => {
    router.push(`/view/${recipe.id}`);
  };

  if (variant === 'mobile') {
    return (
      <div
        onClick={handleClick}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
      >
        <div className="flex items-center space-x-3">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
              width={48}
              height={48}
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
            
            {/* Group Indicators */}
            {showGroups && recipeGroups && recipeGroups.length > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                <Folder className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {recipeGroups.length} group{recipeGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
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
    );
  }

  // Desktop variant
  return (
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {recipe.imageUrl ? (
        <Image
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-48 object-cover"
          width={400}
          height={192}
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
        
        {/* Group Indicators */}
        {showGroups && recipeGroups && recipeGroups.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Folder className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                {recipeGroups.length} group{recipeGroups.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recipeGroups.slice(0, 3).map((group) => (
                <span
                  key={group.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                >
                  {group.name}
                </span>
              ))}
              {recipeGroups.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  +{recipeGroups.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Dietary Options */}
        {recipe.options && (
          <div className="flex flex-wrap gap-1">
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                🍲
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 