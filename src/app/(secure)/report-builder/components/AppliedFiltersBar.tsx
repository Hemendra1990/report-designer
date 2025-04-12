import React from 'react';
import { Filter } from '../model/Filter';

interface AppliedFiltersBarProps {
  filters: Filter[];
  onRemoveFilter: (filterId: string) => void;
}

const AppliedFiltersBar: React.FC<AppliedFiltersBarProps> = ({ 
  filters, 
  onRemoveFilter 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4 flex gap-3 text-xs flex-wrap">
      {filters.map((filter) => (
        <div key={filter.id} className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 flex items-center gap-1">
          <span className="font-medium">{filter.field.name}</span>
          <span className="text-gray-500">{filter.operator}</span>
          {filter.value && <span className="text-gray-500">• {filter.value}</span>}
          {filter.rangeStart && filter.rangeEnd && (
            <span className="text-gray-500">• {filter.rangeStart} to {filter.rangeEnd}</span>
          )}
          {filter.selectedOptions && filter.selectedOptions.length > 0 && (
            <span className="text-gray-500">• {filter.selectedOptions.join(', ')}</span>
          )}
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      ))}
      {filters.length === 0 && (
        <div className="text-gray-500">No filters applied</div>
      )}
    </div>
  );
};

export default AppliedFiltersBar; 