import React from 'react';
import NavBarWrapper from './NavBarWrapper';

interface LayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

export default function Layout({ children, showSearch = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <NavBarWrapper showSearch={showSearch} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 