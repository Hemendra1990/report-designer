'use client';

import { X } from 'lucide-react';

interface HeaderProps {
  title: string;
  onClose?: () => void;
}

export function ModalHeader({ title, onClose }: HeaderProps) {
  return (
    <div className="flex justify-between items-center p-6 pb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
}

export function SelectField({ label, required, className = '', ...props }: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label className="block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
}

export function ChartContainer({ children, title }: ChartContainerProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-medium">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
} 