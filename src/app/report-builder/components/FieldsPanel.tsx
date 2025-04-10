import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ChevronLeftIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { FormulaIcon } from "@/components/icons/ReportIcons";
import { useReportTypes } from '../context/ReportTypesContext';
import { getFieldTypeIcon } from '../utils/fieldUtils';

// Match the field type to the one in accountFields
interface Field {
  id: string;
  name: string;
  type: string;
  category: string;
  icon?: string;
  isFormula?: boolean;
  isSummaryFormula?: boolean;
}

interface FieldsByCategory {
  [category: string]: Field[];
}

interface ExtendedField extends Field {
  columnName?: string;
  columnDisplayName?: string;
  columnType?: string;
  tableName?: string;
  tableId?: string;
  active?: boolean;
}

interface FieldsPanelProps {
  leftPanelCollapsed: boolean;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fieldsByCategory: FieldsByCategory;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  addColumn: (field: Field | ExtendedField) => void;
  showShortcuts: boolean;
}

const FieldsPanel: React.FC<FieldsPanelProps> = ({
  leftPanelCollapsed,
  setLeftPanelCollapsed,
  searchTerm,
  setSearchTerm,
  fieldsByCategory: accountFieldsByCategory,
  expandedCategories,
  toggleCategory,
  addColumn,
  showShortcuts
}) => {
  // Get report fields from context
  const { reportFields, isFieldsLoading, selectedReportTypeId } = useReportTypes();
  
  // Group report fields by tableName
  const reportFieldsByTable = useMemo(() => {
    if (!reportFields || !reportFields.length) {
      return {};
    }
    
    console.log('Report fields for grouping:', reportFields);
    
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
        type: field.columnType,
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
  
  // Filter fields based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return Object.keys(displayFieldsByCategory);
    }
    
    return Object.keys(displayFieldsByCategory).filter(category => 
      displayFieldsByCategory[category].some((field: ExtendedField) => 
        (field.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (field.columnDisplayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (field.columnName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    );
  }, [displayFieldsByCategory, searchTerm]);

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
            {isFieldsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading fields...</div>
            ) : (
              <>
                {/* All Fields Categories */}
                {filteredCategories.map(category => (
                  <div key={category} className="border-b border-gray-200">
                    <div
                      className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase">
                        {category} FIELDS ({displayFieldsByCategory[category].length})
                      </div>
                      <ChevronDownIcon 
                        className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`} 
                      />
                    </div>

                    {expandedCategories[category as keyof typeof expandedCategories] && (
                      <div className="pl-2">
                        {displayFieldsByCategory[category]
                          .filter((field: ExtendedField) =>
                            !searchTerm.trim() ||
                            (field.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (field.columnDisplayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (field.columnName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                          .map((field: ExtendedField) => (
                            <div
                              key={field.id}
                              className={`pl-2 pr-3 py-1.5 text-sm flex items-center justify-between cursor-pointer group hover:bg-blue-50`}
                              onClick={() => addColumn(field)}
                              draggable
                              onDragStart={() => {/* Handle field drag if needed */ }}
                              title={field.columnName ? `${field.columnDisplayName} (${field.columnName})` : field.name}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 flex items-center justify-center rounded-sm text-xs bg-indigo-100 text-indigo-700">
                                  {field.columnType ? getFieldTypeIcon(field.columnType) : field.icon}
                                </span>
                                <span>{field.columnDisplayName || field.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">
                                  {field.columnName}
                                </span>
                                <PlusIcon className="opacity-0 group-hover:opacity-100 text-blue-600" />
                              </div>
                            </div>
                          ))}
                        {displayFieldsByCategory[category].filter((field: ExtendedField) =>
                          !searchTerm.trim() ||
                          (field.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (field.columnDisplayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (field.columnName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                        ).length === 0 && searchTerm.trim() !== "" && (
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
        </>
      ) : (
        // Collapsed view - shows only icons without category shortcuts
        <div className="flex flex-col items-center pt-4 space-y-4 overflow-y-auto">
          <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mb-8">
            Fields
          </div>
          
          {/* Conditionally render category shortcuts based on state */}
          {showShortcuts && (
            <>
              {Object.keys(displayFieldsByCategory).map((category) => (
                <div
                  key={category}
                  className="p-2 cursor-pointer hover:bg-accent rounded-md"
                  title={`${category.toUpperCase()} fields`}
                  onClick={() => {
                    setLeftPanelCollapsed(false);
                    setTimeout(() => toggleCategory(category), 300);
                  }}
                >
                  <div className="size-8 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center text-sm font-medium">
                    {category.charAt(0).toUpperCase()}
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