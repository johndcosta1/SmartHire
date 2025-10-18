
import React from 'react';
import { UserRole } from '../types';
import { Icon } from './common/Icon';

interface HeaderProps {
  currentRole: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ currentRole }) => {
  return (
    <header className="bg-casino-primary shadow-md p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-700 no-print">
      <div>
        <h2 className="text-xl font-semibold text-casino-text">Welcome, {currentRole}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative text-casino-text-muted hover:text-casino-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-casino-primary"></span>
        </button>
      </div>
    </header>
  );
};