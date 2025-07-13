'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchRecipe } from '@/types';
import RecipePlaceholderIcon from './RecipePlaceholderIcon';

interface RecipeCardProps {
  recipe: SearchRecipe;
  variant?: 'desktop' | 'mobile';
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {recipe.name}
            </h3>
            {recipe.description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {recipe.description}
              </p>
            )}
            
            {/* Dietary Options */}
            {recipe.options && (
              <div className="flex flex-wrap gap-1 mt-1">
                {recipe.options.isVegetarian && (
                  <span className="inline-block px-1 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                    🥬
                  </span>
                )}
                {recipe.options.isVegan && (
                  <span className="inline-block px-1 py-0.5 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded">
                    🌱
                  </span>
                )}
                {recipe.options.isDairyFree && (
                  <span className="inline-block px-1 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    🥛
                  </span>
                )}
                {recipe.options.isGlutenFree && (
                  <span className="inline-block px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                    🌾
                  </span>
                )}
                {recipe.options.isCrockPot && (
                  <span className="inline-block px-1 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                    🍲
                  </span>
                )}
              </div>
            )}
            
            {/* Group Indicators */}
            {showGroups && recipe.groups && recipe.groups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {recipe.groups.slice(0, 2).map((group) => (
                  <span
                    key={group.id}
                    className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                  >
                    {group.name}
                  </span>
                ))}
                {recipe.groups.length > 2 && (
                  <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded">
                    +{recipe.groups.length - 2}
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
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.options.isVegetarian && (
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                🥬 Vegetarian
              </span>
            )}
            {recipe.options.isVegan && (
              <span className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded">
                🌱 Vegan
              </span>
            )}
            {recipe.options.isDairyFree && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                🥛 Dairy-Free
              </span>
            )}
            {recipe.options.isGlutenFree && (
              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                🌾 Gluten-Free
              </span>
            )}
            {recipe.options.isCrockPot && (
              <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                🍲 CrockPot
              </span>
            )}
          </div>
        )}
        
        {/* Group Indicators */}
        {showGroups && recipe.groups && recipe.groups.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.groups.slice(0, 3).map((group) => (
              <span
                key={group.id}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
              >
                {group.name}
              </span>
            ))}
            {recipe.groups.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded">
                +{recipe.groups.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 