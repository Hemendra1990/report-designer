import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InfoIcon } from "@/components/icons";

interface FilterLogicSelectorProps {
  filterLogic: 'and' | 'or' | 'custom';
  setFilterLogic: (value: 'and' | 'or' | 'custom') => void;
  customFormula: string;
  setCustomFormula: (value: string) => void;
  className?: string;
}

const FilterLogicSelector: React.FC<FilterLogicSelectorProps> = ({
  filterLogic,
  setFilterLogic,
  customFormula,
  setCustomFormula,
  className = ""
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <Select
          value={filterLogic}
          onValueChange={(value: 'and' | 'or' | 'custom') => setFilterLogic(value)}
        >
          <SelectTrigger className="w-[140px] h-7 text-xs">
            <SelectValue placeholder="Logic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and" className="text-xs">AND (1 AND 2 AND 3)</SelectItem>
            <SelectItem value="or" className="text-xs">OR (1 OR 2 OR 3)</SelectItem>
            <SelectItem value="custom" className="text-xs">Custom Formula</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-500 flex items-center">
          {filterLogic === 'and' ? 'All conditions must be true' :
           filterLogic === 'or' ? 'Any condition can be true' :
           'Define a custom formula'}
          <InfoIcon size={12} className="ml-1 text-gray-400" />
        </span>
      </div>

      {filterLogic === 'custom' && (
        <div className="mt-2 w-full">
          <Textarea
            placeholder="Enter custom formula (e.g., 1 AND (2 OR 3))"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            className="text-xs h-16 min-h-0"
          />
          <div className="text-xs text-gray-500 mt-1">
            Use numbers to reference filters (e.g., 1, 2, 3) and combine with AND, OR, NOT
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterLogicSelector; 