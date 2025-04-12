import { Input } from "@/components/ui/input";
import { Field, FieldType } from "../model/Field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operator } from "../model/Operator";
import { FilterState } from "../model/Filter";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Helper function to render single value input based on field type
export function renderSingleValueInput(field: Field, value: string, setValue: (value: string) => void): React.ReactNode {
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'email':
      case 'phone':
        return (
          <Input
            type="text"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
  
      case 'number':
      case 'currency':
        return (
          <Input
            type="number"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
  
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
  
      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
  
      case 'picklist':
        // Mock picklist values for demo
        const options = [
          { value: 'technology', label: 'Technology' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'finance', label: 'Finance' },
          { value: 'retail', label: 'Retail' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'education', label: 'Education' },
          { value: 'other', label: 'Other' }
        ];
  
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
  
      case 'lookup':
      case 'user':
        return (
          <div>
            <Input
              type="text"
              placeholder="Search..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-1">Type to search for records</div>
          </div>
        );
  
      case 'checkbox':
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
  
      default:
        return (
          <Input
            type="text"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
    }
  }

  // Helper function to get operators for field type
export function getOperatorsForType(type: FieldType): Operator[] {
    const textOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' },
      { value: 'contains', label: 'contains' },
      { value: 'not_contains', label: 'does not contain' },
      { value: 'starts_with', label: 'starts with' },
      { value: 'ends_with', label: 'ends with' },
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' }
    ];
  
    const numberOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' },
      { value: 'greater_than', label: 'greater than' },
      { value: 'less_than', label: 'less than' },
      { value: 'greater_or_equal', label: 'greater or equal' },
      { value: 'less_or_equal', label: 'less or equal' },
      { value: 'between', label: 'between' },
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' }
    ];
  
    const dateOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' },
      { value: 'greater_than', label: 'after' },
      { value: 'less_than', label: 'before' },
      { value: 'between', label: 'date range' },
      { value: 'last_n_days', label: 'last N days' },
      { value: 'next_n_days', label: 'next N days' },
      { value: 'current_fiscal_year', label: 'current fiscal year' },
      { value: 'current_fiscal_quarter', label: 'current fiscal quarter' },
      { value: 'last_fiscal_year', label: 'last fiscal year' },
      { value: 'this_year', label: 'this year' },
      { value: 'this_month', label: 'this month' },
      { value: 'last_month', label: 'last month' },
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' }
    ];
  
    const picklistOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' },
      { value: 'includes', label: 'includes' },
      { value: 'excludes', label: 'excludes' },
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' }
    ];
  
    const lookupOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' },
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' }
    ];
  
    const checkboxOperators: Operator[] = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'not equals' }
    ];
  
    switch (type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'email':
      case 'phone':
        return textOperators;
      case 'number':
      case 'currency':
        return numberOperators;
      case 'date':
      case 'datetime':
        return dateOperators;
      case 'picklist':
      case 'multipicklist':
        return picklistOperators;
      case 'lookup':
      case 'user':
        return lookupOperators;
      case 'checkbox':
        return checkboxOperators;
      default:
        return textOperators;
    }
  }
  
  // Helper function to render the appropriate value input based on field type and operator
  export function renderValueInput(field: Field, operator: string, state: FilterState): React.ReactNode {
    const { value, setValue, rangeStart, setRangeStart, rangeEnd, setRangeEnd, selectedOptions, setSelectedOptions } = state;
  
    // Handle operators that don't need value inputs
    if (['is_empty', 'is_not_empty'].includes(operator)) {
      return null;
    }
  
    // Special handling for date/datetime fields
    if ((field.type === 'date' || field.type === 'datetime') && !['between', 'last_n_days', 'next_n_days'].includes(operator)) {
      return (
        <div>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="next_week">Next Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="next_month">Next Month</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Date...</SelectItem>
            </SelectContent>
          </Select>
  
          {value === 'custom' && (
            <div className="mt-3">
              <Label className="text-xs mb-1 block">Select specific date</Label>
              <Input
                type={field.type === 'datetime' ? "datetime-local" : "date"}
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
      );
    }
  
    // Special handling for "between" operator for date/datetime fields
    if ((field.type === 'date' || field.type === 'datetime') && operator === 'between') {
      return (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-3">
            <div className="text-sm font-medium text-blue-800">Date Range Filter</div>
            <div className="text-xs text-blue-600 mt-1">Select a start and end date for your range</div>
          </div>
  
          <div>
            <Label className="text-xs mb-1 block">From</Label>
            <Select value={rangeStart} onValueChange={setRangeStart}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Start date option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="start_of_week">Start of Week</SelectItem>
                <SelectItem value="start_of_month">Start of Month</SelectItem>
                <SelectItem value="start_of_quarter">Start of Quarter</SelectItem>
                <SelectItem value="start_of_year">Start of Year</SelectItem>
                <SelectItem value="custom">Custom Date...</SelectItem>
              </SelectContent>
            </Select>
  
            {rangeStart === 'custom' && (
              <Input
                type={field.type === 'datetime' ? "datetime-local" : "date"}
                value={rangeStart !== 'custom' ? '' : state.value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
  
          <div>
            <Label className="text-xs mb-1 block">To</Label>
            <Select value={rangeEnd} onValueChange={setRangeEnd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="End date option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="end_of_week">End of Week</SelectItem>
                <SelectItem value="end_of_month">End of Month</SelectItem>
                <SelectItem value="end_of_quarter">End of Quarter</SelectItem>
                <SelectItem value="end_of_year">End of Year</SelectItem>
                <SelectItem value="custom">Custom Date...</SelectItem>
              </SelectContent>
            </Select>
  
            {rangeEnd === 'custom' && (
              <Input
                type={field.type === 'datetime' ? "datetime-local" : "date"}
                value={rangeEnd !== 'custom' ? '' : state.selectedOptions[0] || ''}
                onChange={(e) => setSelectedOptions([e.target.value])}
                className="mt-2"
              />
            )}
          </div>
        </div>
      );
    }
  
    // Special handling for "last_n_days" and "next_n_days"
    if (['last_n_days', 'next_n_days'].includes(operator)) {
      return (
        <div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Number of days"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
            />
            <div className="text-sm text-gray-500">days</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {operator === 'last_n_days' ? 'Past' : 'Next'} N days {operator === 'last_n_days' ? 'before' : 'after'} today
          </div>
        </div>
      );
    }
  
    // Special handling for relative date operators
    if (['current_fiscal_year', 'current_fiscal_quarter', 'last_fiscal_year', 'this_year', 'this_month', 'last_month'].includes(operator)) {
      return (
        <div className="text-xs text-gray-500 italic">
          No additional input needed for this filter.
        </div>
      );
    }
  
    // Special handling for "between" operator for non-date fields
    if (operator === 'between' && field.type !== 'date' && field.type !== 'datetime') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block text-xs">From</Label>
            {renderSingleValueInput(field, rangeStart, setRangeStart)}
          </div>
          <div>
            <Label className="mb-1 block text-xs">To</Label>
            {renderSingleValueInput(field, rangeEnd, setRangeEnd)}
          </div>
        </div>
      );
    }
  
    // Special handling for picklists when using includes/excludes
    if ((field.type === 'picklist' || field.type === 'multipicklist') && ['includes', 'excludes'].includes(operator)) {
      // Mock picklist values for demo
      const options = [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'retail', label: 'Retail' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' }
      ];
  
      return (
        <div className="space-y-2">
          {options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${option.value}`}
                checked={selectedOptions.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOptions([...selectedOptions, option.value]);
                  } else {
                    setSelectedOptions(selectedOptions.filter(v => v !== option.value));
                  }
                }}
              />
              <Label
                htmlFor={`${field.id}-${option.value}`}
                className="text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );
    }
  
    // Default case: render single value input
    return renderSingleValueInput(field, value, setValue);
  }

  // Helper function to get default operator based on field type
export function getDefaultOperator(type: FieldType): string {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'email':
      case 'phone':
        return 'contains';
      case 'number':
      case 'currency':
        return 'equals';
      case 'date':
      case 'datetime':
        return 'equals';
      case 'picklist':
      case 'multipicklist':
        return 'equals';
      case 'lookup':
      case 'user':
        return 'equals';
      case 'checkbox':
        return 'equals';
      default:
        return 'equals';
    }
  }
  
  // Helper function to get field icon
  export function getFieldIcon(type: FieldType): string {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'email':
      case 'phone':
        return 'T';
      case 'number':
      case 'currency':
        return '#';
      case 'date':
      case 'datetime':
        return 'D';
      case 'picklist':
      case 'multipicklist':
        return 'L';
      case 'lookup':
      case 'user':
        return 'R';
      case 'checkbox':
        return '✓';
      default:
        return 'F';
    }
  }