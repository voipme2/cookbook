'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface EditGroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default function EditGroupPage({ params }: EditGroupPageProps) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', unwrappedParams.groupId],
    queryFn: () => api.getGroup(unwrappedParams.groupId),
    enabled: !!unwrappedParams.groupId,
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) =>
      api.updateGroup(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', unwrappedParams.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.push(`/groups/${unwrappedParams.groupId}`);
    },
  });

  // Populate form when group data loads
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    updateGroupMutation.mutate({
      id: unwrappedParams.groupId,
      updates: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
  };

  const handleCancel = () => {
    router.push(`/groups/${unwrappedParams.groupId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !group) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Group not found or failed to load</p>
            <button
              onClick={() => router.push('/groups')}
              className="mt-4 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/groups/${group.id}`)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Group</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Group</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update the name and description of your recipe group
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                id="groupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="groupDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what this group is for..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={updateGroupMutation.isPending || !name.trim()}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{updateGroupMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 