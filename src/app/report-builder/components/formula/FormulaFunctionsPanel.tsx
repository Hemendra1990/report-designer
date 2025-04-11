import React from 'react';

type Function = {
  name: string;
  description: string;
};

type FunctionCategory = {
  category: string;
  functions: Function[];
};

interface FormulaFunctionsPanelProps {
  filteredFunctions: FunctionCategory[];
  onFunctionSelect: (functionName: string) => void;
}

const FormulaFunctionsPanel: React.FC<FormulaFunctionsPanelProps> = ({
  filteredFunctions,
  onFunctionSelect
}) => {
  return (
    <div>
      {filteredFunctions.map((category) => (
        <div key={category.category} className="border-b border-gray-200 last:border-b-0">
          <div className="p-1.5 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {category.category} ({category.functions.length})
            </div>
          </div>
          <div className="pl-1.5">
            {category.functions.map((func) => (
              <div
                key={func.name}
                className="pl-1.5 pr-2 py-1 text-xs hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                onClick={() => onFunctionSelect(func.name)}
              >
                <div>
                  <div className="font-medium text-blue-600">{func.name}</div>
                  <div className="text-[10px] text-gray-500">{func.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormulaFunctionsPanel; 