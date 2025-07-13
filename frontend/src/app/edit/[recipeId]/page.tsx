'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import { Recipe } from '@/types';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

interface EditRecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', unwrappedParams.recipeId],
    queryFn: () => api.getRecipe(unwrappedParams.recipeId),
  });

  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    author: '',
    servings: '',
    prepTime: '',
    cookTime: '',
    inactiveTime: '',
    ingredients: [],
    steps: [],
    imageUrl: '',
    options: {
      isVegetarian: false,
      isVegan: false,
      isDairyFree: false,
      isGlutenFree: false,
      isCrockPot: false,
    },
  });

  // Update form data when recipe loads
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        author: recipe.author || '',
        servings: recipe.servings || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        inactiveTime: recipe.inactiveTime || '',
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        imageUrl: recipe.imageUrl || '',
        options: {
          isVegetarian: recipe.options?.isVegetarian || false,
          isVegan: recipe.options?.isVegan || false,
          isDairyFree: recipe.options?.isDairyFree || false,
          isGlutenFree: recipe.options?.isGlutenFree || false,
          isCrockPot: recipe.options?.isCrockPot || false,
        },
      });
    }
  }, [recipe]);

  const updateRecipeMutation = useMutation({
    mutationFn: (data: Partial<Recipe>) => api.updateRecipe(unwrappedParams.recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', unwrappedParams.recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      router.push(`/view/${unwrappedParams.recipeId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecipeMutation.mutate(formData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { item: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || []
    }));
  };

  const updateIngredient = (index: number, field: 'item' | 'amount' | 'unit', value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      ) || []
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), '']
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map((step, i) => i === index ? value : step) || []
    }));
  };

  const updateOption = (option: keyof Recipe['options'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value,
      }
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recipe not found</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Recipe</h1>
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Servings
                </label>
                <input
                  type="text"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                  placeholder="e.g., 4 servings"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prep Time
                </label>
                <input
                  type="text"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                  placeholder="e.g., 15 minutes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cook Time
                </label>
                <input
                  type="text"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                  placeholder="e.g., 45 minutes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inactive Time
                </label>
                <input
                  type="text"
                  value={formData.inactiveTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, inactiveTime: e.target.value }))}
                  placeholder="e.g., 2 hours"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {formData.ingredients?.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={ingredient.item}
                    onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                    placeholder="Ingredient"
                    className="flex-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.ingredients && formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Step
              </button>
            </div>
            <div className="space-y-3">
              {formData.steps?.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                    {index + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.steps && formData.steps.length > 1 && (
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options?.isVegetarian || false}
                  onChange={(e) => updateOption('isVegetarian', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🥬 Vegetarian</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options?.isVegan || false}
                  onChange={(e) => updateOption('isVegan', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌱 Vegan</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options?.isDairyFree || false}
                  onChange={(e) => updateOption('isDairyFree', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🥛 Dairy Free</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options?.isGlutenFree || false}
                  onChange={(e) => updateOption('isGlutenFree', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌾 Gluten Free</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options?.isCrockPot || false}
                  onChange={(e) => updateOption('isCrockPot', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🍲 Crock Pot</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateRecipeMutation.isPending}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={20} className="mr-2" />
              {updateRecipeMutation.isPending ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 