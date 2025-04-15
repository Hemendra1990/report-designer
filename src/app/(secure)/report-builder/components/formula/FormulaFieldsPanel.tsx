import React from 'react';
import { ChevronDownIcon } from "@/components/icons";
import {ApiReportField} from "@/app/(secure)/report-builder/services/api-types";

type Field = {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: React.ReactNode;
};

interface FormulaFieldsPanelProps {
  fieldsByCategory: Record<string, ApiReportField[]>;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  searchTerm: string;
  onFieldSelect: (field: ApiReportField) => void;
  reportFields: ApiReportField[];
}

const FormulaFieldsPanel: React.FC<FormulaFieldsPanelProps> = ({
  fieldsByCategory,
  expandedCategories,
  toggleCategory,
  searchTerm,
  onFieldSelect,
  reportFields
}) => {
  return (
    <div>
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className="border-b border-gray-200 last:border-b-0">
          <div
            className="p-1.5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleCategory(category)}
          >
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {category} ({fields.length})
            </div>
            <ChevronDownIcon 
              className={`transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`}
              size={14}
            />
          </div>

          {expandedCategories[category] && (
            <div className="pl-1.5">
              {reportFields
                .filter((field:ApiReportField) =>
                  !searchTerm.trim() ||
                  field.columnDisplayName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((field: ApiReportField )=> (
                  <div
                    key={field.id}
                    className="pl-1.5 pr-2 py-1 text-xs hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                    onClick={() => onFieldSelect(field)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-sm text-[10px] ${
                        field.type === 'number' || field.type === 'currency' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {field.icon}
                      </span>
                      <span className="truncate">{field.columnDisplayName}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormulaFieldsPanel; 