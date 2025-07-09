'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Globe, Loader } from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  const scrapeMutation = useMutation({
    mutationFn: async (recipeUrl: string) => {
      const response = await fetch('/api/recipes/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: recipeUrl }),
      });
      if (!response.ok) {
        throw new Error('Failed to scrape recipe');
      }
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/view/${data.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    scrapeMutation.mutate(url.trim());
  };

  return (
    <Layout showSearch={true}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Import Recipe</h1>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Recipe from URL</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Paste a recipe URL to automatically import it into your collection.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="recipe-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipe URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="recipe-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/recipe"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scrapeMutation.isPending || !url.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {scrapeMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Import Recipe
                    </>
                  )}
                </button>
              </div>
            </form>

            {scrapeMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Failed to import recipe. Please check the URL and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 