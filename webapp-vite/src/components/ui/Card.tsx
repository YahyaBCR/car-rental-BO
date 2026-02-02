/**
 * FLIT Card Component
 * Cartes avec shadow douce et coins arrondis (radius 12)
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  // Shadow douce FLIT
  const baseStyles = 'bg-white rounded-md shadow-sm border border-gray-100';

  // Hover effect
  const hoverStyles = hover ? 'hover:shadow-md transition-all cursor-pointer hover:-translate-y-1' : '';

  // Padding - ultra compact
  const paddingStyles = {
    none: '',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
