'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Recipe } from '@/types';
import Layout from '@/components/Layout';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

interface EditRecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    description: '',
    servings: '',
    prepTime: '',
    inactiveTime: '',
    cookTime: '',
    ingredients: [{ text: '' }],
    steps: [{ text: '' }],
    options: {
      isVegetarian: false,
      isVegan: false,
      isDairyFree: false,
      isCrockPot: false,
      isGlutenFree: false,
    },
    imageUrl: '',
  });

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', unwrappedParams.recipeId],
    queryFn: () => api.getRecipe(unwrappedParams.recipeId),
    enabled: !!unwrappedParams.recipeId,
  });

  // Populate form when recipe loads
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        author: recipe.author || '',
        description: recipe.description || '',
        servings: recipe.servings?.toString() || '',
        prepTime: recipe.prepTime?.toString() || '',
        inactiveTime: recipe.inactiveTime?.toString() || '',
        cookTime: recipe.cookTime?.toString() || '',
        ingredients: recipe.ingredients?.length > 0 ? recipe.ingredients : [{ text: '' }],
        steps: recipe.steps?.length > 0 ? recipe.steps : [{ text: '' }],
        options: recipe.options || {
          isVegetarian: false,
          isVegan: false,
          isDairyFree: false,
          isCrockPot: false,
          isGlutenFree: false,
        },
        imageUrl: recipe.imageUrl || '',
      });
    }
  }, [recipe]);

  const updateRecipeMutation = useMutation({
    mutationFn: (recipeData: Recipe) => api.updateRecipe(unwrappedParams.recipeId, recipeData),
    onSuccess: () => {
      router.push(`/view/${unwrappedParams.recipeId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipeData = {
      ...formData,
      servings: formData.servings ? parseInt(formData.servings) : undefined
    };
    updateRecipeMutation.mutate(recipeData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { text: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { text } : ing
      )
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { text: '' }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { text } : step
      )
    }));
  };

  const updateOption = (option: keyof typeof formData.options, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value
      }
    }));
  };

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
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Recipe
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Time and Servings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Time & Servings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prep Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 30 min"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inactive Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 hr"
                  value={formData.inactiveTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, inactiveTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cook Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 45 min"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Plus size={16} />
                Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient.text}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="e.g., 2 cups flour"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instructions
              </h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>
            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recipe Image
            </h2>
            {formData.imageUrl && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current image:</p>
                <img
                  src={formData.imageUrl}
                  alt={formData.name}
                  className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
                />
              </div>
            )}
            <ImageUploader
              recipeId={unwrappedParams.recipeId}
              initialImageUrl={formData.imageUrl}
              onImageUpload={(imageUrl) => {
                setFormData(prev => ({ ...prev, imageUrl }));
              }}
            />
          </div>

          {/* Dietary Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dietary Options
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.isVegetarian}
                  onChange={(e) => updateOption('isVegetarian', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Vegetarian</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.isVegan}
                  onChange={(e) => updateOption('isVegan', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Vegan</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.isDairyFree}
                  onChange={(e) => updateOption('isDairyFree', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Dairy Free</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.isGlutenFree}
                  onChange={(e) => updateOption('isGlutenFree', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Gluten Free</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.isCrockPot}
                  onChange={(e) => updateOption('isCrockPot', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Crock Pot</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateRecipeMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateRecipeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 