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
    <div className="space-y-5">
      {/* Header with toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <PivotTableIcon className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Pivot Configuration</h3>
        </div>
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
          <Label htmlFor="pivot-active" className="text-xs font-medium text-slate-600 select-none">Enable</Label>
          <Switch 
            id="pivot-active" 
            checked={isPivotActive} 
            onCheckedChange={setIsPivotActive} 
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>
      
      {isPivotActive && (
        <div className="grid grid-cols-1 gap-4 animate-fadeIn">
          {/* Main config container */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {/* Group By (Row) fields */}
            <div className="border-b border-slate-200">
              <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-2 flex items-center gap-2">
                <GroupIcon className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Rows</h4>
              </div>
              
              <div className="p-3">
                <div className="flex gap-2 mb-2">
                  <Select 
                    value={selectedGroupByField} 
                    onValueChange={setSelectedGroupByField}
                  >
                    <SelectTrigger className="w-full h-9 bg-white border border-slate-200 rounded shadow-sm transition-all hover:border-slate-300 focus:ring-1 focus:ring-indigo-200">
                      <SelectValue placeholder="Select field..." />
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
                    className="shrink-0 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-3 shadow-sm transition-colors"
                    onClick={addGroupByField}
                    disabled={!selectedGroupByField || groupByFields.includes(selectedGroupByField)}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Currently selected group by fields */}
                <div className="flex flex-wrap gap-1.5">
                  {groupByFields.map(fieldId => (
                    <div 
                      key={fieldId} 
                      className="flex items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs transition-all hover:bg-slate-100"
                    >
                      <span className="text-slate-700 font-medium">{getFieldNameById(fieldId)}</span>
                      <button 
                        className="ml-1.5 text-slate-400 hover:text-slate-600 transition-colors w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200"
                        onClick={() => removeGroupByField(fieldId)}
                        title="Remove field"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Pivot On (Column) fields */}
            <div className="border-b border-slate-200">
              <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-2 flex items-center gap-2">
                <PivotTableIcon className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Columns</h4>
              </div>
              
              <div className="p-3">
                <div className="flex gap-2 mb-2">
                  <Select 
                    value={selectedPivotField} 
                    onValueChange={setSelectedPivotField}
                  >
                    <SelectTrigger className="w-full h-9 bg-white border border-slate-200 rounded shadow-sm transition-all hover:border-slate-300 focus:ring-1 focus:ring-indigo-200">
                      <SelectValue placeholder="Select field for..." />
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
                    className="shrink-0 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-3 shadow-sm transition-colors"
                    onClick={addPivotField}
                    disabled={!selectedPivotField || pivotColumnIds.includes(selectedPivotField)}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Currently selected pivot fields */}
                <div className="flex flex-wrap gap-1.5">
                  {pivotColumnIds.map(fieldId => (
                    <div 
                      key={fieldId} 
                      className="flex items-center bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md text-xs transition-all hover:bg-indigo-100"
                    >
                      <span className="text-indigo-700 font-medium">{getFieldNameById(fieldId)}</span>
                      <button 
                        className="ml-1.5 text-indigo-400 hover:text-indigo-600 transition-colors w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-200"
                        onClick={() => removePivotField(fieldId)}
                        title="Remove field"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Value fields with aggregation */}
            <div>
              <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-2 flex items-center gap-2">
                <AggregateIcon className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Values</h4>
              </div>
              
              <div className="p-3">
                <div className="flex gap-2 mb-2">
                  <Select 
                    value={selectedValueField} 
                    onValueChange={setSelectedValueField}
                  >
                    <SelectTrigger className="w-full h-9 bg-white border border-slate-200 rounded shadow-sm transition-all hover:border-slate-300 focus:ring-1 focus:ring-indigo-200">
                      <SelectValue placeholder="Select field to..." />
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
                    className="shrink-0 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-3 shadow-sm transition-colors"
                    onClick={addValueField}
                    disabled={!selectedValueField || pivotValues.includes(selectedValueField)}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Value fields with aggregation functions */}
                <div className="space-y-1.5">
                  {pivotValues.map(fieldId => (
                    <div 
                      key={fieldId} 
                      className="flex items-center bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-md text-xs transition-all hover:bg-emerald-100"
                    >
                      <span className="font-medium text-emerald-700">{getFieldNameById(fieldId)}</span>
                      <Select 
                        value={selectedAggregations[fieldId] || 'SUM'} 
                        onValueChange={(value) => changeAggregation(fieldId, value)}
                      >
                        <SelectTrigger className="h-6 min-w-[70px] bg-white ml-2 text-[10px] border border-emerald-200 rounded shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aggregationFunctions.map(func => (
                            <SelectItem key={func} value={func} className="text-xs">{func}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button 
                        className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors w-4 h-4 rounded-full flex items-center justify-center hover:bg-emerald-200"
                        onClick={() => removeValueField(fieldId)}
                        title="Remove field"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual preview */}
          {hasPivotConfig && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/70 px-3 py-2 border-b border-slate-200">
                <h4 className="text-xs font-semibold text-indigo-900 tracking-wide flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Preview
                </h4>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-center gap-1 text-xs">
                  <div className="bg-white shadow-sm border border-slate-200 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-900 mb-0.5 flex items-center">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full mr-1"></span>
                      Rows
                    </div>
                    <div className="text-slate-600 truncate max-w-[80px] text-[10px]">
                      {groupByFields.map(id => getFieldNameById(id)).join(', ')}
                    </div>
                  </div>
                  
                  <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="bg-white shadow-sm border border-indigo-100 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-900 mb-0.5 flex items-center">
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full mr-1"></span>
                      Columns
                    </div>
                    <div className="text-indigo-600 truncate max-w-[80px] text-[10px]">
                      {pivotColumnIds.map(id => getFieldNameById(id)).join(', ')}
                    </div>
                  </div>
                  
                  <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="bg-white shadow-sm border border-emerald-100 px-2 py-1.5 rounded">
                    <div className="font-medium text-slate-900 mb-0.5 flex items-center">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full mr-1"></span>
                      Values
                    </div>
                    <div className="text-emerald-600 truncate max-w-[120px] text-[10px]">
                      {pivotValues.map(id => 
                        `${selectedAggregations[id] || 'SUM'}(${getFieldNameById(id)})`
                      ).join(', ')}
                    </div>
                  </div>
                </div>
                
                {/* Table visualization */}
                <div className="mt-2.5 border border-slate-200 rounded overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[auto_1fr] h-20">
                    {/* Top-left corner */}
                    <div className="border-r border-b border-slate-200 p-1 bg-gray-50 flex items-center justify-center">
                      <div className="w-3 h-3"></div>
                    </div>
                    
                    {/* Column headers */}
                    <div className="border-b border-slate-200 p-1 bg-indigo-50 flex items-center justify-center">
                      <div className="whitespace-nowrap text-center text-[10px] font-medium text-indigo-700">
                        {pivotColumnIds.length === 1 ? (
                          <span className="px-1">{getFieldNameById(pivotColumnIds[0])}</span>
                        ) : (
                          <span className="px-1">Column Values</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Row headers */}
                    <div className="border-r border-slate-200 p-1 bg-slate-50 flex flex-col justify-center">
                      <div className="whitespace-nowrap text-center text-[10px] font-medium text-slate-700">
                        {groupByFields.length === 1 ? (
                          <span className="px-1">{getFieldNameById(groupByFields[0])}</span>
                        ) : (
                          <span className="px-1">Row Values</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Values grid cells */}
                    <div className="bg-white p-0 grid grid-cols-3 grid-rows-2 gap-px">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center p-0.5 border-b border-r border-slate-100">
                          <div className="bg-emerald-50 rounded w-full h-full flex items-center justify-center text-[9px] text-emerald-700">
                            {pivotValues.length === 1 ? (
                              <span className="truncate px-1 font-medium">
                                {selectedAggregations[pivotValues[0]] || 'SUM'}
                              </span>
                            ) : (
                              <span className="truncate px-1 font-medium">Value</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Apply button */}
          <div className="flex justify-end">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md px-4 py-2 shadow-sm text-sm"
              onClick={onApplyPivot}
              disabled={!pivotColumnIds.length || !pivotValues.length}
            >
              Apply Pivot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add some custom animation styles to your global CSS or add this to your stylesheet
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(5px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.3s ease-out;
// }

export default PivotOptions; 