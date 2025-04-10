// Field types definition
export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'phone' | 'number' | 'boolean' | 'date' | 'datetime' | 'picklist' | 'multipicklist' | 'lookup' | 'masterdetail' | 'user' | 'checkbox' | 'fileupload' | 'currency' | 'percent';

// Field interface
export interface Field {
  id: string;
  name: string;
  type: FieldType;
  category?: string;
  icon?: string;
  isFormula?: boolean;
  formula?: string;
  isSummaryFormula?: boolean;
  alias?: string;
  description?: string;
  tableName?: string;
  tableId?: string;
  columnName?: string;
  columnDisplayName?: string;
  columnType?: string;
  duckDBColumnName?: string;
  duckDBColumnDisplayName?: string;
  active?: boolean;
}

// Formula column interface that extends Field
export interface FormulaColumn extends Field {
  isFormula: true;
  formula: string;
  isSummaryFormula?: boolean;
  alias: string;
  description: string;
}

/**
 * Checks if a value is a valid FieldType
 */
function isValidFieldType(type: any): type is FieldType {
  return typeof type === 'string' && [
    'text', 'textarea', 'url', 'email', 'phone', 'number', 'boolean', 'date', 
    'datetime', 'picklist', 'multipicklist', 'lookup', 'masterdetail', 'user', 
    'checkbox', 'fileupload', 'currency', 'percent'
  ].includes(type);
}

/**
 * Converts any object to a Field type, with proper validation
 */
export function toField(field: any): Field {
  // Convert an object to a Field type
  const result: Field = {
    id: field.id || "",
    name: field.name || "",
    // Ensure type is a valid FieldType, defaulting to 'text' if not
    type: isValidFieldType(field.type) ? field.type : 'text',
    category: field.category || "",
  };
  
  // Add additional fields if they exist in the source object
  if (field.icon) result.icon = field.icon;
  if (field.isFormula) result.isFormula = field.isFormula;
  if (field.formula) result.formula = field.formula;
  if (field.isSummaryFormula) result.isSummaryFormula = field.isSummaryFormula;
  if (field.alias) result.alias = field.alias;
  if (field.description) result.description = field.description;
  if (field.tableName) result.tableName = field.tableName;
  if (field.tableId) result.tableId = field.tableId;
  if (field.columnName) result.columnName = field.columnName;
  if (field.columnDisplayName) result.columnDisplayName = field.columnDisplayName;
  if (field.columnType) result.columnType = field.columnType;
  if (field.duckDBColumnName) result.duckDBColumnName = field.duckDBColumnName;
  if (field.duckDBColumnDisplayName) result.duckDBColumnDisplayName = field.duckDBColumnDisplayName;
  if (field.active !== undefined) result.active = field.active;
  
  return result;
}