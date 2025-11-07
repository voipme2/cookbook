'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Home, Plus, Download, Folder, Sun, Moon } from 'lucide-react';
import { SearchBox } from './SearchBox';
import { useTheme } from './providers/ThemeProvider';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: Home, activeColor: 'text-blue-600 dark:text-blue-400' },
  { name: 'New', path: '/new', icon: Plus, activeColor: 'text-green-600 dark:text-green-400' },
  { name: 'Groups', path: '/groups', icon: Folder, activeColor: 'text-orange-600 dark:text-orange-400' },
  { name: 'Import', path: '/import', icon: Download, activeColor: 'text-purple-600 dark:text-purple-400' },
];

export default function NavBar({ showSearch }: { showSearch?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchToggle = () => setSearchOpen(!searchOpen);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Tablet Navigation - Top Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        active
                          ? `${item.activeColor} bg-gray-100 dark:bg-gray-700`
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              {showSearch && (
                <button
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    searchOpen
                      ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={toggleTheme}
                disabled={!mounted}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Search Box */}
        {showSearch && searchOpen && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <SearchBox mode="global" />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                  active
                    ? item.activeColor
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <item.icon className={`h-6 w-6 ${active ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-xs ${active ? 'font-medium' : 'font-normal'}`}>{item.name}</span>
              </button>
            );
          })}
          
          {/* Mobile Theme & Search Toggle */}
          <button
            onClick={showSearch ? handleSearchToggle : toggleTheme}
            disabled={!mounted}
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
          >
            {showSearch ? (
              <>
                <Search className={`h-6 w-6 ${searchOpen ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-xs ${searchOpen ? 'font-medium' : 'font-normal'}`}>Search</span>
              </>
            ) : (
              <>
                {mounted && theme === 'dark' ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
                <span className="text-xs">Theme</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
} 