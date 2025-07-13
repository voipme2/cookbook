'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder, Plus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface GroupManagerProps {
  recipeId: string;
  className?: string;
}

export default function GroupManager({ recipeId, className = '' }: GroupManagerProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const { data: allGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: api.getGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: recipeGroups, isLoading: recipeGroupsLoading } = useQuery({
    queryKey: ['recipe-groups', recipeId],
    queryFn: () => api.getRecipeGroups(recipeId),
    enabled: !!recipeId,
  });

  const addToGroupMutation = useMutation({
    mutationFn: ({ groupId, recipeId }: { groupId: string; recipeId: string }) =>
      api.addRecipeToGroup(groupId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-groups', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const removeFromGroupMutation = useMutation({
    mutationFn: ({ groupId, recipeId }: { groupId: string; recipeId: string }) =>
      api.removeRecipeFromGroup(groupId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-groups', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: api.createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateForm(false);
      setNewGroupName('');
      setNewGroupDescription('');
      // Automatically add recipe to the new group
      addToGroupMutation.mutate({ groupId: data.id, recipeId });
    },
  });

  const recipeGroupIds = new Set(recipeGroups?.map(g => g.id) || []);
  const availableGroups = allGroups?.filter(group => !recipeGroupIds.has(group.id)) || [];

  const handleAddToGroup = (groupId: string) => {
    addToGroupMutation.mutate({ groupId, recipeId });
  };

  const handleRemoveFromGroup = (groupId: string) => {
    removeFromGroupMutation.mutate({ groupId, recipeId });
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    createGroupMutation.mutate({
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || undefined,
    });
  };

  if (groupsLoading || recipeGroupsLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recipe Groups</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          {isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      {/* Current Groups */}
      {recipeGroups && recipeGroups.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">In Groups:</h4>
          <div className="space-y-2">
            {recipeGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</span>
                  {group.recipeCount && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({group.recipeCount} recipe{(group.recipeCount || 0) !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFromGroup(group.id)}
                  disabled={removeFromGroupMutation.isPending}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors duration-200 disabled:opacity-50"
                  title="Remove from group"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Create New Group */}
          <div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Group</span>
            </button>
            
            {showCreateForm && (
              <form onSubmit={handleCreateGroup} className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="newGroupName" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      id="newGroupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:text-white"
                      placeholder="e.g., Thanksgiving, Quick Meals"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newGroupDescription" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="newGroupDescription"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Describe what this group is for..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={createGroupMutation.isPending || !newGroupName.trim()}
                      className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      {createGroupMutation.isPending ? 'Creating...' : 'Create & Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewGroupName('');
                        setNewGroupDescription('');
                      }}
                      className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Available Groups */}
          {availableGroups.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add to Group:</h4>
              <div className="space-y-2">
                {availableGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{group.name}</span>
                      {group.recipeCount && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({group.recipeCount} recipe{(group.recipeCount || 0) !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToGroup(group.id)}
                      disabled={addToGroupMutation.isPending}
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded transition-colors duration-200 disabled:opacity-50"
                      title="Add to group"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableGroups.length === 0 && recipeGroups && recipeGroups.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">No groups available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 