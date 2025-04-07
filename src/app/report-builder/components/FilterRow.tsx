import { getFieldIcon, getOperatorsForType, renderValueInput } from "../helper/ReportBuilderHelper";
import { Filter } from "../model/Filter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrossIcon } from "@/components/icons";

// Update the FilterRow component to accept the new props
export function FilterRow({
    filter,
    onRemove,
    onUpdate,
    index
  }: {
    filter: Filter;
    onRemove: () => void;
    onUpdate: (updates: Partial<Filter>) => void;
    index: number;
  }) {
    const { field, operator, value, rangeStart, rangeEnd, selectedOptions } = filter;
  
    // Get appropriate operators based on field type
    const operators = getOperatorsForType(field.type);
  
    return (
      <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <span className="w-5 h-5 inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs">
              {index}
            </span>
            <span className="w-5 h-5 inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs">
              {getFieldIcon(field.type)}
            </span>
            {field.name}
          </h3>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600"
          >
            <CrossIcon size={16} />
          </button>
        </div>
  
        <div className="space-y-3">
          {/* Operator selector */}
          <div>
            <Select
              value={operator}
              onValueChange={(newOperator) => onUpdate({ operator: newOperator })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Value input based on field type and operator */}
          {renderValueInput(field, operator, {
            value,
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
    );
  }