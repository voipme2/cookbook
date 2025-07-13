'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, Clock, Users, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface GroupStatsProps {
  className?: string;
}

export default function GroupStats({ className = '' }: GroupStatsProps) {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: api.getGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return null;
  }

  const totalGroups = groups.length;
  const totalRecipes = groups.reduce((sum, group) => sum + (group.recipeCount || 0), 0);
  const avgRecipesPerGroup = totalGroups > 0 ? Math.round(totalRecipes / totalGroups) : 0;
  const largestGroup = groups.reduce((max, group) => 
    (group.recipeCount || 0) > (max.recipeCount || 0) ? group : max
  );

  const stats = [
    {
      label: 'Total Groups',
      value: totalGroups,
      icon: Folder,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Total Recipes',
      value: totalRecipes,
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Avg per Group',
      value: avgRecipesPerGroup,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Largest Group',
      value: largestGroup.recipeCount || 0,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Group Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} mb-2`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {largestGroup.recipeCount && largestGroup.recipeCount > 0 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <span className="font-medium">{largestGroup.name}</span> is your largest group with {largestGroup.recipeCount} recipe{largestGroup.recipeCount !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  );
} 