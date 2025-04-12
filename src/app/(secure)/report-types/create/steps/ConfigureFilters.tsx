"use client";

import { useState } from 'react';
import { useReportType } from '@/contexts/ReportTypeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
] as const;

type Operator = typeof operators[number]['value'];

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'list', label: 'List' },
] as const;

type FieldType = typeof fieldTypes[number]['value'];

export default function ConfigureFilters() {
  const { state, dispatch } = useReportType();
  const [field, setField] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [operator, setOperator] = useState<Operator>('equals');
  const [defaultValue, setDefaultValue] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  const handleAddFilter = () => {
    if (field && fieldType && operator) {
      dispatch({
        type: 'ADD_FILTER',
        payload: {
          field,
          fieldType,
          operator,
          defaultValue,
          isRequired,
        },
      });
      // Reset form
      setField('');
      setFieldType('text');
      setOperator('equals');
      setDefaultValue('');
      setIsRequired(false);
    }
  };

  const handleRemoveFilter = (index: number) => {
    dispatch({
      type: 'REMOVE_FILTER',
      payload: index,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Configure Filters</h2>
        <p className="text-muted-foreground mb-4">
          Define filters that users can apply when running this report type.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Filter</CardTitle>
          <CardDescription>
            Configure filter options for your report type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Field Name</Label>
              <Input
                placeholder="Enter field name"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </div>
            <div>
              <Label>Field Type</Label>
              <Select
                value={fieldType}
                onValueChange={(value: FieldType) => setFieldType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Operator</Label>
              <Select
                value={operator}
                onValueChange={(value: Operator) => setOperator(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Value</Label>
              <Input
                placeholder="Enter default value"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isRequired">Required Filter</Label>
          </div>

          <Button
            onClick={handleAddFilter}
            disabled={!field || !fieldType || !operator}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Filter
          </Button>
        </CardContent>
      </Card>

      {state.reportType.filters.length > 0 && (
        <div className="space-y-2">
          <Label>Configured Filters</Label>
          {state.reportType.filters.map((filter, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{filter.field}</span>
                    <span className="text-sm text-muted-foreground">
                      ({filter.fieldType})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filter.operator}
                    {filter.defaultValue && ` • Default: ${filter.defaultValue}`}
                    {filter.isRequired && ' • Required'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 