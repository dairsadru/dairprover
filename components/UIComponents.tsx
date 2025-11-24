import React from 'react';
import { X, Check, AlertTriangle, AlertCircle } from 'lucide-react';

// --- Inputs ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm
          focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
          ${className || ''}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400
          focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
          min-h-[80px] resize-y
          ${className || ''}
        `}
        {...props}
      />
    </div>
  );
};

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        {...props}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

// --- NEW VISUAL SELECTOR ---

export interface StatusOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  colorClass: string; // e.g., 'bg-green-100 text-green-700 border-green-200'
}

interface StatusSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: StatusOption[];
  className?: string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ label, value, onChange, options, className }) => {
  return (
    <div className={`w-full ${className || ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                text-xs font-semibold
                ${isSelected 
                  ? `${opt.colorClass} ring-2 ring-offset-1 ring-opacity-60` 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }
                ${isSelected ? 'shadow-md scale-[1.02]' : 'shadow-sm'}
              `}
            >
              <div className="mb-1">{opt.icon}</div>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Layout ---

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className || ''}`}>
    {title && (
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'gray' | 'green' | 'red' | 'blue' | 'yellow' }> = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3 flex items-center gap-2">
    {children}
  </h3>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = 
  ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white border-transparent shadow-sm',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-transparent',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
      outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    };
    
    return (
      <button
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          ${variants[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );
};

export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Centering hack */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
              <button onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <X size={20} />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose} className="w-full sm:w-auto sm:ml-3">
              Готово
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
