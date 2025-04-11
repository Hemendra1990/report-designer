import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define Field type
interface Field {
  id: string;
  name: string;
  type: string;
  label?: string;
}

interface FieldEditorProps {
  fields: Field[];
  onSelectField: (field: Field) => void;
  placeholder?: string;
  className?: string;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ 
  fields, 
  onSelectField, 
  placeholder = "Type to search fields...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter fields based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFields([]);
      return;
    }

    const filtered = fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (field.label && field.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFields(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, fields]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFieldSelect = (field: Field) => {
    onSelectField(field);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && filteredFields.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredFields.map((field) => (
            <Button
              key={field.id}
              variant="ghost"
              className="w-full justify-start text-sm px-3 py-2 h-auto text-left hover:bg-gray-100"
              onClick={() => handleFieldSelect(field)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{field.name}</span>
                {field.label && <span className="text-xs text-gray-500">{field.label}</span>}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldEditor; 