import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  CrossIcon,
  InfoIcon,
  SearchIcon
} from "@/components/icons";
import { translateFormulaToDuckDBSQL } from '../util/FormulaTranslator';
import FormulaFieldsPanel from './formula/FormulaFieldsPanel';
import FormulaFunctionsPanel from './formula/FormulaFunctionsPanel';
import FormulaEditor from './formula/FormulaEditor';
import FormulaSettings from './formula/FormulaSettings';
import SqlPreview from './formula/SqlPreview';
import {ApiReportField} from "@/app/(secure)/report-builder/services/api-types";

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
    alias: string;
    isFormula: boolean;
  }) => void;
  fieldsByCategory: Record<string, ApiReportField[]>;
  formulaFunctions: FunctionCategory[];
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  searchTerm: string;
  formulaSearchTerm: string;
  onSearchTermChange: (value: string) => void;
  onFormulaSearchTermChange: (value: string) => void;
  editFormulaColumn?: {
    id: string;
    name: string;
    type: string;
    formula: string;
    description: string;
    alias: string;
    isFormula: boolean;
    isSummaryFormula?: boolean;
  };
  isSummaryFormula?: boolean;
  title?: string;
  reportFields: ApiReportField[];
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
  onFormulaSearchTermChange,
  editFormulaColumn,
  isSummaryFormula = false,
  title = "Add Formula",
  reportFields
}) => {
  // Local state
  const [formulaName, setFormulaName] = useState(editFormulaColumn?.name || "");
  const [formulaAlias, setFormulaAlias] = useState(editFormulaColumn?.alias || "");
  const [formulaDescription, setFormulaDescription] = useState(editFormulaColumn?.description || "");
  const [formulaEditorValue, setFormulaEditorValue] = useState(editFormulaColumn?.formula || "");
  const [formulaOutputType, setFormulaOutputType] = useState(editFormulaColumn?.type || "number");
  const [decimalPoints, setDecimalPoints] = useState("2");
  const [formulaDialogTab, setFormulaDialogTab] = useState("fields");
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [sqlPreview, setSqlPreview] = useState("");
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Initialize form fields when editFormulaColumn changes
  useEffect(() => {
    if (editFormulaColumn) {
      setFormulaName(editFormulaColumn.name);
      setFormulaAlias(editFormulaColumn.alias);
      setFormulaDescription(editFormulaColumn.description);
      setFormulaEditorValue(editFormulaColumn.formula);
      setFormulaOutputType(editFormulaColumn.type);
      // Automatically validate and show SQL preview for existing formulas
      setTimeout(() => validateFormula(), 300);
    }
  }, [editFormulaColumn]);

  // Get all fields as a flat array
  const getAllFields = () => {
    /*const fields: Field[] = [];
    Object.values(fieldsByCategory).forEach(categoryFields => {
      fields.push(...categoryFields);
    });*/
    return reportFields;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateFormula() || !formulaName) {
      return;
    }

    // Create a new formula column or update existing one
    const newFormulaColumn = {
      id: editFormulaColumn?.id || `formula_${Date.now()}`,
      name: formulaName,
      type: formulaOutputType,
      formula: formulaEditorValue,
      description: formulaDescription,
      alias: formulaAlias,
      isFormula: true,
      // Always explicitly set the isSummaryFormula flag based on both the existing value and the prop
      isSummaryFormula: !!(editFormulaColumn?.isSummaryFormula || isSummaryFormula)
    };

    console.log('FormulaBuilder submitting:', newFormulaColumn);
    onSubmit(newFormulaColumn);

    // Reset form
    resetForm();
  };

  // Reset the form fields
  const resetForm = () => {
    setFormulaName("");
    setFormulaAlias("");
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

  // Modify validateFormula for summary formulas
  const validateFormula = () => {
    try {
      // For summary formulas, we don't need SQL validation
      if (isSummaryFormula) {
        // Simple validation for common aggregation functions
        const validFunctions = ['SUM', 'AVG', 'AVERAGE', 'MIN', 'MAX', 'COUNT'];
        const formula = formulaEditorValue.toUpperCase();
        
        // Check if the formula contains at least one of the valid functions
        const isValid = validFunctions.some(func => formula.includes(func));
        
        if (!isValid) {
          setValidationResult({ 
            success: false, 
            message: `Error: Summary formula must use one of these functions: ${validFunctions.join(', ')}` 
          });
          return false;
        }
        
        setValidationResult({ 
          success: true, 
          message: "Summary formula is valid." 
        });
        return true;
      }

      // Regular formula validation with SQL translation
      // Create a field map from the available fields
      const fieldMap: Record<string, string> = {};
      reportFields.forEach((fields) => {
        fieldMap[fields.duckDBColumnName] = fields.duckDBColumnName.toLowerCase();
      });

      // Translate the formula to SQL to check for syntax errors
      const sql = translateFormulaToDuckDBSQL(formulaEditorValue, fieldMap, formulaAlias);
      
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
      return true;
    } catch (error) {
      setValidationResult({ 
        success: false, 
        message: `Error: ${(error as Error).message}` 
      });
      return false;
    }
  };

  // Modify the effect for SQL preview to handle summary formulas
  useEffect(() => {
    if (formulaEditorValue.trim()) {
      try {
        if (isSummaryFormula) {
          // For summary formulas, just show the formula without SQL translation
          setSqlPreview("Summary formulas are only used for client-side aggregation in the grid view.");
          return;
        }

        // Create a field map from the available fields
        const fieldMap: Record<string, string> = {};
        reportFields.forEach((fields) => {
          fieldMap[fields.duckDBColumnName] = fields.duckDBColumnName.toLowerCase();
        });
        // Translate the formula to SQL
        const sql = translateFormulaToDuckDBSQL(formulaEditorValue, fieldMap, formulaAlias);
        setSqlPreview(sql);
      } catch (error) {
        setSqlPreview(`Error: ${(error as Error).message}`);
      }
    } else {
      setSqlPreview("");
    }
  }, [formulaEditorValue, fieldsByCategory, formulaAlias, isSummaryFormula]);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-background border-b px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <CrossIcon className="size-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="grid md:grid-cols-3 gap-4 h-full">
            {/* Left Section: Fields and Functions */}
            <div>
              <div className="mb-3">
                <div className="flex space-x-0.5 mb-2 border-b">
                  <button
                    className={`px-3 py-1.5 text-xs font-medium ${formulaDialogTab === "fields" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setFormulaDialogTab("fields")}
                  >
                    Fields
                  </button>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium ${formulaDialogTab === "functions" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setFormulaDialogTab("functions")}
                  >
                    Functions
                  </button>
                </div>
                {formulaDialogTab === "functions" && (
                  <div className="mb-2 relative">
                    <input
                      type="text"
                      className="w-full px-2.5 pl-7 py-1.5 text-xs border border-gray-300 rounded"
                      placeholder="Search functions..."
                      value={formulaSearchTerm}
                      onChange={(e) => onFormulaSearchTermChange(e.target.value)}
                    />
                    <SearchIcon className="absolute left-2 top-1.5 size-3.5 text-gray-400" />
                  </div>
                )}
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
                        return prev + field.duckDBColumnName || field.columnName || field.id;
                      });
                    }}
                    reportFields={reportFields}
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
                  formulaAlias={formulaAlias}
                  setFormulaAlias={setFormulaAlias}
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