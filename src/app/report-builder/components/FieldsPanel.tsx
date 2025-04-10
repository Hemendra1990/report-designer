import React from 'react';
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ChevronLeftIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { FormulaIcon } from "@/components/icons/ReportIcons";

// Field interface compatible with both application and API field types
export interface FieldsPanelField {
  id: string | null;
  name?: string;
  type?: string;
  category?: string;
  label?: string;
  isCustom?: boolean;
  isFormula?: boolean;
  isSummaryFormula?: boolean;
  icon?: string;
  // New properties from the API response
  columnName?: string;
  columnDisplayName?: string;
  columnType?: string;
  tableName?: string;
  tableId?: string;
  active?: boolean;
}

interface FieldsByCategory {
  [category: string]: FieldsPanelField[];
}

interface FieldsPanelProps {
  leftPanelCollapsed: boolean;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fieldsByCategory: FieldsByCategory;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  addColumn: (field: FieldsPanelField) => void;
  showShortcuts: boolean;
  isLoading?: boolean;
}

const FieldsPanel: React.FC<FieldsPanelProps> = ({
  leftPanelCollapsed,
  setLeftPanelCollapsed,
  searchTerm,
  setSearchTerm,
  fieldsByCategory,
  expandedCategories,
  toggleCategory,
  addColumn,
  showShortcuts,
  isLoading = false
}) => {
  // Helper function to get display name for a field
  const getFieldDisplayName = (field: FieldsPanelField): string => {
    return field.columnDisplayName || field.label || field.name || field.columnName || 'Unnamed Field';
  };

  // Helper function to get field type
  const getFieldType = (field: FieldsPanelField): string => {
    return field.columnType || field.type || 'text';
  };

  // Helper function to get field icon based on type
  const getFieldTypeIcon = (field: FieldsPanelField): React.ReactNode => {
    // If field already has an icon, use it
    if (field.icon) {
      return field.icon;
    }
    
    // Get the field type
    const fieldType = getFieldType(field).toLowerCase();
    
    // Otherwise, determine icon based on field type
    switch (fieldType) {
      case 'text':
      case 'varchar':
      case 'char':
      case 'string':
        return 'T';
      case 'textarea':
      case 'text[]':
        return '¶';
      case 'number':
      case 'integer':
      case 'int':
      case 'float':
      case 'double':
      case 'numeric':
      case 'bigint':
        return '#';
      case 'currency':
      case 'money':
        return '$';
      case 'percent':
        return '%';
      case 'date':
        return '📅';
      case 'datetime':
      case 'timestamp':
      case 'timestamptz':
        return '⏰';
      case 'picklist':
      case 'enum':
        return '▼';
      case 'multipicklist':
        return '▼▼';
      case 'reference':
      case 'fk':
      case 'foreign key':
        return '→';
      case 'id':
      case 'uuid':
      case 'primary key':
        return 'ID';
      case 'checkbox':
      case 'boolean':
      case 'bool':
        return '✓';
      case 'email':
        return '@';
      case 'url':
        return '🔗';
      case 'phone':
        return '📞';
      default:
        return '•';
    }
  };

  // Group fields by table name for display in the UI
  const fieldsByTable: Record<string, FieldsPanelField[]> = {};
  
  Object.entries(fieldsByCategory).forEach(([category, fields]) => {
    fields.forEach(field => {
      // Handle formula fields specially
      if (field.isFormula) {
        const formulaCat = 'Formula Fields';
        fieldsByTable[formulaCat] = fieldsByTable[formulaCat] || [];
        fieldsByTable[formulaCat].push(field);
        return;
      }
      
      // For regular fields, group by tableName
      const tableName = field.tableName || category || 'Other Fields';
      fieldsByTable[tableName] = fieldsByTable[tableName] || [];
      fieldsByTable[tableName].push(field);
    });
  });

  return (
    <div className={`${leftPanelCollapsed ? 'w-12' : 'w-64'} bg-card border-r border-border flex flex-col overflow-hidden transition-all duration-300 shrink-0`}>
      {/* Collapse Control */}
      <div className="flex justify-end p-1">
        <button
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title={leftPanelCollapsed ? "Expand fields panel" : "Collapse fields panel"}
        >
          <ChevronLeftIcon 
            className={`transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {!leftPanelCollapsed ? (
        <>
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Input
                className="pl-8 text-sm"
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Loading state */}
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto"></div>
                </div>
                <div className="mt-3 text-sm">Loading fields...</div>
              </div>
            ) : (
              <>
                {/* Summary Formulas Section */}
                {fieldsByTable['Formula Fields'] && (
                  <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                    <div className="text-xs font-semibold text-gray-700">
                      Summary Formulas ({
                        fieldsByTable['Formula Fields']
                          .filter(field => field.isSummaryFormula)
                          .length || 0
                      })
                    </div>
                    <button 
                      className="text-purple-600 text-xs"
                      onClick={() => {/* Add summary formula action if needed */}}
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* All Tables/Categories */}
                {Object.entries(fieldsByTable).map(([tableName, fields]) => (
                  <div key={tableName} className="border-b border-gray-200">
                    <div
                      className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(tableName)}
                    >
                      <div className="text-xs font-semibold text-gray-700">
                        {tableName === 'Formula Fields' ? tableName : `${tableName} Fields`} ({fields.length})
                      </div>
                      <ChevronDownIcon 
                        className={`transition-transform ${expandedCategories[tableName] ? 'rotate-180' : ''}`} 
                      />
                    </div>

                    {expandedCategories[tableName] && (
                      <div className="pl-2">
                        {fields
                          .filter(field => {
                            if (!searchTerm.trim()) return true;
                            const displayName = getFieldDisplayName(field).toLowerCase();
                            const searchLower = searchTerm.toLowerCase();
                            return displayName.includes(searchLower);
                          })
                          .map(field => (
                            <div
                              key={field.id || field.columnName}
                              className={`pl-2 pr-3 py-1.5 text-sm flex items-center justify-between cursor-pointer group
                                ${field.isFormula 
                                  ? field.isSummaryFormula 
                                    ? 'hover:bg-purple-50' 
                                    : 'hover:bg-blue-50'
                                  : 'hover:bg-blue-50'
                                }`}
                              onClick={() => addColumn(field)}
                              draggable
                              onDragStart={() => {/* Handle field drag if needed */ }}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs 
                                  ${field.isFormula 
                                    ? field.isSummaryFormula 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-blue-100 text-blue-700'
                                    : getFieldType(field).toLowerCase() === 'number' || 
                                      getFieldType(field).toLowerCase() === 'integer' ||
                                      getFieldType(field).toLowerCase() === 'currency'
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                  {field.isFormula ? 
                                    <FormulaIcon className={`size-3 ${field.isSummaryFormula ? 'text-purple-700' : 'text-blue-700'}`} /> 
                                    : getFieldTypeIcon(field)}
                                </span>
                                <span title={field.tableId ? `${tableName}.${getFieldDisplayName(field)}` : getFieldDisplayName(field)}>
                                  {getFieldDisplayName(field)}
                                </span>
                              </div>
                              <PlusIcon
                                className={`opacity-0 group-hover:opacity-100
                                  ${field.isFormula 
                                    ? field.isSummaryFormula 
                                      ? 'text-purple-600' 
                                      : 'text-blue-600'
                                    : 'text-blue-600'
                                  }`}
                              />
                            </div>
                          ))}
                        {fields.filter(field => {
                          if (!searchTerm.trim()) return true;
                          const displayName = getFieldDisplayName(field).toLowerCase();
                          const searchLower = searchTerm.toLowerCase();
                          return displayName.includes(searchLower);
                        }).length === 0 && searchTerm.trim() !== "" && (
                          <div className="p-2 text-sm text-gray-500">No matching fields found</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state when no fields are available */}
                {Object.keys(fieldsByTable).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="mt-3 text-sm">No fields available for this report type</div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        // Collapsed view - shows only icons without category shortcuts
        <div className="flex flex-col items-center pt-4 space-y-4 overflow-y-auto">
          <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mb-8">
            Fields
          </div>
          
          {/* Conditionally render category shortcuts based on state */}
          {showShortcuts && !isLoading && (
            <>
              {Object.entries(fieldsByTable).map(([tableName]) => (
                <div
                  key={tableName}
                  className="p-2 cursor-pointer hover:bg-accent rounded-md"
                  title={`${tableName === 'Formula Fields' ? tableName : `${tableName} Fields`}`}
                  onClick={() => {
                    setLeftPanelCollapsed(false);
                    setTimeout(() => toggleCategory(tableName), 300);
                  }}
                >
                  <div className="size-8 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center text-sm font-medium">
                    {tableName === 'Formula Fields' ? 'F' : tableName.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldsPanel; 