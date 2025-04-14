import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {AggregateIcon, GroupIcon, PivotTableIcon} from "@/components/icons/ReportIcons";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

// Simple icons for use within this component
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-600">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Custom hint component with hover functionality
const Hint = ({ text, children }: { text: string, children: React.ReactNode }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-slate-800 text-white text-xs py-1 px-2 rounded 
                    w-max max-w-xs -translate-x-1/2 left-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};

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
  const pivotableFields = selectedColumns.filter(col => {
    const typeString = (col.type as string).toUpperCase();
    const textTypes = ["TEXT", "CHAR", "VARCHAR", "VARCHAR(255)", "VARCHAR(50)"];
    
    // Check if it's a string type from our database or a UI category type
    return textTypes.includes(typeString.toUpperCase()) ||
          ['text', 'picklist', 'user', 'lookup'].map(t => t.toUpperCase()).includes(typeString);
  });
  
  // Fields that can be aggregated (numeric fields)
  const aggregatableFields = selectedColumns.filter(col => {
    const numberTypes = ["int4", "int8", "int", "float8", "bigserial", "bigint"];
    const typeString = (col.type as string).toLowerCase();
    return ['number', 'currency', 'percent'].includes(typeString)
            || numberTypes.includes(typeString);
  });
  
  // Helper to add a field to pivot on
  const addPivotField = () => {
    if (selectedPivotField && !pivotColumnIds.includes(selectedPivotField)) {
      const updatedFields = [...pivotColumnIds, selectedPivotField];
      console.log('Adding pivot column:', selectedPivotField, 'New pivotColumnIds:', updatedFields);
      setPivotColumnIds(updatedFields);
      setSelectedPivotField('');
    }
  };
  
  // Helper to add a field to aggregate
  const addValueField = () => {
    if (selectedValueField && !pivotValues.includes(selectedValueField)) {
      const updatedValues = [...pivotValues, selectedValueField];
      console.log('Adding value field:', selectedValueField, 'New pivotValues:', updatedValues);
      setPivotValues(updatedValues);
      
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
      const updatedFields = [...groupByFields, selectedGroupByField];
      console.log('Adding row field:', selectedGroupByField, 'New groupByFields:', updatedFields);
      setGroupByFields(updatedFields);
      setSelectedGroupByField('');
    }
  };
  
  // Remove a pivot field
  const removePivotField = (fieldId: string) => {
    const updatedFields = pivotColumnIds.filter(id => id !== fieldId);
    console.log('Removing pivot column:', fieldId, 'New pivotColumnIds:', updatedFields);
    setPivotColumnIds(updatedFields);
  };
  
  // Remove a value field
  const removeValueField = (fieldId: string) => {
    const updatedValues = pivotValues.filter(id => id !== fieldId);
    console.log('Removing value field:', fieldId, 'New pivotValues:', updatedValues);
    setPivotValues(updatedValues);
    
    // Remove from aggregations as well
    const newAggregations = { ...selectedAggregations };
    delete newAggregations[fieldId];
    setSelectedAggregations(newAggregations);
  };
  
  // Remove a group by field
  const removeGroupByField = (fieldId: string) => {
    const updatedFields = groupByFields.filter(id => id !== fieldId);
    console.log('Removing row field:', fieldId, 'New groupByFields:', updatedFields);
    setGroupByFields(updatedFields);
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
  const isConfigValid = pivotColumnIds.length > 0 && pivotValues.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <PivotTableIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-medium text-slate-800">Pivot Configuration</h3>
        </div>
        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          <Label htmlFor="pivot-active" className="text-xs font-medium text-slate-600 select-none">Enable</Label>
          <Switch 
            id="pivot-active" 
            checked={isPivotActive} 
            onCheckedChange={setIsPivotActive} 
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>
      
      {isPivotActive ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Main config container */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1 bg-blue-100 text-blue-700 rounded">
                  <InfoIcon />
                </div>
                <span className="ml-2 text-xs font-medium text-blue-800">
                  Configure how your data will be transformed in the pivot table
                </span>
              </div>
            </div>
            
            {/* Group By (Row) fields */}
            <CompactFieldSection
              title="Rows"
              tooltip="Fields that will appear as the leftmost columns in your pivot table"
              icon={<GroupIcon className="h-3.5 w-3.5" />}
              color="slate"
              selectedFields={groupByFields}
              availableFields={selectedColumns}
              selectedFieldId={selectedGroupByField}
              setSelectedFieldId={setSelectedGroupByField}
              addField={addGroupByField}
              removeField={removeGroupByField}
              getFieldNameById={getFieldNameById}
            />
            
            {/* Pivot On (Column) fields */}
            <CompactFieldSection
              title="Columns"
              tooltip="Fields that determine how values are spread across multiple columns in your table"
              icon={<PivotTableIcon className="h-3.5 w-3.5" />}
              color="indigo"
              selectedFields={pivotColumnIds}
              availableFields={pivotableFields}
              selectedFieldId={selectedPivotField}
              setSelectedFieldId={setSelectedPivotField}
              addField={addPivotField}
              removeField={removePivotField}
              getFieldNameById={getFieldNameById}
              noFieldsMessage={pivotableFields.length === 0 ? "No categorical fields available" : undefined}
            />
            
            {/* Value fields with aggregation */}
            <div className="border rounded border-emerald-100 p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded">
                    <AggregateIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium">Values</span>
                  <Hint text="Numeric fields to calculate in each cell of your pivot table">
                    <div className="cursor-help">
                      <InfoIcon />
                    </div>
                  </Hint>
                </div>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
                  {pivotValues.length}
                </Badge>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  <Select 
                    value={selectedValueField} 
                    onValueChange={setSelectedValueField}
                  >
                    <SelectTrigger className="h-7 text-xs w-full bg-white border border-slate-200 shadow-sm">
                      <SelectValue placeholder="Select field to aggregate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregatableFields.length > 0 ? (
                        aggregatableFields.map(col => (
                          <SelectItem 
                            key={col.id} 
                            value={col.id}
                            disabled={pivotValues.includes(col.id)}
                            className={pivotValues.includes(col.id) ? "opacity-50" : ""}
                          >
                            {col.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No numeric fields available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Hint text="Add field to values">
                    <Button 
                      onClick={addValueField}
                      disabled={!selectedValueField || pivotValues.includes(selectedValueField)}
                      className="h-7 px-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                    >
                      <PlusIcon />
                    </Button>
                  </Hint>
                </div>
                
                {/* Selected value fields with aggregation functions */}
                {pivotValues.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {pivotValues.map(fieldId => (
                      <div 
                        key={fieldId} 
                        className="flex items-center justify-between px-2 py-1 bg-emerald-50 border border-emerald-100 rounded text-xs"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Hint text={getFieldNameById(fieldId)}>
                            <span className="font-medium text-emerald-800 truncate max-w-[100px]">
                              {getFieldNameById(fieldId)}
                            </span>
                          </Hint>
                          <Hint text="Select aggregation method">
                            <Select 
                              value={selectedAggregations[fieldId] || 'SUM'} 
                              onValueChange={(value) => changeAggregation(fieldId, value)}
                            >
                              <SelectTrigger className="h-5 min-w-[70px] border border-emerald-200 rounded text-[10px] px-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {aggregationFunctions.map(func => (
                                  <SelectItem key={func} value={func} className="text-xs">{func}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Hint>
                        </div>
                        <Hint text={`Remove ${getFieldNameById(fieldId)}`}>
                          <button 
                            onClick={() => removeValueField(fieldId)}
                            className="text-emerald-500 hover:text-emerald-700 rounded-full p-0.5 hover:bg-emerald-200"
                            aria-label={`Remove ${getFieldNameById(fieldId)}`}
                          >
                            <CrossIcon />
                          </button>
                        </Hint>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2 px-3 bg-slate-50/50 border border-dashed border-slate-200 rounded text-slate-500 text-xs">
                    Select numeric fields to aggregate
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Visual preview when configuration is complete */}
          {hasPivotConfig && (
            <div className="border border-indigo-100 rounded overflow-hidden shadow-sm">
              <div className="bg-indigo-50/50 px-2 py-1.5 border-b border-indigo-100 flex items-center">
                <PivotTableIcon className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                <h4 className="text-xs font-medium text-indigo-800">Preview</h4>
              </div>
              
              <div className="p-2">
                {/* Mini table visualization */}
                <div className="border border-slate-100 rounded overflow-hidden">
                  <div className="bg-white grid grid-cols-4 divide-x divide-y divide-slate-100 text-[10px]">
                    {/* Header row */}
                    <div className="p-1.5 bg-slate-50 font-medium text-center col-span-1">Rows</div>
                    <div className="p-1.5 bg-indigo-50 font-medium text-center col-span-3">Columns</div>
                    
                    {/* First data row */}
                    <div className="p-1.5 bg-slate-50 font-medium border-r border-slate-200">
                      {groupByFields.length > 0 ? getFieldNameById(groupByFields[0]) : "Row 1"}
                    </div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                    
                    {/* Second data row */}
                    <div className="p-1.5 bg-slate-50 font-medium border-r border-slate-200">
                      {groupByFields.length > 0 ? (groupByFields.length > 1 ? getFieldNameById(groupByFields[1]) : getFieldNameById(groupByFields[0])) : "Row 2"}
                    </div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                    <div className="p-1.5 bg-emerald-50/40 text-center">Value</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Apply button */}
          <div className="flex justify-end border-t border-slate-200 pt-2">
            <Hint text={isConfigValid ? "Apply pivot configuration to your data" : "Complete configuration to enable"}>
              <Button 
                onClick={onApplyPivot}
                disabled={!isConfigValid}
                className={cn(
                  "text-white px-4 py-1 h-8 text-xs rounded transition-colors shadow-sm",
                  "flex items-center gap-1.5",
                  isConfigValid 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-slate-300 cursor-not-allowed"
                )}
              >
                <PivotTableIcon className="h-3.5 w-3.5" />
                <span>Apply Pivot</span>
              </Button>
            </Hint>
          </div>
          
          {!isConfigValid && (
            <div className="text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded text-xs flex items-start gap-2">
              <div className="shrink-0 mt-0.5">
                <InfoIcon />
              </div>
              <div>
                {!pivotColumnIds.length && !pivotValues.length && (
                  <p>Select at least one column field and one value field</p>
                )}
                {!pivotColumnIds.length && pivotValues.length > 0 && (
                  <p>Select at least one column field to spread values</p>
                )}
                {pivotColumnIds.length > 0 && !pivotValues.length && (
                  <p>Select at least one value field to calculate</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 px-3 bg-slate-50/80 rounded border border-dashed border-slate-200 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
            <PivotTableIcon className="h-5 w-5 text-indigo-500" />
          </div>
          <h4 className="text-sm font-medium text-slate-800 mb-1">Enable Pivot Tables</h4>
          <p className="text-slate-600 text-center text-xs mb-3">
            Transform complex data into an easy-to-analyze format
          </p>
          <Button 
            onClick={() => setIsPivotActive(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs px-3 py-1 h-7 shadow-sm"
          >
            Enable
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper components
const CompactFieldSection = ({
  title,
  tooltip,
  icon,
  color,
  selectedFields,
  availableFields,
  selectedFieldId,
  setSelectedFieldId,
  addField,
  removeField,
  getFieldNameById,
  noFieldsMessage
}: {
  title: string;
  tooltip: string;
  icon: React.ReactNode;
  color: "slate" | "indigo" | "emerald";
  selectedFields: string[];
  availableFields: any[];
  selectedFieldId: string;
  setSelectedFieldId: (id: string) => void;
  addField: () => void;
  removeField: (id: string) => void;
  getFieldNameById: (id: string) => string;
  noFieldsMessage?: string;
}) => {
  const colorMap = {
    slate: {
      border: "border-slate-200",
      bg: "bg-slate-100",
      text: "text-slate-700",
      badge: "text-slate-600 bg-slate-50 border-slate-200",
      chip: "bg-slate-50 border-slate-200",
      chipText: "text-slate-800"
    },
    indigo: {
      border: "border-indigo-100",
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      badge: "text-indigo-600 bg-indigo-50 border-indigo-200",
      chip: "bg-indigo-50 border-indigo-100",
      chipText: "text-indigo-800"
    },
    emerald: {
      border: "border-emerald-100",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      badge: "text-emerald-600 bg-emerald-50 border-emerald-200",
      chip: "bg-emerald-50 border-emerald-100",
      chipText: "text-emerald-800"
    }
  };

  return (
    <div className={`border rounded p-2 ${colorMap[color].border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`h-5 w-5 flex items-center justify-center ${colorMap[color].bg} ${colorMap[color].text} rounded`}>
            {icon}
          </div>
          <span className="text-xs font-medium">{title}</span>
          <Hint text={tooltip}>
            <div className="cursor-help">
              <InfoIcon />
            </div>
          </Hint>
        </div>
        <Badge variant="outline" className={`h-5 px-1.5 text-[10px] ${colorMap[color].badge}`}>
          {selectedFields.length}
        </Badge>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex gap-1">
          <Select 
            value={selectedFieldId} 
            onValueChange={setSelectedFieldId}
          >
            <SelectTrigger className="h-7 text-xs w-full bg-white border border-slate-200 shadow-sm">
              <SelectValue placeholder={`Select ${title.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {availableFields.length > 0 ? (
                availableFields.map(col => (
                  <SelectItem 
                    key={col.id} 
                    value={col.id}
                    disabled={selectedFields.includes(col.id)}
                    className={selectedFields.includes(col.id) ? "opacity-50" : ""}
                  >
                    {col.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>{noFieldsMessage || "No fields available"}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Hint text={`Add field to ${title.toLowerCase()}`}>
            <Button 
              onClick={addField}
              disabled={!selectedFieldId || selectedFields.includes(selectedFieldId)}
              className={`h-7 px-2 text-xs ${colorMap[color].bg} ${colorMap[color].text} border ${colorMap[color].border}`}
            >
              <PlusIcon />
            </Button>
          </Hint>
        </div>
        
        {/* Selected fields */}
        {selectedFields.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {selectedFields.map(fieldId => (
              <div 
                key={fieldId} 
                className={`flex items-center rounded px-1.5 py-1 text-xs ${colorMap[color].chip}`}
              >
                <Hint text={getFieldNameById(fieldId)}>
                  <span className={`font-medium truncate max-w-[100px] ${colorMap[color].chipText}`}>
                    {getFieldNameById(fieldId)}
                  </span>
                </Hint>
                <Hint text={`Remove ${getFieldNameById(fieldId)}`}>
                  <button 
                    onClick={() => removeField(fieldId)}
                    // Using style attribute instead of template literals to avoid the linter error
                    style={{color: color === 'slate' ? '#64748b' : color === 'indigo' ? '#4f46e5' : '#10b981'}}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/50"
                    aria-label={`Remove ${getFieldNameById(fieldId)}`}
                  >
                    <CrossIcon />
                  </button>
                </Hint>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-2 px-3 bg-slate-50/50 border border-dashed border-slate-200 rounded text-slate-500 text-xs">
            Add {title.toLowerCase()} to organize your data
          </div>
        )}
      </div>
    </div>
  );
};

export default PivotOptions; 