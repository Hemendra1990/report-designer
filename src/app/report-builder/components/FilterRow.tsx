import { useState } from "react";
import { getFieldIcon, getOperatorsForType, renderValueInput } from "../helper/ReportBuilderHelper";
import { Filter } from "../model/Filter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CrossIcon, ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface FilterRowProps {
  filter: Filter;
  onRemove: () => void;
  onUpdate: (updates: Partial<Filter>) => void;
  index: number;
  isActive?: boolean;
  onToggle?: () => void;
}

export function FilterRow({
  filter,
  onRemove,
  onUpdate,
  index,
  isActive = false,
  onToggle = () => {}
}: FilterRowProps) {
  const { field, operator, value, rangeStart, rangeEnd, selectedOptions } = filter;
  const [expanded, setExpanded] = useState(isActive);

  // Get appropriate operators based on field type
  const operators = getOperatorsForType(field.type);

  // Get the display name with fallbacks
  const getDisplayName = () => {
    return field.duckDBColumnName || field.columnName || field.name;
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
    onToggle();
  };

  // Renders the filter as a compact pill when collapsed
  const renderCollapsedView = () => {
    return (
      <div 
        onClick={toggleExpanded}
        className="flex items-center gap-1 bg-white border border-gray-200 rounded-full py-0.5 px-2 text-xs shadow-sm cursor-pointer hover:bg-gray-50 hover:border-gray-300 group transition-all duration-150"
      >
        <span className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-full h-4 w-4 text-[10px] font-medium mr-0.5">
          {index}
        </span>
        <span className="font-medium text-gray-700 truncate max-w-[100px]">{getDisplayName()}</span>
        <span className="text-gray-500 mx-0.5">{operator}</span>
        <span className="text-gray-900 font-medium truncate max-w-[100px]">{value || '...'}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 flex items-center justify-center"
        >
          <CrossIcon size={10} />
        </button>
      </div>
    );
  };

  // Renders the expanded filter interface
  const renderExpandedView = () => {
    return (
      <Card className="w-full shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="py-1.5 px-2.5 flex flex-row items-center justify-between bg-gray-50 border-b">
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <span className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-full h-4 w-4 text-[10px] font-medium">
              {index}
            </span>
            Filter By
          </div>
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              onClick={toggleExpanded}
            >
              <ChevronDownIcon size={12} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              onClick={onRemove}
            >
              <CrossIcon size={12} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2.5 space-y-2 text-xs">
          {/* Field selector */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Field</label>
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded border border-gray-200">
              <span className="text-gray-500 text-[11px]">
                {getFieldIcon(field.type)}
              </span>
              <span className="text-xs font-medium truncate">{getDisplayName()}</span>
              <button 
                onClick={(e) => e.preventDefault()} 
                className="ml-auto text-gray-400 hover:text-gray-600 p-0.5"
              >
                <CrossIcon size={10} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Operator selector */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Operator</label>
            <Select
              value={operator}
              onValueChange={(newOperator) => onUpdate({ operator: newOperator })}
            >
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value input based on field type and operator */}
          {!['is_empty', 'is_not_empty'].includes(operator) && (
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Value</label>
              <div className="text-xs">
                {renderValueInput(field, operator, {
                  value: value || '',
                  setValue: (newValue) => onUpdate({ value: newValue }),
                  rangeStart: rangeStart || '',
                  setRangeStart: (newValue) => onUpdate({ rangeStart: newValue }),
                  rangeEnd: rangeEnd || '',
                  setRangeEnd: (newValue) => onUpdate({ rangeEnd: newValue }),
                  selectedOptions: selectedOptions || [],
                  setSelectedOptions: (newOptions) => onUpdate({ selectedOptions: newOptions })
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1.5">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-[11px] mr-1.5"
              onClick={toggleExpanded}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
              onClick={toggleExpanded}
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return expanded ? renderExpandedView() : renderCollapsedView();
}