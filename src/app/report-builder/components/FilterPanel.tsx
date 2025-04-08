import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "../model/Filter";
import { Field } from "../model/Field";
import { FilterRow } from "./FilterRow";
import { PlusIcon, CrossIcon } from "@/components/icons";
import { v4 as uuidv4 } from 'uuid';
import FilterLogicSelector from "./FilterLogicSelector";

interface FilterPanelProps {
  filters: Filter[];
  fields: Field[];
  onFiltersChange: (filters: Filter[]) => void;
  filterLogic: 'and' | 'or' | 'custom';
  customFilterFormula: string;
  onFilterLogicChange: (logic: 'and' | 'or' | 'custom') => void;
  onCustomFormulaChange: (formula: string) => void;
  onClose?: () => void;
}

export function FilterPanel({ 
  filters, 
  fields, 
  onFiltersChange,
  filterLogic,
  customFilterFormula,
  onFilterLogicChange,
  onCustomFormulaChange,
  onClose
}: FilterPanelProps) {
  const [activeFilterIndex, setActiveFilterIndex] = useState<number | null>(null);
  
  // Add a new filter
  const addFilter = () => {
    // Select first text field as default
    const defaultField = fields.find(field => field.type === 'text') || fields[0];
    
    const newFilter: Filter = {
      id: uuidv4(),
      field: defaultField,
      operator: 'equals',
      value: '',
    };
    
    onFiltersChange([...filters, newFilter]);
    // Activate the newly added filter
    setActiveFilterIndex(filters.length);
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    onFiltersChange(updatedFilters);
    
    // Reset active filter if the active one was removed
    if (activeFilterIndex === index) {
      setActiveFilterIndex(null);
    } else if (activeFilterIndex !== null && activeFilterIndex > index) {
      // Adjust active index if a filter before the active one was removed
      setActiveFilterIndex(activeFilterIndex - 1);
    }
  };

  // Update a filter
  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], ...updates };
    onFiltersChange(updatedFilters);
  };

  // Handle filter toggling (expand/collapse)
  const handleFilterToggle = (index: number) => {
    setActiveFilterIndex(activeFilterIndex === index ? null : index);
  };

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="py-2 px-3 flex flex-row items-center justify-between bg-gray-50 border-b">
        <h3 className="text-sm font-medium text-gray-700">Filter By</h3>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <CrossIcon size={14} />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-3">
        {filters.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-3">
            No filters applied. Click "Add Filter" to create one.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {filters.map((filter, index) => (
              <FilterRow
                key={filter.id}
                filter={filter}
                index={index + 1}
                onRemove={() => removeFilter(index)}
                onUpdate={(updates) => updateFilter(index, updates)}
                isActive={activeFilterIndex === index}
                onToggle={() => handleFilterToggle(index)}
              />
            ))}
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-7 self-start"
            onClick={addFilter}
          >
            <PlusIcon size={12} className="mr-1" />
            Add Filter
          </Button>
          
          {filters.length > 1 && (
            <div className="border-t border-gray-100 pt-3">
              <FilterLogicSelector
                filterLogic={filterLogic}
                setFilterLogic={onFilterLogicChange}
                customFormula={customFilterFormula}
                setCustomFormula={onCustomFormulaChange}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 