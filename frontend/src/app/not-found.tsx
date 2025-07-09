import React from 'react';
import { Home } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 