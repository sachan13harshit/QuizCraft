import React, { forwardRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  icon,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const baseClasses = 'w-full px-4 py-3 text-gray-900 bg-white border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400';
    
  const classes = `${baseClasses} ${stateClasses} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${classes} ${icon ? 'pl-12' : ''} ${type === 'password' ? 'pr-12' : ''}`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 