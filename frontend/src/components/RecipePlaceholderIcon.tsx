import React from 'react';

const RecipePlaceholderIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Chef hat */}
    <path d="M16 28c-4.5 0-8-3.5-8-8 0-4.1 3.2-7.5 7.2-7.9C16.7 8.7 20.7 6 25 6c3.2 0 6.1 1.5 7.9 3.8C34.6 9.3 35.8 9 37 9c5 0 9 3.6 9 8.1 0 2.2-0.8 4.2-2.1 5.7" />
    <path d="M10 28v4a4 4 0 004 4h8a4 4 0 004-4v-4" />
    {/* Book */}
    <rect x="36" y="18" width="18" height="28" rx="3" />
    <path d="M36 22h18" />
    <path d="M36 28h12" />
    <path d="M36 34h10" />
    {/* Crossed fork and knife */}
    <circle cx="20" cy="44" r="10" />
    <path d="M14.5 49.5l11-11" />
    <path d="M20 39v10" />
    <path d="M16 44h8" />
    <path d="M25.5 49.5l-11-11" />
  </svg>
);

export default RecipePlaceholderIcon; 