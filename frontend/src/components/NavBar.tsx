'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Home, Plus, Download, Folder, Sun, Moon } from 'lucide-react';
import { SearchBox } from './SearchBox';
import { useTheme } from './providers/ThemeProvider';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: Home, color: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' },
  { name: 'New', path: '/new', icon: Plus, color: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' },
  { name: 'Groups', path: '/groups', icon: Folder, color: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600' },
  { name: 'Download', path: '/import', icon: Download, color: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600' },
];

export default function NavBar({ showSearch }: { showSearch?: boolean }) {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSearchToggle = () => setSearchOpen(!searchOpen);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Desktop Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-light tracking-wide text-gray-900 dark:text-white">
                The Trusted Palate
              </h1>
            </div>
            
            {/* Desktop Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`${item.color} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search, Theme Toggle, and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              disabled={!mounted}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>

            {showSearch && (
              <button
                onClick={handleSearchToggle}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              >
                <Search className="h-6 w-6" />
              </button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={handleDrawerToggle}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                className={`${item.color} text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
            {showSearch && (
              <button
                onClick={() => {
                  handleSearchToggle();
                  setMobileOpen(false);
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-colors duration-200"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Box */}
      {showSearch && searchOpen && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <SearchBox mode="global" />
        </div>
      )}
    </div>
  );
} 