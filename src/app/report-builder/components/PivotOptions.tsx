import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Field, toField } from "../model/Field";
import { AggregateIcon, PivotTableIcon, GroupIcon } from "@/components/icons/ReportIcons";

interface PivotOptionsProps {
  selectedColumns: any[]; // Accept any type of column object
  isPivotActive: boolean;
  setIsPivotActive: (active: boolean) => void;
  pivotColumnIds: string[];
  setPivotColumnIds: (ids: string[]) => void;
  pivotValues: string[];
  setPivotValues: (values: string[]) => void;
  groupByFields: string[];
  setGroupByFields: (fields: string[]) => void;
  aggregationFunctions: string[];
  selectedAggregations: Record<string, string>;
  setSelectedAggregations: (aggs: Record<string, string>) => void;
  onApplyPivot: () => void;
}

const PivotOptions: React.FC<PivotOptionsProps> = ({
  selectedColumns,
  isPivotActive,
  setIsPivotActive,
  pivotColumnIds,
  setPivotColumnIds,
  pivotValues,
  setPivotValues,
  groupByFields,
  setGroupByFields,
  aggregationFunctions,
  selectedAggregations,
  setSelectedAggregations,
  onApplyPivot
}) => {
  // Local state for UI interactions
  const [selectedPivotField, setSelectedPivotField] = useState<string>('');
  const [selectedValueField, setSelectedValueField] = useState<string>('');
  const [selectedGroupByField, setSelectedGroupByField] = useState<string>('');
  
  // Fields that can be pivoted (categorical fields like picklists, text)
  const pivotableFields = selectedColumns.filter(col => 
    ['text', 'picklist', 'user', 'lookup'].includes(col.type as string)
  );
  
  // Fields that can be aggregated (numeric fields)
  const aggregatableFields = selectedColumns.filter(col => 
    ['number', 'currency', 'percent'].includes(col.type as string)
  );
  
  // Helper to add a field to pivot on
  const addPivotField = () => {
    if (selectedPivotField && !pivotColumnIds.includes(selectedPivotField)) {
      setPivotColumnIds([...pivotColumnIds, selectedPivotField]);
      setSelectedPivotField('');
    }
  };
  
  // Helper to add a field to aggregate
  const addValueField = () => {
    if (selectedValueField && !pivotValues.includes(selectedValueField)) {
      setPivotValues([...pivotValues, selectedValueField]);
      
      // Default to SUM for numeric fields
      setSelectedAggregations({
        ...selectedAggregations,
        [selectedValueField]: 'SUM'
      });
      
      setSelectedValueField('');
    }
  };
  
  // Helper to add a group by field
  const addGroupByField = () => {
    if (selectedGroupByField && !groupByFields.includes(selectedGroupByField)) {
      setGroupByFields([...groupByFields, selectedGroupByField]);
      setSelectedGroupByField('');
    }
  };
  
  // Remove a pivot field
  const removePivotField = (fieldId: string) => {
    setPivotColumnIds(pivotColumnIds.filter(id => id !== fieldId));
  };
  
  // Remove a value field
  const removeValueField = (fieldId: string) => {
    setPivotValues(pivotValues.filter(id => id !== fieldId));
    
    // Remove from aggregations as well
    const newAggregations = { ...selectedAggregations };
    delete newAggregations[fieldId];
    setSelectedAggregations(newAggregations);
  };
  
  // Remove a group by field
  const removeGroupByField = (fieldId: string) => {
    setGroupByFields(groupByFields.filter(id => id !== fieldId));
  };
  
  // Change the aggregation function for a value field
  const changeAggregation = (fieldId: string, aggregation: string) => {
    setSelectedAggregations({
      ...selectedAggregations,
      [fieldId]: aggregation
    });
  };
  
  // Get field name by id
  const getFieldNameById = (fieldId: string) => {
    const field = selectedColumns.find(col => col.id === fieldId);
    return field ? field.name : fieldId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PivotTableIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Pivot Table</h3>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="pivot-active" className="text-sm">Enable Pivot</Label>
          <Switch 
            id="pivot-active" 
            checked={isPivotActive} 
            onCheckedChange={setIsPivotActive} 
          />
        </div>
      </div>
      
      {isPivotActive && (
        <>
          <div className="rounded-md border border-slate-200 p-4 space-y-4">
            {/* Group By (Row) fields */}
            <div>
              <Label className="text-sm font-medium mb-2 block text-slate-700">
                <GroupIcon className="h-4 w-4 inline-block mr-1 text-slate-500" />
                Group By Fields (ROWS)
              </Label>
              <div className="flex gap-2 mt-2">
                <Select 
                  value={selectedGroupByField} 
                  onValueChange={setSelectedGroupByField}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select field to group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedColumns.map(col => (
                      <SelectItem 
                        key={col.id} 
                        value={col.id}
                        disabled={groupByFields.includes(col.id)}
                      >
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={addGroupByField}
                  disabled={!selectedGroupByField || groupByFields.includes(selectedGroupByField)}
                >
                  Add
                </Button>
              </div>
              
              {/* Display currently selected group by fields */}
              {groupByFields.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {groupByFields.map(fieldId => (
                    <div key={fieldId} className="flex items-center bg-slate-100 px-2 py-1 rounded-md text-sm">
                      <span>{getFieldNameById(fieldId)}</span>
                      <button 
                        className="ml-2 text-slate-400 hover:text-slate-600"
                        onClick={() => removeGroupByField(fieldId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pivot On (Column) fields */}
            <div>
              <Label className="text-sm font-medium mb-2 block text-slate-700">
                <PivotTableIcon className="h-4 w-4 inline-block mr-1 text-slate-500" />
                Pivot Fields (COLUMNS)
              </Label>
              <div className="flex gap-2 mt-2">
                <Select 
                  value={selectedPivotField} 
                  onValueChange={setSelectedPivotField}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select field to pivot on" />
                  </SelectTrigger>
                  <SelectContent>
                    {pivotableFields.map(col => (
                      <SelectItem 
                        key={col.id} 
                        value={col.id}
                        disabled={pivotColumnIds.includes(col.id)}
                      >
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={addPivotField}
                  disabled={!selectedPivotField || pivotColumnIds.includes(selectedPivotField)}
                >
                  Add
                </Button>
              </div>
              
              {/* Display currently selected pivot fields */}
              {pivotColumnIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pivotColumnIds.map(fieldId => (
                    <div key={fieldId} className="flex items-center bg-blue-50 px-2 py-1 rounded-md text-sm">
                      <span>{getFieldNameById(fieldId)}</span>
                      <button 
                        className="ml-2 text-blue-400 hover:text-blue-600"
                        onClick={() => removePivotField(fieldId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Value fields with aggregation */}
            <div>
              <Label className="text-sm font-medium mb-2 block text-slate-700">
                <AggregateIcon className="h-4 w-4 inline-block mr-1 text-slate-500" />
                Aggregation Values
              </Label>
              <div className="flex gap-2 mt-2">
                <Select 
                  value={selectedValueField} 
                  onValueChange={setSelectedValueField}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select field to aggregate" />
                  </SelectTrigger>
                  <SelectContent>
                    {aggregatableFields.map(col => (
                      <SelectItem 
                        key={col.id} 
                        value={col.id}
                        disabled={pivotValues.includes(col.id)}
                      >
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={addValueField}
                  disabled={!selectedValueField || pivotValues.includes(selectedValueField)}
                >
                  Add
                </Button>
              </div>
              
              {/* Display currently selected value fields with aggregation selectors */}
              {pivotValues.length > 0 && (
                <div className="mt-3 space-y-2">
                  {pivotValues.map(fieldId => (
                    <div key={fieldId} className="flex items-center p-2 bg-gray-50 rounded-md">
                      <span className="flex-1 font-medium text-sm">{getFieldNameById(fieldId)}</span>
                      <Select 
                        value={selectedAggregations[fieldId] || 'SUM'} 
                        onValueChange={(value) => changeAggregation(fieldId, value)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aggregationFunctions.map(agg => (
                            <SelectItem key={agg} value={agg} className="text-xs">
                              {agg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button 
                        className="ml-2 text-slate-400 hover:text-slate-600"
                        onClick={() => removeValueField(fieldId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={onApplyPivot}
              disabled={pivotColumnIds.length === 0 || pivotValues.length === 0}
            >
              Apply Pivot
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PivotOptions; 