'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, Utensils, Heart, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const groupTemplates: GroupTemplate[] = [
  {
    id: 'holidays',
    name: 'Holiday Favorites',
    description: 'Special recipes for holidays and celebrations',
    icon: Calendar,
    color: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
  },
  {
    id: 'quick-meals',
    name: 'Quick & Easy',
    description: 'Fast recipes for busy weeknights',
    icon: Clock,
    color: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
  },
  {
    id: 'weekend-cooking',
    name: 'Weekend Projects',
    description: 'More complex recipes for leisurely cooking',
    icon: Utensils,
    color: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
  },
  {
    id: 'healthy-options',
    name: 'Healthy Choices',
    description: 'Nutritious and wholesome recipes',
    icon: Heart,
    color: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
  },
  {
    id: 'family-favorites',
    name: 'Family Favorites',
    description: 'Recipes that everyone loves',
    icon: Star,
    color: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
  },
];

interface GroupTemplatesProps {
  onGroupCreated?: (groupId: string) => void;
  className?: string;
}

export default function GroupTemplates({ onGroupCreated, className = '' }: GroupTemplatesProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

  const createGroupMutation = useMutation({
    mutationFn: api.createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setCreatingTemplate(null);
      if (onGroupCreated) {
        onGroupCreated(data.id);
      } else {
        router.push(`/groups/${data.id}`);
      }
    },
  });

  const handleCreateTemplate = (template: GroupTemplate) => {
    setCreatingTemplate(template.id);
    createGroupMutation.mutate({
      name: template.name,
      description: template.description,
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Start Templates
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Create a group from one of these popular templates
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleCreateTemplate(template)}
            disabled={createGroupMutation.isPending && creatingTemplate === template.id}
            className={`${template.color} text-white p-4 rounded-lg text-left transition-all duration-200 disabled:opacity-50 hover:shadow-md`}
          >
            <div className="flex items-center space-x-3">
              <template.icon className="h-6 w-6" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs opacity-90 mt-1">{template.description}</p>
              </div>
              {createGroupMutation.isPending && creatingTemplate === template.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 