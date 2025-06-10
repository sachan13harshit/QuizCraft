import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  shadow = 'md',
  gradient = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl border border-gray-200 transition-all duration-300';
  
  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:scale-105 hover:border-gray-300 cursor-pointer' 
    : '';
    
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const gradientClasses = gradient 
    ? 'bg-gradient-to-br from-white to-gray-50' 
    : '';
    
  const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${gradientClasses} ${className}`;
  
  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
Card.Header = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-6 ${className}`}>
    {children}
  </div>
);

// Card Title Component  
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-900 ${className}`}>
    {children}
  </h3>
);

// Card Content Component
Card.Content = ({ children, className = '' }) => (
  <div className={`text-gray-600 ${className}`}>
    {children}
  </div>
);

// Card Footer Component
Card.Footer = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-4 mt-6 ${className}`}>
    {children}
  </div>
);

export default Card; 