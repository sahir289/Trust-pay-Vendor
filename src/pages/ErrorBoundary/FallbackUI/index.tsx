import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-light dark:bg-darkmode-700 flex items-center justify-center p-4 font-public-sans">
      <div className="w-full max-w-md mx-auto bg-theme-1  rounded-lg shadow-lg p-6 md:p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <svg
            className="w-12 h-12 text-danger dark:text-danger/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-dark dark:text-light text-center mb-4 font-public-sans">
          Something went wrong
        </h2>
        
        <p className="text-dark/80 dark:text-light/80 text-center mb-6 text-sm md:text-base font-dm-sans">
          {error?.message || 'An unexpected error occurred. Please try again later.'}
        </p>

        {/* will add Reset Button after completing everything */}
        {resetError && (
          <div className="flex justify-center">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary text-light dark:bg-primary/90 dark:text-darkmode-100 
                rounded-md hover:bg-primary/80 dark:hover:bg-primary focus:outline-none focus:ring-2 
                focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-darkmode-800 
                transition-colors duration-200 text-sm md:text-base font-dm-sans"
            >
              Try Again
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-xs md:text-sm text-dark/60 dark:text-light/60 font-dm-sans">
          Need help?{' '}
          <a
            href="/"
            className="text-info dark:text-info/80 hover:underline font-dm-sans"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};