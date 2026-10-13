import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading properties...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[300px]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
