// Field types definition
export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'phone' | 'number' | 'currency' | 
                'date' | 'datetime' | 'picklist' | 'multipicklist' | 'lookup' | 'user' | 'checkbox' |
                'percent';

// Field interface
export interface Field {
  id: string;
  name: string;
  type: FieldType;
  category?: string;
  icon?: string;
  isFormula?: boolean;
  formula?: string;
  description?: string;
  alias?: string;
  isSummaryFormula?: boolean;
}

// Formula column interface that extends Field
export interface FormulaColumn extends Field {
  formula: string;
  description: string;
  alias: string;
  isFormula: boolean;
  isSummaryFormula?: boolean;
}

/**
 * A utility function to convert any field-like object to a Field type
 * This helps with compatibility between different parts of the application
 */
export function toField(field: any): Field {
  // If it's already a Field, return it
  if (field && typeof field === 'object') {
    // Create a new object with Field properties
    const result: Field = {
      id: field.id || '',
      name: field.name || '',
      // Ensure type is a valid FieldType, defaulting to 'text' if not
      type: isValidFieldType(field.type) ? field.type : 'text',
    };
    
    // Add optional properties if they exist
    if (field.category) result.category = field.category;
    if (field.icon) result.icon = field.icon;
    if (field.isFormula) {
      result.isFormula = field.isFormula;
      // For formula fields, ensure required properties are present
      if (field.formula) result.formula = field.formula;
      if (field.description) result.description = field.description;
      if (field.alias) result.alias = field.alias;
      if (field.isSummaryFormula) result.isSummaryFormula = field.isSummaryFormula;
    }
    
    return result;
  }
  
  // Return a default Field if input is invalid
  return {
    id: '',
    name: '',
    type: 'text'
  };
}

/**
 * Helper function to check if a string is a valid FieldType
 */
function isValidFieldType(type: string): type is FieldType {
  const validTypes: FieldType[] = [
    'text', 'textarea', 'url', 'email', 'phone', 'number', 'currency',
    'date', 'datetime', 'picklist', 'multipicklist', 'lookup', 'user', 'checkbox',
    'percent'
  ];
  return validTypes.includes(type as FieldType);
}