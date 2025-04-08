import React from 'react';
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ChevronLeftIcon, PlusIcon, SearchIcon } from "@/components/icons";

// Match the field type to the one in accountFields
interface Field {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: string;
}

interface FieldsByCategory {
  [category: string]: Field[];
}

interface FieldsPanelProps {
  leftPanelCollapsed: boolean;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fieldsByCategory: FieldsByCategory;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  addColumn: (field: Field) => void;
  showShortcuts: boolean;
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
  showShortcuts
}) => {
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
            <div className="p-2 border-b border-gray-200 flex justify-between items-center">
              <div className="text-xs font-semibold text-gray-500">SUMMARY FORMULAS (0)</div>
              <button className="text-blue-600 text-xs">Add</button>
            </div>

            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category} className="border-b border-gray-200">
                <div
                  className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {category} FIELDS ({fields.length})
                  </div>
                  <ChevronDownIcon 
                    className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`} 
                  />
                </div>

                {expandedCategories[category as keyof typeof expandedCategories] && (
                  <div className="pl-2">
                    {fields
                      .filter(field =>
                        !searchTerm.trim() ||
                        field.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(field => (
                        <div
                          key={field.id}
                          className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer group"
                          onClick={() => addColumn(field)}
                          draggable
                          onDragStart={() => {/* Handle field drag if needed */ }}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {field.icon}
                            </span>
                            <span>{field.name}</span>
                          </div>
                          <PlusIcon
                            className="text-blue-600 opacity-0 group-hover:opacity-100"
                          />
                        </div>
                      ))}
                    {fields.filter(field =>
                      !searchTerm.trim() ||
                      field.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && searchTerm.trim() !== "" && (
                        <div className="p-2 text-sm text-gray-500">No matching fields found</div>
                      )}
                  </div>
                )}
              </div>
            ))}
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
              {Object.entries(fieldsByCategory).map(([category]) => (
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