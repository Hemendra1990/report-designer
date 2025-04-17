import React, {useEffect, useRef, useState} from 'react';
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {ApiReportField} from "@/app/(secure)/report-builder/services/api-types";

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

interface FormulaEditorProps {
    value: string;
    onChange: (value: string) => void;
    fields: ApiReportField[];
    functions: Function[];
}

const FormulaEditor: React.FC<FormulaEditorProps> = ({
                                                         value,
                                                         onChange,
                                                         fields,
                                                         functions
                                                     }) => {
    // Local state for suggestions
    const [suggestions, setSuggestions] = useState<Array<{ label: string, type: string, value: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [cursorCoords, setCursorCoords] = useState({x: 0, y: 0});

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const suggestionItemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Calculate cursor position and update suggestions
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

    // Get suggestions based on the current cursor position
    const getSuggestions = (text: string, cursorPos: number) => {
        // Get the word being typed
        const textUpToCursor = text.slice(0, cursorPos);

        // For field suggestions (starting with '[')
        const fieldMatch = textUpToCursor.match(/\[([^\]\[]*?)$/);
        if (fieldMatch) {
            const query = fieldMatch[1].toLowerCase();
            /*const fieldSuggestions = fields
                .filter(field => field.name.toLowerCase().includes(query) || field.id.toLowerCase().includes(query))
                .map(field => ({
                    label: field.name,
                    type: `field-${field.type}`,
                    value: field.id // Use ID instead of name
                }));*/
            const fieldSuggestions = fields
                .filter(field => field.columnDisplayName.toLowerCase().includes(query) || field.duckDBColumnName.toLowerCase().includes(query))
                .map(field => ({
                    label: field.columnDisplayName,
                    type: `field-${field.type}`,
                    value: field.duckDBColumnName // Use ID instead of name
                }));

            setSuggestions(fieldSuggestions);
            setShowSuggestions(fieldSuggestions.length > 0);
            return;
        }

        // For field suggestions without brackets (add them automatically)
        const wordMatch = textUpToCursor.match(/\b(\w+)$/);
        if (wordMatch && !textUpToCursor.endsWith(']')) {
            const query = wordMatch[1].toLowerCase();

            // Check if this might be a field name or ID
            const potentialFields = fields.filter((field: ApiReportField) =>
                field.columnDisplayName.toLowerCase().includes(query) || field.duckDBColumnName.toLowerCase().includes(query)
            );

            if (potentialFields.length > 0) {
                const fieldSuggestions = potentialFields.map(field => ({
                    label: field.columnDisplayName,
                    type: `field-${field.type}`,
                    value: field.duckDBColumnName || field.columnName || field.id,
                    isField: true
                }));

                // Add function suggestions too
                const functionSuggestions = functions
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

            const functionSuggestions = functions
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

    // Event handlers
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        updateCursorCoordinates();
    };

    const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Skip special keys that don't change cursor position
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Escape' && e.key !== 'Enter') {
            updateCursorCoordinates();
        }
    };

    const handleTextareaClick = () => {
        updateCursorCoordinates();
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions) return;

        // Navigate through suggestions
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
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
    const applySuggestion = (suggestion: { label: string, type: string, value: string, isField?: boolean }) => {
        if (textareaRef.current) {
            const currentText = value;
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
            onChange(newText);

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

    // Ensure the suggestions dropdown doesn't go out of bounds
    const getSuggestionPosition = () => {
        if (!textareaRef.current) return {left: 0, top: 0};

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

        return {left, top};
    };

    // Effect hooks
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

    return (
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
                                        value.substring(0, start) +
                                        op +
                                        value.substring(end);

                                    onChange(newValue);

                                    // Focus and set cursor position
                                    setTimeout(() => {
                                        if (textareaRef.current) {
                                            textareaRef.current.focus();
                                            const newCursorPos = start + op.length;
                                            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                        }
                                    }, 0);
                                } else {
                                    onChange(value + op);
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
                    {Array.from({length: Math.max((value.match(/\n/g) || []).length + 1, 1)}).map((_, i) => (
                        <div key={i} className="text-[10px] text-gray-400 px-1 h-5 leading-5">{i + 1}</div>
                    ))}
                </div>
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={value}
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
        </div>
    );
};

export default FormulaEditor; 