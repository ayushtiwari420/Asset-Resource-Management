import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ label, error, helperText, leftAddon, rightAddon, className = '', required, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center group">
        {leftAddon && (
          <div className="absolute left-3 flex items-center text-gray-400 pointer-events-none z-10 group-focus-within:text-blue-500 transition-colors">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border px-3 py-2.5 text-sm placeholder-gray-400',
            'focus:outline-none focus:ring-2 transition-all duration-150',
            'hover:border-gray-400',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 bg-white',
            leftAddon && 'pl-9',
            rightAddon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 flex items-center text-gray-400 z-10">
            {rightAddon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
