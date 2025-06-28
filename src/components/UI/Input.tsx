import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  icon: Icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`
          block w-full rounded-lg border-2 border-gray-200 bg-white/50 backdrop-blur-sm
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
          text-gray-900 placeholder-gray-500
          transition-all duration-200
          focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;