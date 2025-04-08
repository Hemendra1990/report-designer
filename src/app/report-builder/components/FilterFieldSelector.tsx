import React from 'react';
import { Input } from "@/components/ui/input";
import { 
  ChevronDownIcon,
  CrossIcon,
  PlusIcon,
  SearchIcon 
} from "@/components/icons";
import { Field, FieldType } from '../model/Field';
import { getFieldIcon } from '../helper/ReportBuilderHelper';

interface FilterFieldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  fieldsByCategory: Record<string, any[]>;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  filterSearchTerm: string;
  onFilterSearchTermChange: (value: string) => void;
  addFilter: (field: Field) => void;
}

const FilterFieldSelector: React.FC<FilterFieldSelectorProps> = ({
  isOpen,
  onClose,
  fieldsByCategory,
  expandedCategories,
  toggleCategory,
  filterSearchTerm,
  onFilterSearchTermChange,
  addFilter
}) => {
  if (!isOpen) return null;
  
  const handleAddFilter = (field: any) => {
    // Convert the field to the correct type
    const typedField: Field = {
      id: field.id,
      name: field.name,
      type: field.type as FieldType,
      category: field.category,
      icon: field.icon
    };
    addFilter(typedField);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Filter</h2>
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
          {Object.entries(fieldsByCategory).map(([category, fields]) => (
            <div key={category} className="mb-4">
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
                      !filterSearchTerm.trim() ||
                      field.name.toLowerCase().includes(filterSearchTerm.toLowerCase())
                    )
                    .map(field => (
                      <div
                        key={field.id}
                        className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer group"
                        onClick={() => handleAddFilter(field)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {getFieldIcon(field.type as FieldType)}
                          </span>
                          <span>{field.name}</span>
                        </div>
                        <PlusIcon 
                          className="text-blue-600 opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterFieldSelector; 