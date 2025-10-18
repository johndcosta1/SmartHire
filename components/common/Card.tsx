
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-casino-secondary shadow-lg rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-casino-gold">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
