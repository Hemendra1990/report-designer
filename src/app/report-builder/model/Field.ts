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