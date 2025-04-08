// Field types definition
export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'phone' | 'number' | 'currency' | 
                'date' | 'datetime' | 'picklist' | 'multipicklist' | 'lookup' | 'user' | 'checkbox';

// Field interface
export interface Field {
  id: string;
  name: string;
  type: FieldType;
  category?: string;
  icon?: string;
}