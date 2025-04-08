import React, { useState, useEffect, useRef } from 'react';
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
  const [suggestions, setSuggestions] = useState<Array<{label: string, type: string, value: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionItemsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  // Get all fields as a flat array
  const getAllFields = () => {
    const fields: Field[] = [];
    Object.values(fieldsByCategory).forEach(categoryFields => {
      fields.push(...categoryFields);
    });
    return fields;
  };

  // Insert a field into the formula editor
  const insertFieldIntoFormula = (field: Field) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = 
        formulaEditorValue.substring(0, start) + 
        field.id +
        formulaEditorValue.substring(end);
      
      setFormulaEditorValue(newValue);
      
      // Focus the textarea and set cursor position after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = start + field.id.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } else {
      setFormulaEditorValue(prev => `${prev}${field.id}`);
    }
  };

  // Insert a function into the formula editor
  const insertFunctionIntoFormula = (funcName: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const insertText = `${funcName}()`;
      const newValue = 
        formulaEditorValue.substring(0, start) + 
        insertText + 
        formulaEditorValue.substring(end);
      
      setFormulaEditorValue(newValue);
      
      // Focus the textarea and set cursor position between parentheses
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = start + funcName.length + 1;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } else {
      setFormulaEditorValue(prev => `${prev}${funcName}()`);
    }
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

  // Get suggestions based on the current cursor position
  const getSuggestions = (text: string, cursorPos: number) => {
    // Get the word being typed
    const textUpToCursor = text.slice(0, cursorPos);
    
    // For field suggestions (starting with '[')
    const fieldMatch = textUpToCursor.match(/\[([^\]\[]*?)$/);
    if (fieldMatch) {
      const query = fieldMatch[1].toLowerCase();
      const fields = getAllFields();
      const fieldSuggestions = fields
        .filter(field => field.name.toLowerCase().includes(query) || field.id.toLowerCase().includes(query))
        .map(field => ({
          label: field.name,
          type: `field-${field.type}`,
          value: field.id // Use ID instead of name
        }));
      
      setSuggestions(fieldSuggestions);
      setShowSuggestions(fieldSuggestions.length > 0);
      return;
    }
    
    // For field suggestions without brackets (add them automatically)
    const wordMatch = textUpToCursor.match(/\b(\w+)$/);
    if (wordMatch && !textUpToCursor.endsWith(']')) {
      const query = wordMatch[1].toLowerCase();
      const fields = getAllFields();
      
      // Check if this might be a field name or ID
      const potentialFields = fields.filter(field => 
        field.name.toLowerCase().includes(query) || field.id.toLowerCase().includes(query)
      );
      
      if (potentialFields.length > 0) {
        const fieldSuggestions = potentialFields.map(field => ({
          label: field.name,
          type: `field-${field.type}`,
          value: field.id,
          isField: true
        }));
        
        // Add function suggestions too
        const allFunctions: Function[] = [];
        formulaFunctions.forEach(category => {
          category.functions.forEach(func => {
            allFunctions.push(func);
          });
        });
        
        const functionSuggestions = allFunctions
          .filter(func => func.name.toLowerCase().includes(query))
          .map(func => ({
            label: func.name,
            type: "function",
            value: `${func.name}()`, // Add parentheses for functions
            isField: false
          }));
        
        // Combine both types of suggestions
        setSuggestions([...fieldSuggestions, ...functionSuggestions]);
        setShowSuggestions(fieldSuggestions.length > 0 || functionSuggestions.length > 0);
        return;
      }
    }
    
    // For function suggestions only
    const functionMatch = textUpToCursor.match(/(\w+)$/);
    if (functionMatch) {
      const query = functionMatch[1].toLowerCase();
      const allFunctions: Function[] = [];
      
      formulaFunctions.forEach(category => {
        category.functions.forEach(func => {
          allFunctions.push(func);
        });
      });
      
      const functionSuggestions = allFunctions
        .filter(func => func.name.toLowerCase().includes(query))
        .map(func => ({
          label: func.name,
          type: "function",
          value: `${func.name}()`, // Add parentheses for functions
          isField: false
        }));
      
      setSuggestions(functionSuggestions);
      setShowSuggestions(functionSuggestions.length > 0);
      return;
    }
    
    // Hide suggestions if no match
    setShowSuggestions(false);
  };

  // Update function to calculate cursor position
  const updateCursorCoordinates = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      setCursorPosition(cursorPos);
      
      const text = textarea.value;
      
      // Calculate line and exact position
      const textBeforeCursor = text.substring(0, cursorPos);
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLineText = lines[currentLineIndex];
      
      // Get the current line from start up to cursor
      const cursorLine = currentLineText;
      
      try {
        // Create a measurement container with the same styling as textarea
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = `${textarea.clientWidth - 32}px`; // Account for line numbers
        container.style.height = 'auto';
        container.style.whiteSpace = 'pre-wrap';
        container.style.wordBreak = 'break-word';
        container.style.visibility = 'hidden';
        container.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
        container.style.fontSize = window.getComputedStyle(textarea).fontSize;
        container.style.padding = window.getComputedStyle(textarea).padding;
        
        // Measure exactly at the cursor position
        const textBeforeCursorSpan = document.createElement('span');
        textBeforeCursorSpan.textContent = cursorLine;
        
        // Add a marker at cursor position
        const cursorMarker = document.createElement('span');
        cursorMarker.textContent = '|';
        cursorMarker.style.position = 'relative';
        cursorMarker.style.visibility = 'hidden';
        
        container.appendChild(textBeforeCursorSpan);
        container.appendChild(cursorMarker);
        document.body.appendChild(container);
        
        // Get measurements
        const containerRect = container.getBoundingClientRect();
        const cursorMarkerRect = cursorMarker.getBoundingClientRect();
        
        // Clean up
        document.body.removeChild(container);
        
        // Calculate line height
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 
                           parseInt(window.getComputedStyle(textarea).fontSize) * 1.2;
        
        // Calculate cursor position
        const lineNumberWidth = 32; // Width of line numbers
        
        // Account for scroll position
        const scrollLeft = textarea.scrollLeft;
        const scrollTop = textarea.scrollTop;
        
        // Set the coordinates
        const x = textBeforeCursorSpan.offsetWidth + lineNumberWidth - scrollLeft;
        const y = currentLineIndex * lineHeight + lineHeight - scrollTop;
        
        setCursorCoords({ 
          x: Math.max(lineNumberWidth, x),
          y: Math.max(lineHeight, y)
        });
      } catch (error) {
        // Fallback to a simpler calculation if the above fails
        console.error('Error calculating cursor position:', error);
        
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 
                           parseInt(window.getComputedStyle(textarea).fontSize) * 1.2;
        const lineNumberWidth = 32;
        const avgCharWidth = 8; // Approximate width of a character in pixels
        
        setCursorCoords({
          x: lineNumberWidth + (cursorLine.length * avgCharWidth),
          y: (currentLineIndex * lineHeight) + lineHeight
        });
      }
      
      getSuggestions(text, cursorPos);
    }
  };

  // Update the handleTextareaChange function
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFormulaEditorValue(newValue);
    updateCursorCoordinates();
  };

  // Update the handleTextareaKeyUp function
  const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Skip special keys that don't change cursor position
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Escape' && e.key !== 'Enter') {
      updateCursorCoordinates();
    }
  };

  // Also track cursor position on click and selection
  const handleTextareaClick = () => {
    updateCursorCoordinates();
  };

  // Handle suggestion selection with keyboard
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;
    
    // Navigate through suggestions
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    }
    // Select suggestion with enter or tab
    else if (e.key === 'Enter' || e.key === 'Tab') {
      if (suggestions.length > 0 && showSuggestions) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
      }
    } 
    // Close suggestions with escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  // Apply the selected suggestion
  const applySuggestion = (suggestion: {label: string, type: string, value: string, isField?: boolean}) => {
    if (textareaRef.current) {
      const currentText = formulaEditorValue;
      let beforeCursor = currentText.substring(0, cursorPosition);
      const afterCursor = currentText.substring(cursorPosition);
      
      // For field suggestions, we no longer need special handling for brackets
      // Just replace the partial word
      const match = beforeCursor.match(/\w+$/);
      if (match) {
        beforeCursor = beforeCursor.substring(0, beforeCursor.length - match[0].length);
      }
      
      // Create new text with suggestion
      const newText = beforeCursor + suggestion.value + afterCursor;
      setFormulaEditorValue(newText);
      
      // Update cursor position
      const newCursorPos = beforeCursor.length + suggestion.value.length;
      
      // If it's a function, position cursor inside parentheses
      const isFunctionWithParens = suggestion.type === 'function' && suggestion.value.endsWith('()');
      
      // Set focus and cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          if (isFunctionWithParens) {
            // Position cursor inside the parentheses
            textareaRef.current.setSelectionRange(newCursorPos - 1, newCursorPos - 1);
          } else {
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }
      }, 0);
    }
    
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [suggestions]);

  // Make sure the selected suggestion is visible by scrolling
  useEffect(() => {
    if (showSuggestions && suggestionItemsRef.current[selectedSuggestionIndex]) {
      suggestionItemsRef.current[selectedSuggestionIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedSuggestionIndex, showSuggestions]);

  // Initialize the refs array when suggestions change
  useEffect(() => {
    suggestionItemsRef.current = suggestions.map(() => null);
  }, [suggestions]);

  // Ensure the suggestions dropdown doesn't go out of bounds
  const getSuggestionPosition = () => {
    if (!textareaRef.current) return { left: 0, top: 0 };
    
    const textareaRect = textareaRef.current.getBoundingClientRect();
    const editorHeight = textareaRect.height;
    const editorWidth = textareaRect.width;
    
    // Position relative to the cursor
    let left = cursorCoords.x;
    let top = cursorCoords.y;
    
    // Width of the suggestions dropdown
    const dropdownWidth = 250;
    const dropdownHeight = Math.min(suggestions.length * 36, 200); // Approximate height
    
    // Ensure the dropdown doesn't go off the right edge
    if (left + dropdownWidth > editorWidth - 10) {
      left = Math.max(8, editorWidth - dropdownWidth - 10);
    }
    
    // Ensure the dropdown doesn't go off the bottom
    // But first, check if there's room above
    if (top + dropdownHeight > editorHeight - 10) {
      // Position above the cursor if it would go off bottom and there's room above
      if (top - dropdownHeight > 10) {
        top = top - dropdownHeight - 5;
      } else {
        // Or place it at the bottom of the editor, but with some margin
        top = Math.max(10, editorHeight - dropdownHeight - 10);
      }
    }
    
    return { left, top };
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
            {/* Left Section: Fields & Functions - Reduced padding */}
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

              {/* Sidebar content with reduced spacing */}
              <div className="overflow-y-auto max-h-full">
                {formulaDialogTab === "fields" ? (
                  // Fields Tab Content
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
                            className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`}
                            size={14}
                          />
                        </div>

                        {expandedCategories[category as keyof typeof expandedCategories] && (
                          <div className="pl-1.5">
                            {fields
                              .filter(field =>
                                !searchTerm.trim() ||
                                field.name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map(field => (
                                <div
                                  key={field.id}
                                  className="pl-1.5 pr-2 py-1 text-xs hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                                  onClick={() => insertFieldIntoFormula(field)}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-sm text-[10px] ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                      {field.icon}
                                    </span>
                                    <span className="truncate">{field.name}</span>
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
                              onClick={() => insertFunctionIntoFormula(func.name)}
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
                )}
              </div>
            </div>

            {/* Right Section: Formula Builder - Reduced spacing */}
            <div className="md:col-span-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="formula-name" className="flex items-center text-xs font-medium">
                      * Column Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="formula-name"
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      placeholder="Enter a name for this column"
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formula-description" className="text-xs font-medium">
                      Description
                    </Label>
                    <Input
                      id="formula-description"
                      value={formulaDescription}
                      onChange={(e) => setFormulaDescription(e.target.value)}
                      placeholder="Optional description"
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="output-type" className="text-xs font-medium">
                      Formula Output Type
                    </Label>
                    <Select
                      value={formulaOutputType}
                      onValueChange={setFormulaOutputType}
                    >
                      <SelectTrigger id="output-type" className="mt-1 h-8 text-xs">
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
                      <Label htmlFor="decimal-points" className="text-xs font-medium">
                        Decimal Points
                      </Label>
                      <Select
                        value={decimalPoints}
                        onValueChange={setDecimalPoints}
                      >
                        <SelectTrigger id="decimal-points" className="mt-1 h-8 text-xs">
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
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Formula</Label>
                    <div className="flex items-center space-x-1">
                      {['+', '-', '*', '/', '^', '(', ')'].map((op) => (
                        <button
                          key={op}
                          className="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs"
                          onClick={() => {
                            if (textareaRef.current) {
                              const start = textareaRef.current.selectionStart;
                              const end = textareaRef.current.selectionEnd;
                              const newValue = 
                                formulaEditorValue.substring(0, start) + 
                                op + 
                                formulaEditorValue.substring(end);
                              
                              setFormulaEditorValue(newValue);
                              
                              // Focus and set cursor position
                              setTimeout(() => {
                                if (textareaRef.current) {
                                  textareaRef.current.focus();
                                  const newCursorPos = start + op.length;
                                  textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                }
                              }, 0);
                            } else {
                              setFormulaEditorValue(prev => `${prev}${op}`);
                            }
                          }}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative border border-gray-300 rounded-md">
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gray-50 border-r border-gray-300 text-right">
                      {Array.from({ length: Math.max((formulaEditorValue.match(/\n/g) || []).length + 1, 1) }).map((_, i) => (
                        <div key={i} className="text-[10px] text-gray-400 px-1 h-5 leading-5">{i + 1}</div>
                      ))}
                    </div>
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={formulaEditorValue}
                        onChange={handleTextareaChange}
                        onKeyUp={handleTextareaKeyUp}
                        onKeyDown={handleTextareaKeyDown}
                        onClick={handleTextareaClick}
                        className="min-h-[120px] pl-6 font-mono text-xs resize-none leading-5"
                        placeholder="Enter your formula here..."
                        spellCheck={false}
                      />
                      
                      {/* Suggestions dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div 
                          ref={suggestionsRef}
                          className="absolute z-10 max-h-48 w-56 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          style={{
                            left: `${getSuggestionPosition().left}px`,
                            top: `${getSuggestionPosition().top}px`,
                            maxWidth: '220px'
                          }}
                        >
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={`${suggestion.label}-${index}`}
                              ref={el => {
                                suggestionItemsRef.current[index] = el;
                              }}
                              className={`flex cursor-pointer select-none items-center px-3 py-1.5 ${
                                index === selectedSuggestionIndex 
                                  ? 'bg-blue-100 text-blue-900' 
                                  : 'hover:bg-blue-50'
                              }`}
                              onClick={() => applySuggestion(suggestion)}
                              onMouseEnter={() => setSelectedSuggestionIndex(index)}
                            >
                              <span className={`w-3.5 h-3.5 mr-1.5 flex items-center justify-center rounded-sm text-[10px] ${
                                suggestion.type.includes('number') || suggestion.type.includes('currency') 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : suggestion.type === 'function'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {suggestion.type === 'function' ? 'ƒ' : '#'}
                              </span>
                              <span className="flex-1 truncate">{suggestion.label}</span>
                              <span className="text-[10px] text-gray-500 ml-1">
                                {suggestion.type === 'function' ? 'function' : suggestion.type.replace('field-', '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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

                  {/* SQL Preview section with fixed height */}
                  {showSqlPreview && formulaEditorValue.trim() && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium">SQL Translation (DuckDB)</Label>
                      <div className="p-2 bg-gray-50 rounded-md border border-gray-200 text-xs font-mono overflow-x-auto text-gray-700 mt-1 h-20 overflow-y-auto">
                        {sqlPreview || "No SQL preview available"}
                      </div>
                    </div>
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