import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDownIcon,
  CrossIcon,
  InfoIcon
} from "@/components/icons";
import { translateFormulaToDuckDBSQL } from '../util/FormulaTranslator';
import FormulaFieldsPanel from './formula/FormulaFieldsPanel';
import FormulaFunctionsPanel from './formula/FormulaFunctionsPanel';
import FormulaEditor from './formula/FormulaEditor';
import FormulaSettings from './formula/FormulaSettings';
import SqlPreview from './formula/SqlPreview';

// Define the types needed
type Field = {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: React.ReactNode;
};

type Function = {
  name: string;
  description: string;
};

type FunctionCategory = {
  category: string;
  functions: Function[];
};

interface FormulaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formulaColumn: {
    id: string;
    name: string;
    type: string;
    formula: string;
    description: string;
  }) => void;
  fieldsByCategory: Record<string, Field[]>;
  formulaFunctions: FunctionCategory[];
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  searchTerm: string;
  formulaSearchTerm: string;
  onSearchTermChange: (value: string) => void;
  onFormulaSearchTermChange: (value: string) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fieldsByCategory,
  formulaFunctions,
  expandedCategories,
  toggleCategory,
  searchTerm,
  formulaSearchTerm,
  onSearchTermChange,
  onFormulaSearchTermChange
}) => {
  // Local state
  const [formulaName, setFormulaName] = useState("");
  const [formulaDescription, setFormulaDescription] = useState("");
  const [formulaEditorValue, setFormulaEditorValue] = useState("");
  const [formulaOutputType, setFormulaOutputType] = useState("number");
  const [decimalPoints, setDecimalPoints] = useState("2");
  const [formulaDialogTab, setFormulaDialogTab] = useState("fields");
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [sqlPreview, setSqlPreview] = useState("");
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Get all fields as a flat array
  const getAllFields = () => {
    const fields: Field[] = [];
    Object.values(fieldsByCategory).forEach(categoryFields => {
      fields.push(...categoryFields);
    });
    return fields;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formulaName.trim()) return;

    // Create a new formula column
    const newFormulaColumn = {
      id: `formula_${Date.now()}`,
      name: formulaName,
      type: formulaOutputType,
      formula: formulaEditorValue,
      description: formulaDescription,
    };

    onSubmit(newFormulaColumn);

    // Reset form
    resetForm();
  };

  // Reset the form fields
  const resetForm = () => {
    setFormulaName("");
    setFormulaDescription("");
    setFormulaEditorValue("");
    setFormulaOutputType("number");
    setDecimalPoints("2");
  };

  // Close the modal and reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate the formula
  const validateFormula = () => {
    try {
      // Create a field map from the available fields
      const fieldMap: Record<string, string> = {};
      Object.entries(fieldsByCategory).forEach(([_, fields]) => {
        fields.forEach(field => {
          fieldMap[field.id] = field.id.toLowerCase();
        });
      });

      // Translate the formula to SQL to check for syntax errors
      const sql = translateFormulaToDuckDBSQL(formulaEditorValue, fieldMap);
      
      // If we get here without errors, the formula is valid
      setValidationResult({ 
        success: true, 
        message: "Formula is valid and can be converted to SQL." 
      });
      
      // Automatically show SQL preview on successful validation
      if (!showSqlPreview) {
        setShowSqlPreview(true);
      }
      
      setSqlPreview(sql);
    } catch (error) {
      setValidationResult({ 
        success: false, 
        message: `Error: ${(error as Error).message}` 
      });
    }
  };

  // Update function to create field map for formula translation
  useEffect(() => {
    if (formulaEditorValue.trim()) {
      try {
        // Create a field map from the available fields
        const fieldMap: Record<string, string> = {};
        Object.entries(fieldsByCategory).forEach(([_, fields]) => {
          fields.forEach(field => {
            fieldMap[field.id] = field.id.toLowerCase();
          });
        });

        // Translate the formula to SQL
        const sql = translateFormulaToDuckDBSQL(formulaEditorValue, fieldMap);
        setSqlPreview(sql);
      } catch (error) {
        setSqlPreview(`Error: ${(error as Error).message}`);
      }
    } else {
      setSqlPreview("");
    }
  }, [formulaEditorValue, fieldsByCategory]);

  if (!isOpen) return null;

  // Filter formula functions based on search term
  const filteredFunctions = formulaSearchTerm.trim() === ""
    ? formulaFunctions
    : formulaFunctions.map(category => ({
      category: category.category,
      functions: category.functions.filter(func =>
        func.name.toLowerCase().includes(formulaSearchTerm.toLowerCase()) ||
        func.description.toLowerCase().includes(formulaSearchTerm.toLowerCase())
      )
    })).filter(category => category.functions.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-semibold">Edit Row-Level Formula Column</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CrossIcon size={18} />
          </button>
        </div>

        <div className="p-2 text-xs text-gray-600">
          Create a custom formula to calculate values for each row in your report.
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Section: Fields & Functions */}
            <div className="md:col-span-1 border border-gray-200 rounded-md overflow-hidden max-h-[calc(100vh-240px)]">
              <div className="border-b border-gray-200">
                <div className="flex w-full">
                  <button
                    onClick={() => setFormulaDialogTab("fields")}
                    className={`flex-1 px-3 py-1.5 text-center text-xs ${formulaDialogTab === "fields"
                      ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "bg-gray-50 text-gray-600"}`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => setFormulaDialogTab("functions")}
                    className={`flex-1 px-3 py-1.5 text-center text-xs ${formulaDialogTab === "functions"
                      ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "bg-gray-50 text-gray-600"}`}
                  >
                    Functions
                  </button>
                </div>
              </div>

              <div className="p-1.5 border-b border-gray-200">
                <Input
                  placeholder={formulaDialogTab === "fields" ? "Search fields..." : "Search functions..."}
                  value={formulaDialogTab === "fields" ? searchTerm : formulaSearchTerm}
                  onChange={(e) => formulaDialogTab === "fields"
                    ? onSearchTermChange(e.target.value)
                    : onFormulaSearchTermChange(e.target.value)
                  }
                  className="text-xs h-7"
                />
              </div>

              {/* Sidebar content */}
              <div className="overflow-y-auto max-h-full">
                {formulaDialogTab === "fields" ? (
                  <FormulaFieldsPanel 
                    fieldsByCategory={fieldsByCategory}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    searchTerm={searchTerm}
                    onFieldSelect={(field) => {
                      // Insert field at the current cursor position
                      setFormulaEditorValue(prev => {
                        return prev + field.id;
                      });
                    }}
                  />
                ) : (
                  <FormulaFunctionsPanel 
                    filteredFunctions={filteredFunctions}
                    onFunctionSelect={(funcName) => {
                      // Insert function at the current cursor position
                      setFormulaEditorValue(prev => {
                        return prev + `${funcName}()`;
                      });
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Section: Formula Builder */}
            <div className="md:col-span-2">
              <div className="space-y-3">
                <FormulaSettings
                  formulaName={formulaName}
                  setFormulaName={setFormulaName}
                  formulaDescription={formulaDescription}
                  setFormulaDescription={setFormulaDescription}
                  formulaOutputType={formulaOutputType}
                  setFormulaOutputType={setFormulaOutputType}
                  decimalPoints={decimalPoints}
                  setDecimalPoints={setDecimalPoints}
                />

                <FormulaEditor
                  value={formulaEditorValue}
                  onChange={setFormulaEditorValue}
                  fields={getAllFields()}
                  functions={formulaFunctions.flatMap(cat => cat.functions)}
                />

                <div className="flex justify-end mt-2 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setShowSqlPreview(!showSqlPreview)}
                  >
                    {showSqlPreview ? "Hide SQL" : "Preview SQL"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    disabled={!formulaEditorValue.trim()}
                    onClick={validateFormula}
                  >
                    Validate Formula
                  </Button>
                </div>

                {/* SQL Preview section */}
                {showSqlPreview && formulaEditorValue.trim() && (
                  <SqlPreview sqlPreview={sqlPreview} />
                )}

                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-700 mt-3">
                  <InfoIcon className="mt-0.5 w-3.5 h-3.5" />
                  <div>
                    <strong>Tips for creating formulas:</strong>
                    <ul className="list-disc ml-4 mt-0.5 text-[11px]">
                      <li>Use field names directly in formulas, e.g.: Amount * 0.10</li>
                      <li>Numeric operations: +, -, *, /, ^ (exponentiation)</li>
                      <li>Use functions like SUM(), MAX(), IF() for advanced calculations</li>
                      <li>Validate your formula before applying it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 flex justify-between items-center">
          {validationResult && (
            <div className={`text-xs px-2.5 py-1 rounded-md ${
              validationResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {validationResult.message}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={handleSubmit}
              disabled={!formulaName.trim() || !formulaEditorValue.trim() || (validationResult !== null && !validationResult.success)}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaBuilder; 