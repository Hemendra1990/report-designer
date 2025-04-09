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

  // Create a visual representation of the pivot structure
  const hasPivotConfig = pivotColumnIds.length > 0 && pivotValues.length > 0 && groupByFields.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <PivotTableIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Pivot Table Configuration</h3>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md">
          <Label htmlFor="pivot-active" className="text-sm font-medium text-slate-700">Enable Pivot</Label>
          <Switch 
            id="pivot-active" 
            checked={isPivotActive} 
            onCheckedChange={setIsPivotActive} 
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
      
      {isPivotActive && (
        <>
          <div className="grid grid-cols-1 gap-6">
            {/* Brief instructions */}
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 border border-blue-100">
              <p className="font-medium mb-1">How to create a pivot table:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Select fields for rows (Group By)</li>
                <li>Select fields for columns (Pivot)</li>
                <li>Select numeric fields to aggregate (Values)</li>
                <li>Click "Apply Pivot" to generate the table</li>
              </ol>
            </div>
            
            {/* Main config container */}
            <div className="rounded-md border border-slate-200 overflow-hidden">
              {/* Group By (Row) fields */}
              <div className="border-b border-slate-200">
                <div className="bg-slate-50 p-3 flex items-center gap-2">
                  <GroupIcon className="h-4 w-4 text-slate-700" />
                  <h4 className="font-medium text-slate-800">Rows (Group By Fields)</h4>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <Select 
                      value={selectedGroupByField} 
                      onValueChange={setSelectedGroupByField}
                    >
                      <SelectTrigger className="w-full h-9 bg-white">
                        <SelectValue placeholder="Select field for rows" />
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
                      className="shrink-0 bg-blue-600 hover:bg-blue-700"
                      size="sm" 
                      onClick={addGroupByField}
                      disabled={!selectedGroupByField || groupByFields.includes(selectedGroupByField)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Currently selected group by fields */}
                  {groupByFields.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {groupByFields.map(fieldId => (
                        <div key={fieldId} className="flex items-center bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-sm">
                          <span className="font-medium text-slate-700">{getFieldNameById(fieldId)}</span>
                          <button 
                            className="ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 h-5 w-5 rounded-full flex items-center justify-center"
                            onClick={() => removeGroupByField(fieldId)}
                            title="Remove field"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No row fields selected</p>
                  )}
                </div>
              </div>
              
              {/* Pivot On (Column) fields */}
              <div className="border-b border-slate-200">
                <div className="bg-slate-50 p-3 flex items-center gap-2">
                  <PivotTableIcon className="h-4 w-4 text-slate-700" />
                  <h4 className="font-medium text-slate-800">Columns (Pivot Fields)</h4>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <Select 
                      value={selectedPivotField} 
                      onValueChange={setSelectedPivotField}
                    >
                      <SelectTrigger className="w-full h-9 bg-white">
                        <SelectValue placeholder="Select field for columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {pivotableFields.length > 0 ? (
                          pivotableFields.map(col => (
                            <SelectItem 
                              key={col.id} 
                              value={col.id}
                              disabled={pivotColumnIds.includes(col.id)}
                            >
                              {col.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No categorical fields available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      className="shrink-0 bg-blue-600 hover:bg-blue-700"
                      size="sm" 
                      onClick={addPivotField}
                      disabled={!selectedPivotField || pivotColumnIds.includes(selectedPivotField)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Currently selected pivot fields */}
                  {pivotColumnIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pivotColumnIds.map(fieldId => (
                        <div key={fieldId} className="flex items-center bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-sm">
                          <span className="font-medium text-blue-700">{getFieldNameById(fieldId)}</span>
                          <button 
                            className="ml-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 h-5 w-5 rounded-full flex items-center justify-center"
                            onClick={() => removePivotField(fieldId)}
                            title="Remove field"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No column fields selected</p>
                  )}
                </div>
              </div>
              
              {/* Value fields with aggregation */}
              <div>
                <div className="bg-slate-50 p-3 flex items-center gap-2">
                  <AggregateIcon className="h-4 w-4 text-slate-700" />
                  <h4 className="font-medium text-slate-800">Values (Aggregation)</h4>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <Select 
                      value={selectedValueField} 
                      onValueChange={setSelectedValueField}
                    >
                      <SelectTrigger className="w-full h-9 bg-white">
                        <SelectValue placeholder="Select field to aggregate" />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregatableFields.length > 0 ? (
                          aggregatableFields.map(col => (
                            <SelectItem 
                              key={col.id} 
                              value={col.id}
                              disabled={pivotValues.includes(col.id)}
                            >
                              {col.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No numeric fields available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      className="shrink-0 bg-blue-600 hover:bg-blue-700"
                      size="sm" 
                      onClick={addValueField}
                      disabled={!selectedValueField || pivotValues.includes(selectedValueField)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Value fields with aggregation functions */}
                  {pivotValues.length > 0 ? (
                    <div className="space-y-2">
                      {pivotValues.map(fieldId => (
                        <div key={fieldId} className="flex items-center bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                          <span className="font-medium text-green-700 mr-2">{getFieldNameById(fieldId)}</span>
                          <Select 
                            value={selectedAggregations[fieldId] || 'SUM'} 
                            onValueChange={(value) => changeAggregation(fieldId, value)}
                          >
                            <SelectTrigger className="h-7 w-24 bg-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregationFunctions.map(func => (
                                <SelectItem key={func} value={func}>{func}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <button 
                            className="ml-auto text-green-400 hover:text-green-600 hover:bg-green-100 h-6 w-6 rounded-full flex items-center justify-center"
                            onClick={() => removeValueField(fieldId)}
                            title="Remove field"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No value fields selected</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Visual preview */}
            {hasPivotConfig && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-md p-3 shadow-sm">
                <h4 className="text-xs uppercase font-semibold text-slate-600 mb-2 tracking-wide">Pivot Structure</h4>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div className="bg-white shadow-sm border border-slate-200 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-700 mb-0.5 flex items-center">
                      <span className="h-2 w-2 bg-slate-400 rounded-full mr-1.5"></span>
                      Rows
                    </div>
                    <div className="text-slate-600 truncate max-w-[100px]">
                      {groupByFields.map(id => getFieldNameById(id)).join(', ')}
                    </div>
                  </div>
                  
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 12h12M12 6v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="bg-white shadow-sm border border-blue-100 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-700 mb-0.5 flex items-center">
                      <span className="h-2 w-2 bg-blue-400 rounded-full mr-1.5"></span>
                      Columns
                    </div>
                    <div className="text-blue-600 truncate max-w-[100px]">
                      {pivotColumnIds.map(id => getFieldNameById(id)).join(', ')}
                    </div>
                  </div>
                  
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="bg-white shadow-sm border border-green-100 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-700 mb-0.5 flex items-center">
                      <span className="h-2 w-2 bg-green-400 rounded-full mr-1.5"></span>
                      Values
                    </div>
                    <div className="text-green-600 truncate max-w-[150px]">
                      {pivotValues.map(id => 
                        `${selectedAggregations[id] || 'SUM'}(${getFieldNameById(id)})`
                      ).join(', ')}
                    </div>
                  </div>
                </div>
                
                {/* Visual representation */}
                <div className="mt-3 bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[max-content_1fr] h-24">
                    {/* Top-left corner */}
                    <div className="border-r border-b border-slate-200 p-1 bg-slate-50 flex items-center justify-center">
                      <div className="w-4 h-4"></div>
                    </div>
                    
                    {/* Column headers */}
                    <div className="border-b border-slate-200 p-1 bg-blue-50 flex items-center justify-center overflow-hidden text-[10px] font-medium text-blue-700">
                      <div className="whitespace-nowrap text-center">
                        {pivotColumnIds.length === 1 ? (
                          <span className="px-1">{getFieldNameById(pivotColumnIds[0])}</span>
                        ) : (
                          <span className="px-1">Pivot Columns</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Row headers */}
                    <div className="border-r border-slate-200 p-1 bg-slate-50 flex flex-col items-center justify-center overflow-hidden text-[10px] font-medium text-slate-700">
                      <div className="whitespace-nowrap text-center">
                        {groupByFields.length === 1 ? (
                          <span className="px-1">{getFieldNameById(groupByFields[0])}</span>
                        ) : (
                          <span className="px-1">Group By</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Values grid cells */}
                    <div className="bg-green-50 p-0.5 grid grid-cols-3 grid-rows-3 gap-0.5">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-white rounded-sm shadow-sm text-[9px] flex items-center justify-center text-green-700 border border-green-100">
                          {pivotValues.length === 1 ? (
                            <span className="truncate px-1">
                              {selectedAggregations[pivotValues[0]] || 'SUM'}
                            </span>
                          ) : (
                            <span className="truncate px-1">Values</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Apply button */}
            <div className="flex justify-end pt-2">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={onApplyPivot}
                disabled={!pivotColumnIds.length || !pivotValues.length}
              >
                Apply Pivot
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PivotOptions; 