'use client';

import React from 'react';
import NavBar from './NavBar';

interface NavBarWrapperProps {
  showSearch?: boolean;
}

export default function NavBarWrapper({ showSearch }: NavBarWrapperProps) {
  return <NavBar showSearch={showSearch} />;
} 