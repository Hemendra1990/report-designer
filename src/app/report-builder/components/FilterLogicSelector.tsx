import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FilterLogicSelectorProps {
  filterLogic: 'and' | 'or' | 'custom';
  setFilterLogic: (value: 'and' | 'or' | 'custom') => void;
  customFormula: string;
  setCustomFormula: (value: string) => void;
}

const FilterLogicSelector: React.FC<FilterLogicSelectorProps> = ({
  filterLogic,
  setFilterLogic,
  customFormula,
  setCustomFormula
}) => {
  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      <div className="flex flex-col space-y-3">
        <div className="text-sm">
          <span className="font-medium">Filter Logic:</span>
        </div>
        <div>
          <Select
            value={filterLogic}
            onValueChange={(value: 'and' | 'or' | 'custom') => setFilterLogic(value)}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">AND (1 AND 2 AND 3)</SelectItem>
              <SelectItem value="or">OR (1 OR 2 OR 3)</SelectItem>
              <SelectItem value="custom">Custom Formula</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-gray-500">
          {filterLogic === 'and' ? 'All conditions must be true' :
            filterLogic === 'or' ? 'Any condition can be true' :
              'Define a custom formula'}
        </div>
      </div>

      {filterLogic === 'custom' && (
        <div className="mt-3">
          <Textarea
            placeholder="Enter custom formula (e.g., 1 AND (2 OR 3))"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            className="text-xs"
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