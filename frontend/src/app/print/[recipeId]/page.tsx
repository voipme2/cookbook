'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Printer } from 'lucide-react';

interface PrintRecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export default function PrintRecipePage({ params }: PrintRecipePageProps) {
  const router = useRouter();
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

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-red-600">
            Recipe not found or failed to load.
          </h2>
        </div>
      </div>
    );
  }

  const { prepTime, inactiveTime, cookTime } = recipe;
  const totalTime = [prepTime, inactiveTime, cookTime]
    .filter(Boolean)
    .join(' + ');

  return (
    <div className="min-h-screen bg-white">
      {/* Print Header - Hidden when printing */}
      <div className="print:hidden bg-gray-50 border-b border-gray-200 p-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Recipe
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Printer size={16} />
            Print Recipe
          </button>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="max-w-3xl mx-auto p-4 print:p-0">
        {/* Recipe Header */}
        <div className="mb-4 print:mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 print:text-xl">
            {recipe.name}
          </h1>
          <p className="text-base text-gray-600 mb-2 print:text-sm">
            by {recipe.author}
          </p>
          {recipe.description && (
            <p className="text-sm text-gray-700 mb-2 print:text-xs">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Recipe Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 print:mb-2 print:grid-cols-4">
          {recipe.servings && (
            <div className="bg-gray-50 p-2 rounded print:bg-transparent print:border print:border-gray-300 text-xs">
              <h3 className="font-semibold text-gray-900 mb-0.5">Servings</h3>
              <p className="text-gray-700">{recipe.servings}</p>
            </div>
          )}
          {prepTime && prepTime !== 0 && (
            <div className="bg-gray-50 p-2 rounded print:bg-transparent print:border print:border-gray-300 text-xs">
              <h3 className="font-semibold text-gray-900 mb-0.5">Prep Time</h3>
              <p className="text-gray-700">{prepTime}</p>
            </div>
          )}
          {cookTime && cookTime !== 0 && (
            <div className="bg-gray-50 p-2 rounded print:bg-transparent print:border print:border-gray-300 text-xs">
              <h3 className="font-semibold text-gray-900 mb-0.5">Cook Time</h3>
              <p className="text-gray-700">{cookTime}</p>
            </div>
          )}
          {inactiveTime && inactiveTime !== 0 && (
            <div className="bg-gray-50 p-2 rounded print:bg-transparent print:border print:border-gray-300 text-xs">
              <h3 className="font-semibold text-gray-900 mb-0.5">Inactive Time</h3>
              <p className="text-gray-700">{inactiveTime}</p>
            </div>
          )}
          {totalTime && totalTime !== 0 && (
            <div className="bg-gray-50 p-2 rounded print:bg-transparent print:border print:border-gray-300 text-xs">
              <h3 className="font-semibold text-gray-900 mb-0.5">Total Time</h3>
              <p className="text-gray-700">{totalTime}</p>
            </div>
          )}
        </div>

        {/* Dietary Options */}
        {recipe.options && Object.values(recipe.options).some(Boolean) && (
          <div className="mb-4 print:mb-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2 print:text-base">Dietary Options</h2>
            <div className="flex flex-wrap gap-1">
              {recipe.options.isVegetarian && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 print:bg-transparent print:border print:border-green-300">
                  🥬 Vegetarian
                </span>
              )}
              {recipe.options.isVegan && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 print:bg-transparent print:border print:border-emerald-300">
                  🌱 Vegan
                </span>
              )}
              {recipe.options.isDairyFree && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 print:bg-transparent print:border print:border-blue-300">
                  🥛 Dairy Free
                </span>
              )}
              {recipe.options.isGlutenFree && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-transparent print:border print:border-yellow-300">
                  🌾 Gluten Free
                </span>
              )}
              {recipe.options.isCrockPot && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 print:bg-transparent print:border print:border-orange-300">
                  🍲 Crock Pot
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="mb-4 print:mb-2">
          <h2 className="text-lg font-bold text-gray-900 mb-2 print:text-base">Ingredients</h2>
          <ul className="space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start text-sm print:text-xs">
                <span className="text-gray-500 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{ingredient.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-4 print:mb-2">
          <h2 className="text-lg font-bold text-gray-900 mb-2 print:text-base">Instructions</h2>
          {recipe.steps && recipe.steps.length > 0 && recipe.steps.some(step => step.text.trim()) ? (
            <ol className="space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex text-sm print:text-xs">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 print:bg-transparent print:border print:border-blue-300">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{step.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-700 text-sm print:text-xs italic">Just mix the ingredients.</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-2 print:pt-1 mt-4 print:mt-2">
          <p className="text-xs text-gray-500 text-center">
            Recipe from The Trusted Palate • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 