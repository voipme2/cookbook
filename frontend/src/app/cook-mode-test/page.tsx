'use client';

import React from 'react';
import { ChefHat } from 'lucide-react';
import { useWakeLock } from '@/hooks/useWakeLock';
import Layout from '@/components/Layout';

export default function CookModeTestPage() {
  const { 
    isWakeLockActive, 
    isSupported, 
    supportChecked, 
    toggleWakeLock,
    requestWakeLock,
    releaseWakeLock 
  } = useWakeLock();

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cook Mode Test Page</h1>
        
        <div className="space-y-4">
          {/* Browser Support Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold mb-2">Browser Support Status</h2>
            <div className="space-y-1 text-sm">
              <p>Support Checked: <span className={supportChecked ? 'text-green-600' : 'text-yellow-600'}>{supportChecked ? 'Yes' : 'No'}</span></p>
              <p>Wake Lock Supported: <span className={isSupported ? 'text-green-600' : 'text-red-600'}>{isSupported ? 'Yes' : 'No'}</span></p>
              <p>Current State: <span className={isWakeLockActive ? 'text-orange-600' : 'text-gray-600'}>{isWakeLockActive ? 'Active' : 'Inactive'}</span></p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold mb-2">Test Controls</h2>
            <div className="flex gap-2">
              <button
                onClick={toggleWakeLock}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isWakeLockActive
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                }`}
              >
                <ChefHat size={16} />
                {isWakeLockActive ? 'Disable Cook Mode' : 'Enable Cook Mode'}
              </button>
              
              <button
                onClick={requestWakeLock}
                disabled={isWakeLockActive}
                className="px-4 py-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 disabled:opacity-50"
              >
                Force Enable
              </button>
              
              <button
                onClick={releaseWakeLock}
                disabled={!isWakeLockActive}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 disabled:opacity-50"
              >
                Force Disable
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="font-semibold mb-2">Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Enable Cook Mode" to activate</li>
              <li>Check if the screen stays on (don't touch the screen for 30+ seconds)</li>
              <li>If the screen turns off, the Wake Lock API is not working</li>
              <li>Check the browser console for any error messages</li>
              <li>Try refreshing the page and testing again</li>
            </ol>
          </div>

          {/* Debug Info */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Information</h2>
            <div className="text-sm space-y-1">
              <p>User Agent: {navigator.userAgent}</p>
              <p>Platform: {navigator.platform}</p>
              <p>Vendor: {navigator.vendor}</p>
              <p>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
              <p>Vibration API: {typeof navigator.vibrate === 'function' ? 'Supported' : 'Not Supported'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 