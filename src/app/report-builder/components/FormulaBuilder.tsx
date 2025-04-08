import React, { useState } from 'react';
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

  // Insert a field into the formula editor
  const insertFieldIntoFormula = (field: Field) => {
    setFormulaEditorValue(prev => `${prev}[${field.name}]`);
  };

  // Insert a function into the formula editor
  const insertFunctionIntoFormula = (funcName: string) => {
    setFormulaEditorValue(prev => `${prev}${funcName}()`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Row-Level Formula Column</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CrossIcon size={20} />
          </button>
        </div>

        <div className="p-4 text-sm text-gray-600">
          Create a custom formula to calculate values for each row in your report.
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Section: Fields & Functions */}
            <div className="md:col-span-1 border border-gray-200 rounded-md overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex w-full">
                  <button
                    onClick={() => setFormulaDialogTab("fields")}
                    className={`flex-1 px-4 py-2 text-center ${formulaDialogTab === "fields"
                      ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "bg-gray-50 text-gray-600"}`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => setFormulaDialogTab("functions")}
                    className={`flex-1 px-4 py-2 text-center ${formulaDialogTab === "functions"
                      ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "bg-gray-50 text-gray-600"}`}
                  >
                    Functions
                  </button>
                </div>
              </div>

              <div className="p-2 border-b border-gray-200">
                <Input
                  placeholder={formulaDialogTab === "fields" ? "Search fields..." : "Search functions..."}
                  value={formulaDialogTab === "fields" ? searchTerm : formulaSearchTerm}
                  onChange={(e) => formulaDialogTab === "fields"
                    ? onSearchTermChange(e.target.value)
                    : onFormulaSearchTermChange(e.target.value)
                  }
                  className="text-sm"
                />
              </div>

              <div className="overflow-y-auto max-h-72">
                {formulaDialogTab === "fields" ? (
                  // Fields Tab Content
                  <div>
                    {Object.entries(fieldsByCategory).map(([category, fields]) => (
                      <div key={category} className="border-b border-gray-200 last:border-b-0">
                        <div
                          className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(category)}
                        >
                          <div className="text-xs font-semibold text-gray-500 uppercase">
                            {category} ({fields.length})
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
                                  className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                                  onClick={() => insertFieldIntoFormula(field)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                      {field.icon}
                                    </span>
                                    <span>{field.name}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Functions Tab Content
                  <div>
                    {filteredFunctions.map((category) => (
                      <div key={category.category} className="border-b border-gray-200 last:border-b-0">
                        <div className="p-2 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">
                            {category.category} ({category.functions.length})
                          </div>
                        </div>
                        <div className="pl-2">
                          {category.functions.map((func) => (
                            <div
                              key={func.name}
                              className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                              onClick={() => insertFunctionIntoFormula(func.name)}
                            >
                              <div>
                                <div className="font-medium text-blue-600">{func.name}</div>
                                <div className="text-xs text-gray-500">{func.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Formula Builder */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formula-name" className="flex items-center text-sm font-medium">
                      * Column Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="formula-name"
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      placeholder="Enter a name for this column"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formula-description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Input
                      id="formula-description"
                      value={formulaDescription}
                      onChange={(e) => setFormulaDescription(e.target.value)}
                      placeholder="Optional description"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="output-type" className="text-sm font-medium">
                      Formula Output Type
                    </Label>
                    <Select
                      value={formulaOutputType}
                      onValueChange={setFormulaOutputType}
                    >
                      <SelectTrigger id="output-type" className="mt-1">
                        <SelectValue placeholder="Select output type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="datetime">Date/Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formulaOutputType === 'number' || formulaOutputType === 'currency' || formulaOutputType === 'percent') && (
                    <div>
                      <Label htmlFor="decimal-points" className="text-sm font-medium">
                        Decimal Points
                      </Label>
                      <Select
                        value={decimalPoints}
                        onValueChange={setDecimalPoints}
                      >
                        <SelectTrigger id="decimal-points" className="mt-1">
                          <SelectValue placeholder="Select decimal points" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Formula</Label>
                    <div className="flex items-center space-x-1">
                      {['+', '-', '*', '/', '^', '(', ')'].map((op) => (
                        <button
                          key={op}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                          onClick={() => setFormulaEditorValue(prev => `${prev}${op}`)}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative border border-gray-300 rounded-md">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 border-r border-gray-300 text-right">
                      {Array.from({ length: Math.max((formulaEditorValue.match(/\n/g) || []).length + 1, 1) }).map((_, i) => (
                        <div key={i} className="text-xs text-gray-400 px-1.5 h-6 leading-6">{i + 1}</div>
                      ))}
                    </div>
                    <Textarea
                      value={formulaEditorValue}
                      onChange={(e) => setFormulaEditorValue(e.target.value)}
                      className="min-h-[150px] pl-8 font-mono text-sm resize-none"
                      placeholder="Enter your formula here..."
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!formulaEditorValue.trim()}
                    >
                      Validate Formula
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700">
                  <InfoIcon className="mt-0.5" />
                  <div>
                    <strong>Tips for creating formulas:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Use square brackets to reference fields: [Field Name]</li>
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

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formulaName.trim() || !formulaEditorValue.trim()}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormulaBuilder; 