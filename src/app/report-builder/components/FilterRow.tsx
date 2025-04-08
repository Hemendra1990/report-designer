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
        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full py-1 px-3 text-sm shadow-sm cursor-pointer hover:bg-gray-50 group"
      >
        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full h-5 w-5 text-xs font-medium">
          {index}
        </span>
        <span className="font-medium text-gray-700">{field.name}</span>
        <span className="text-gray-500">{operator}</span>
        <span className="text-gray-900 font-medium truncate max-w-[150px]">{value || '...'}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-gray-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <CrossIcon size={12} />
        </button>
      </div>
    );
  };

  // Renders the expanded filter interface
  const renderExpandedView = () => {
    return (
      <Card className="w-full shadow-sm border border-gray-200">
        <CardHeader className="py-2 px-3 flex flex-row items-center justify-between bg-gray-50 border-b">
          <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full h-5 w-5 text-xs font-medium">
              {index}
            </span>
            Filter By
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={toggleExpanded}
            >
              <ChevronDownIcon size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              onClick={onRemove}
            >
              <CrossIcon size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {/* Field selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Field</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                {getFieldIcon(field.type)}
              </span>
              <span className="text-sm font-medium">{field.name}</span>
              <button onClick={(e) => e.preventDefault()} className="ml-auto">
                <CrossIcon size={12} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Operator selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Operator</label>
            <Select
              value={operator}
              onValueChange={(newOperator) => onUpdate({ operator: newOperator })}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value} className="text-sm">{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value input based on field type and operator */}
          {!['is_empty', 'is_not_empty'].includes(operator) && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Value</label>
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
          )}

          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs mr-2"
              onClick={toggleExpanded}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
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