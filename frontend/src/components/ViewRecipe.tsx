
'use client';

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit, Printer } from "lucide-react";
import Ingredients from "./Ingredients";
import Steps from "./Steps";
import ImageUploader from "./ImageUploader";
import { Recipe } from "@/types";
import RecipePlaceholderIcon from './RecipePlaceholderIcon';

// Utility to parse time strings like '2 hr', '15 min' into minutes
function parseTimeToMinutes(time?: string): number {
  if (!time) return 0;
  const hrMatch = time.match(/(\d+)\s*hr/);
  const minMatch = time.match(/(\d+)\s*min/);
  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  return hours * 60 + minutes;
}

function formatMinutes(total: number): string {
  if (total <= 0) return '';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours} hr ${minutes} min`;
  if (hours) return `${hours} hr`;
  return `${minutes} min`;
}

const ViewRecipe = ({ recipe }: { recipe: Recipe }) => {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;
  const [currentRecipe, setCurrentRecipe] = React.useState(recipe);

  // Calculate total time in minutes
  const totalMinutes =
    parseTimeToMinutes(currentRecipe.prepTime != null ? String(currentRecipe.prepTime) : '') +
    parseTimeToMinutes(currentRecipe.inactiveTime != null ? String(currentRecipe.inactiveTime) : '') +
    parseTimeToMinutes(currentRecipe.cookTime != null ? String(currentRecipe.cookTime) : '');
  const totalTimeStr = formatMinutes(totalMinutes);

  // Update recipe when prop changes
  React.useEffect(() => {
    setCurrentRecipe(recipe);
  }, [recipe]);

  return (
    <div className="p-6">
      {currentRecipe && (
        <div>
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {currentRecipe.imageUrl ? (
              <div className="flex-shrink-0 w-80">
                <img
                  src={currentRecipe.imageUrl}
                  alt={currentRecipe.name}
                  className="w-full h-auto max-h-48 rounded-lg object-cover"
                  onLoad={() => {}}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <RecipePlaceholderIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-80 flex items-center justify-center">
                <ImageUploader
                  recipeId={recipeId}
                  onImageUpload={(imageUrl) => {
                    // Update the recipe state with the new image URL
                    setCurrentRecipe(prev => {
                      const updated = prev ? { ...prev, imageUrl } : prev;
                      return updated;
                    });
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentRecipe.name}
                </h1>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/edit/${recipeId}`)}
                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Edit recipe"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => router.push(`/print/${recipeId}`)}
                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Print recipe"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              </div>
              
              {/* Dietary Restrictions */}
              {currentRecipe.options && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentRecipe.options.isVegetarian && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      🥬 Vegetarian
                    </span>
                  )}
                  {currentRecipe.options.isVegan && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      🌱 Vegan
                    </span>
                  )}
                  {currentRecipe.options.isDairyFree && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      🥛 Dairy Free
                    </span>
                  )}
                  {currentRecipe.options.isGlutenFree && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      🌾 Gluten Free
                    </span>
                  )}
                  {currentRecipe.options.isCrockPot && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      🍲 Crock Pot
                    </span>
                  )}
                </div>
              )}
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {currentRecipe.description} by {currentRecipe.author}
              </p>
              <div className="space-y-2">
                {currentRecipe.servings && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Servings: {currentRecipe.servings}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {currentRecipe.prepTime != null && currentRecipe.prepTime !== '' && currentRecipe.prepTime !== 0 && currentRecipe.prepTime !== '0' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">Prep Time</h3>
                      <p className="text-gray-700 dark:text-gray-300">{currentRecipe.prepTime}</p>
                    </div>
                  )}
                  {currentRecipe.cookTime != null && currentRecipe.cookTime !== '' && currentRecipe.cookTime !== 0 && currentRecipe.cookTime !== '0' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">Cook Time</h3>
                      <p className="text-gray-700 dark:text-gray-300">{currentRecipe.cookTime}</p>
                    </div>
                  )}
                  {currentRecipe.inactiveTime != null && currentRecipe.inactiveTime !== '' && currentRecipe.inactiveTime !== 0 && currentRecipe.inactiveTime !== '0' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">Inactive Time</h3>
                      <p className="text-gray-700 dark:text-gray-300">{currentRecipe.inactiveTime}</p>
                    </div>
                  )}
                  {totalTimeStr && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">Total Time</h3>
                      <p className="text-gray-700 dark:text-gray-300">{totalTimeStr}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          
          <div className="flex gap-6 flex-col lg:flex-row">
            <div className="lg:w-80 lg:flex-shrink-0">
              <Ingredients ingredients={currentRecipe.ingredients} />
            </div>
            <div className="flex-1">
              <Steps steps={currentRecipe.steps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRecipe; 