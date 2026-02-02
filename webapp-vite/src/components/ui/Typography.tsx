/**
 * FLIT Typography Components
 * Typographies basées sur Inter avec les tailles FLIT
 */

import React from 'react';

// Titre: Inter Semibold 20-28px
interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

export const Heading: React.FC<HeadingProps> = ({ children, className = '', level = 1 }) => {
  const styles = {
    1: 'text-title-lg font-semibold text-textPrimary', // 28px
    2: 'text-title-md font-semibold text-textPrimary', // 24px
    3: 'text-title-sm font-semibold text-textPrimary', // 20px
  };

  const combinedClassName = `${styles[level]} ${className}`;

  switch (level) {
    case 1:
      return <h1 className={combinedClassName}>{children}</h1>;
    case 2:
      return <h2 className={combinedClassName}>{children}</h2>;
    case 3:
      return <h3 className={combinedClassName}>{children}</h3>;
    default:
      return <h1 className={combinedClassName}>{children}</h1>;
  }
};

// Texte: Inter Regular 14-16px
interface TextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'disabled';
}

export const Text: React.FC<TextProps> = ({
  children,
  className = '',
  size = 'md',
  color = 'secondary',
}) => {
  const sizeStyles = {
    md: 'text-body-md', // 14px
    lg: 'text-body-lg', // 16px
  };

  const colorStyles = {
    primary: 'text-textPrimary',
    secondary: 'text-textSecondary',
    disabled: 'text-textDisabled',
  };

  return (
    <p className={`${sizeStyles[size]} ${colorStyles[color]} font-normal ${className}`}>
      {children}
    </p>
  );
};

// Prix: Semibold 16-18px
interface PriceProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'lg';
}

export const Price: React.FC<PriceProps> = ({ children, className = '', size = 'lg' }) => {
  const sizeStyles = {
    sm: 'text-price-sm', // 16px
    lg: 'text-price',    // 18px
  };

  return (
    <span className={`${sizeStyles[size]} font-semibold text-primary ${className}`}>
      {children}
    </span>
  );
};

export default { Heading, Text, Price };
