'use client';

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, Filter, X } from "lucide-react";
import { SearchFilters, SearchRecipe } from "@/types";
import RecipePlaceholderIcon from './RecipePlaceholderIcon';

interface SearchBoxProps {
  mode?: 'global' | 'filter';
  allRecipes?: SearchRecipe[];
  onFilterChange?: (filteredRecipes: SearchRecipe[]) => void;
  className?: string;
}

export function SearchBox({ 
  mode = 'global', 
  allRecipes = [], 
  onFilterChange,
  className = ""
}: SearchBoxProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    isVegetarian: false,
    isVegan: false,
    isDairyFree: false,
    isGlutenFree: false,
    isCrockPot: false,
    groups: [],
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // For global search mode
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['search', searchValue, filters],
    queryFn: () => {
      const searchFilters = { ...filters };
      if (searchValue.trim()) {
        searchFilters.query = searchValue;
      }
      return api.searchRecipesWithFilters(searchFilters);
    },
    enabled: mode === 'global' && (searchValue.length > 0 || hasActiveFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // For filter mode - client-side filtering
  const filteredRecipes = useMemo(() => {
    if (mode !== 'filter' || allRecipes.length === 0) return [];

    return allRecipes.filter(recipe => {
      // Text search
      const matchesText = !searchValue.trim() || 
        recipe.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchValue.toLowerCase())) ||
        (recipe.groups && recipe.groups.some(group => 
          group.name.toLowerCase().includes(searchValue.toLowerCase())
        ));

      // Dietary filters
      const matchesFilters = !hasActiveFilters || (
        (!filters.isVegetarian || recipe.options?.isVegetarian) &&
        (!filters.isVegan || recipe.options?.isVegan) &&
        (!filters.isDairyFree || recipe.options?.isDairyFree) &&
        (!filters.isGlutenFree || recipe.options?.isGlutenFree) &&
        (!filters.isCrockPot || recipe.options?.isCrockPot)
      );

      // Group filters
      if (filters.groups && filters.groups.length > 0) {
        const recipeGroupIds = (recipe.groups || []).map((g: { id: string }) => g.id);
        const hasGroup = filters.groups.some((gid: string) => recipeGroupIds.includes(gid));
        if (!hasGroup) return false;
      }

      return matchesText && matchesFilters;
    });
  }, [mode, allRecipes, searchValue, filters, hasActiveFilters]);

  // Notify parent of filtered results
  React.useEffect(() => {
    if (mode === 'filter' && onFilterChange) {
      onFilterChange(filteredRecipes);
    }
  }, [filteredRecipes, mode]); // Removed onFilterChange from dependencies

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'global' && searchValue.trim()) {
      // Navigate to home with search
      router.push(`/?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleResultClick = (recipeId: string) => {
    router.push(`/view/${recipeId}`);
    setIsOpen(false);
    setSearchValue("");
  };

  const clearFilters = () => {
    setFilters({
      isVegetarian: false,
      isVegan: false,
      isDairyFree: false,
      isGlutenFree: false,
      isCrockPot: false,
      groups: [],
    });
  };

  const toggleFilter = (filterKey: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Determine which results to show
  const displayResults = mode === 'global' ? searchResults : filteredRecipes;
  const shouldShowResults = mode === 'global' ? 
    (searchValue.length > 0 || hasActiveFilters) : 
    (searchValue.length > 0 || hasActiveFilters);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsOpen(shouldShowResults);
            }}
            onFocus={() => setIsOpen(shouldShowResults)}
            placeholder={mode === 'filter' ? "Filter recipes..." : "Search recipes..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear filters"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded ${showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              title="Toggle filters"
            >
              <Filter size={16} />
            </button>
            {mode === 'global' && (isLoading || isFetching) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            )}
          </div>
        </div>
      </form>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Dietary Filters</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isVegetarian}
                onChange={() => toggleFilter('isVegetarian')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🥬 Vegetarian</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isVegan}
                onChange={() => toggleFilter('isVegan')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌱 Vegan</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isDairyFree}
                onChange={() => toggleFilter('isDairyFree')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🥛 Dairy Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isGlutenFree}
                onChange={() => toggleFilter('isGlutenFree')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌾 Gluten Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isCrockPot}
                onChange={() => toggleFilter('isCrockPot')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🍲 Crock Pot</span>
            </label>
          </div>
        </div>
      )}

      {/* Search Results Dropdown - Only for global mode */}
      {mode === 'global' && isOpen && displayResults && displayResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {displayResults.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => handleResultClick(recipe.id)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded">
                    <RecipePlaceholderIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {recipe.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {recipe.description}
                  </p>
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
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && shouldShowResults && displayResults && displayResults.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            {searchValue.length > 0 
              ? `No recipes found for "${searchValue}"${hasActiveFilters ? ' with selected filters' : ''}`
              : 'No recipes found with selected filters'
            }
          </div>
        </div>
      )}
    </div>
  );
} 