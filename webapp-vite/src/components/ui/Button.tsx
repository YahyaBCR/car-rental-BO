/**
 * FLIT Button Component
 * Boutons coins arrondis (radius 12) avec Inter Medium 13px (ultra compact)
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Styles de base FLIT
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Styles de variante
  const variantStyles = {
    primary: `bg-primary text-white hover:bg-primaryDark focus:ring-primary shadow-sm hover:shadow-md`,
    secondary: `bg-white text-textSecondary border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-300 shadow-sm hover:shadow-md`,
    outline: `bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary`,
    ghost: `bg-transparent text-textSecondary hover:bg-gray-100 focus:ring-gray-300`,
  };

  // Styles de taille (Inter Medium 13px - ultra compact)
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-button font-medium', // Inter Medium 13px - ultra compact
    lg: 'px-4 py-2 text-button font-medium',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
