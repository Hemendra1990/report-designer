import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldType } from "../model/Field";
import { CrossIcon, SearchIcon } from "@/components/icons";
import { useReportTypes } from '../context/ReportTypesContext';
import { getFieldTypeIcon as utilGetFieldTypeIcon, mapColumnTypeToFieldType } from '../utils/fieldUtils';

// Type for field in the selector
interface FieldSelectorItem {
  id: string;
  name: string;
  type: string;
  category: string;
  icon?: string;
}

// Extended field interface for API fields
interface ExtendedField extends FieldSelectorItem {
  columnName?: string;
  columnDisplayName?: string;
  columnType?: string;
  tableName?: string;
  tableId?: string;
  active?: boolean;
}

interface FilterFieldSelectorProps {
  fields?: FieldSelectorItem[];
  onSelect?: (field: Field) => void;
  onClose: () => void;
  isOpen: boolean;
  fieldsByCategory: Record<string, any[]>;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  filterSearchTerm: string;
  onFilterSearchTermChange: (value: string) => void;
  addFilter: (field: Field) => void;
}

// Helper function to get the icon for field type (fallback if util function doesn't exist)
const getFieldTypeIcon = (type: string): string => {
  // Use the utility function if imported successfully
  if (typeof utilGetFieldTypeIcon === 'function') {
    return utilGetFieldTypeIcon(type);
  }
  
  // Fallback implementation
  switch (type) {
    case 'text': return 'Aa';
    case 'number': return '123';
    case 'date': return '📅';
    case 'datetime': return '⏰';
    case 'picklist': return '▼';
    case 'checkbox': return '✓';
    case 'email': return '✉️';
    case 'phone': return '📞';
    case 'currency': return '$';
    case 'url': return '🔗';
    default: return 'Aa';
  }
};

// Group fields by category
const groupFieldsByCategory = (fields: FieldSelectorItem[]) => {
  const groupedFields: Record<string, FieldSelectorItem[]> = {};

  fields.forEach(field => {
    const category = field.category || 'Other';
    if (!groupedFields[category]) {
      groupedFields[category] = [];
    }
    groupedFields[category].push(field);
  });

  return groupedFields;
};

const FilterFieldSelector: React.FC<FilterFieldSelectorProps> = ({ 
  fields,
  onSelect,
  onClose,
  isOpen,
  fieldsByCategory: accountFieldsByCategory,
  expandedCategories,
  toggleCategory,
  filterSearchTerm,
  onFilterSearchTermChange,
  addFilter
}) => {
  if (!isOpen) return null;
  
  // Get report fields from context
  const { reportFields, isFieldsLoading, selectedReportTypeId } = useReportTypes();
  
  // Group report fields by tableName
  const reportFieldsByTable = useMemo(() => {
    if (!reportFields || !reportFields.length) {
      return {};
    }
    
    // Group fields by table
    return reportFields.reduce((acc, field) => {
      const tableName = field.tableName || 'Other';
      const formattedTableName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
      
      if (!acc[formattedTableName]) {
        acc[formattedTableName] = [];
      }
      
      acc[formattedTableName].push({
        id: field.id,
        name: field.columnDisplayName,
        columnName: field.columnName,
        columnDisplayName: field.columnDisplayName,
        columnType: field.columnType,
        tableName: field.tableName,
        tableId: field.tableId,
        type: mapColumnTypeToFieldType(field.columnType),
        category: field.tableName,
        active: field.active
      } as ExtendedField);
      
      return acc;
    }, {} as Record<string, ExtendedField[]>);
  }, [reportFields]);
  
  // Determine which fields to display
  const displayFieldsByCategory = useMemo(() => {
    // If we have a selected report type, use its fields
    if (selectedReportTypeId && reportFields.length > 0) {
      return reportFieldsByTable;
    }
    
    // Otherwise use the account fields
    return accountFieldsByCategory;
  }, [selectedReportTypeId, reportFields, reportFieldsByTable, accountFieldsByCategory]);

  // For backward compatibility and our example implementation
  const useProvidedFields = fields && onSelect;
  
  if (useProvidedFields) {
    // This is our new implementation with the search functionality
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter fields based on search term
    const filteredFields = fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Group filtered fields by category
    const groupedFields = groupFieldsByCategory(filteredFields);
    
    // Handle field selection
    const handleSelectField = (field: FieldSelectorItem) => {
      // Convert to Field type
      const typedField: Field = {
        id: field.id,
        name: field.name,
        type: field.type as FieldType,
        category: field.category,
        icon: field.icon
      };
      
      onSelect(typedField);
      onClose();
    };
    
    return (
      <Card className="shadow-sm w-full max-w-md">
        <CardHeader className="py-2 px-3 flex flex-row items-center justify-between bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-700">Select Field</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <CrossIcon size={14} />
          </Button>
        </CardHeader>
        
        <CardContent className="p-3">
          {/* Search input */}
          <div className="relative mb-3">
            <Input
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
            <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon size={14} />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <CrossIcon size={12} />
              </Button>
            )}
          </div>
          
          {/* Field categories */}
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {Object.keys(groupedFields).length > 0 ? (
              Object.entries(groupedFields).map(([category, categoryFields]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">{category}</h4>
                  <div className="space-y-1">
                    {categoryFields.map(field => (
                      <button
                        key={field.id}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center text-sm"
                        onClick={() => handleSelectField(field)}
                      >
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded mr-2 text-xs">
                          {getFieldTypeIcon(field.type)}
                        </span>
                        {field.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-gray-500 text-sm">
                No fields matching "{searchTerm}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Original implementation for the ReportBuilderPage
  const handleAddFilter = (field: any) => {
    const typedField: Field = {
      id: field.id,
      name: field.name || field.columnDisplayName,
      type: field.type as FieldType,
      category: field.category || field.tableName,
      icon: field.icon,
      columnName: field.columnName,
      columnDisplayName: field.columnDisplayName,
      columnType: field.columnType,
      tableName: field.tableName,
      tableId: field.tableId,
      active: field.active,
      duckDBColumnName: field.duckDBColumnName,
      duckDBColumnDisplayName: field.duckDBColumnDisplayName,
      isFormula: field.isFormula,
      formula: field.formula,
      isSummaryFormula: field.isSummaryFormula,
      alias: field.alias,
      description: field.description,
    };
    addFilter(typedField);
    onClose();
  };
  
  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!filterSearchTerm.trim()) {
      return Object.keys(displayFieldsByCategory);
    }
    
    return Object.keys(displayFieldsByCategory).filter(category => 
      displayFieldsByCategory[category].some((field: any) => 
        (field.name?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
        (field.columnDisplayName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
        (field.columnName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase())
      )
    );
  }, [displayFieldsByCategory, filterSearchTerm]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Filter modal</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CrossIcon size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Input
              className="pl-8 text-sm"
              placeholder="Search fields..."
              value={filterSearchTerm}
              onChange={(e) => onFilterSearchTermChange(e.target.value)}
            />
            <SearchIcon 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {isFieldsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading fields...</div>
          ) : (
            <>
              {filteredCategories.map(category => (
                <div key={category} className="mb-4">
                  <div
                    className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      {category} FIELDS ({displayFieldsByCategory[category].length})
                    </div>
                    <div>&#9662;</div>
                  </div>

                  {expandedCategories[category] && (
                    <div className="pl-2">
                      {displayFieldsByCategory[category]
                        .filter((field: any) =>
                          !filterSearchTerm.trim() ||
                          (field.name?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
                          (field.columnDisplayName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
                          (field.columnName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase())
                        )
                        .map((field: any) => (
                          <div
                            key={field.id}
                            className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer group"
                            onClick={() => handleAddFilter(field)}
                            title={field.columnName ? `${field.columnDisplayName} (${field.columnName})` : field.name}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded flex items-center justify-center text-xs bg-indigo-100 text-indigo-700">
                                {field.columnType ? getFieldTypeIcon(field.columnType) : getFieldTypeIcon(field.type)}
                              </span>
                              <span>{field.columnDisplayName || field.name}</span>
                            </div>
                            <span className="text-blue-600 opacity-0 group-hover:opacity-100">+</span>
                          </div>
                        ))}
                        
                      {displayFieldsByCategory[category].filter((field: any) =>
                        !filterSearchTerm.trim() ||
                        (field.name?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
                        (field.columnDisplayName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase()) ||
                        (field.columnName?.toLowerCase() || '').includes(filterSearchTerm.toLowerCase())
                      ).length === 0 && filterSearchTerm.trim() !== "" && (
                        <div className="p-2 text-sm text-gray-500">No matching fields found</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {filteredCategories.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {reportFields.length === 0 ? 
                    "No fields available. Please select a report type." : 
                    "No fields matching your search."}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterFieldSelector; 