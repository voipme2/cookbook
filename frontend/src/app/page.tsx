'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import RecipeList from '@/components/RecipeList';
import { SearchBox } from '@/components/SearchBox';
import { api } from '@/lib/api';
import { SearchRecipe } from '@/types';

export default function HomePage() {
  const [filteredRecipes, setFilteredRecipes] = useState<SearchRecipe[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const { data: allRecipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: api.getRecipes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFilterChange = useCallback((recipes: SearchRecipe[]) => {
    setFilteredRecipes(recipes);
    setIsFiltering(true);
  }, []);

  return (
    <Layout showSearch={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search/Filter Box */}
        <div className="pt-3 pb-2">
          <SearchBox 
            mode="filter"
            allRecipes={allRecipes || []}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {/* Recipe List */}
        <RecipeList 
          recipes={isFiltering ? filteredRecipes : undefined}
          showSkeleton={isLoading}
        />
      </div>
    </Layout>
  );
}
