import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDownIcon,
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
import { FieldsPanelField } from './FieldsPanel';

// Define the types needed for functions
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
  fieldsByCategory: Record<string, FieldsPanelField[]>;
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
  title = "Add Formula"
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
    const fields: FieldsPanelField[] = [];
    Object.values(fieldsByCategory).forEach(categoryFields => {
      fields.push(...categoryFields);
    });
    return fields;
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
      Object.entries(fieldsByCategory).forEach(([_, fields]) => {
        fields.forEach(field => {
          fieldMap[field.id] = field.id.toLowerCase();
        });
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
        Object.entries(fieldsByCategory).forEach(([_, fields]) => {
          fields.forEach(field => {
            fieldMap[field.id] = field.id.toLowerCase();
          });
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
  }, [formulaEditorValue, fieldsByCategory, isSummaryFormula, formulaAlias]);

  // Add a field name or function to the formula editor
  const addToFormula = (text: string) => {
    setFormulaEditorValue(prev => prev + text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CrossIcon size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: Fields and Functions */}
          <div className="w-1/4 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  className={`py-1.5 px-3 text-sm rounded-md ${
                    formulaDialogTab === "fields"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setFormulaDialogTab("fields")}
                >
                  Fields
                </button>
                <button
                  className={`py-1.5 px-3 text-sm rounded-md ${
                    formulaDialogTab === "functions"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setFormulaDialogTab("functions")}
                >
                  Functions
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {formulaDialogTab === "fields" ? (
                <FormulaFieldsPanel
                  fieldsByCategory={fieldsByCategory}
                  expandedCategories={expandedCategories}
                  toggleCategory={toggleCategory}
                  searchTerm={searchTerm}
                  onSearchTermChange={onSearchTermChange}
                  addToFormula={(field) => addToFormula(field.id)}
                />
              ) : (
                <FormulaFunctionsPanel
                  functionCategories={formulaFunctions}
                  searchTerm={formulaSearchTerm}
                  onSearchTermChange={onFormulaSearchTermChange}
                  addToFormula={(func) => addToFormula(`${func.name}()`)}
                />
              )}
            </div>
          </div>

          {/* Center panel: Formula editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="formula-name">Formula Name</Label>
                  <Input
                    id="formula-name"
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    placeholder="Enter a name for your formula"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="formula-editor">Formula</Label>
                    {validationResult && (
                      <div
                        className={`text-xs flex items-center ${
                          validationResult.success
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <InfoIcon className="mr-1" size={12} />
                        {validationResult.message}
                      </div>
                    )}
                  </div>
                  <FormulaEditor
                    value={formulaEditorValue}
                    onChange={setFormulaEditorValue}
                    onValidate={validateFormula}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <FormulaSettings
                  formulaOutputType={formulaOutputType}
                  setFormulaOutputType={setFormulaOutputType}
                  formulaDescription={formulaDescription}
                  setFormulaDescription={setFormulaDescription}
                  formulaAlias={formulaAlias}
                  setFormulaAlias={setFormulaAlias}
                  decimalPoints={decimalPoints}
                  setDecimalPoints={setDecimalPoints}
                  isSummaryFormula={isSummaryFormula}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>SQL Preview</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSqlPreview(!showSqlPreview)}
                    >
                      {showSqlPreview ? "Hide" : "Show"} SQL
                    </Button>
                  </div>
                  
                  {showSqlPreview && (
                    <SqlPreview 
                      sql={sqlPreview}
                      success={validationResult?.success || false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleClose}
            variant="outline"
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formulaName || !formulaEditorValue}
          >
            Save Formula
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormulaBuilder; 