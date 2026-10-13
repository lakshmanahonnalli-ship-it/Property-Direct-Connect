import React from 'react';
import { Home, SearchX, RotateCcw } from 'lucide-react';

const EmptyState = ({
  title = 'No properties found',
  description = 'Try broadening your search criteria or resetting filters to find more properties.',
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-8 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
