import { ApiReportField } from "../services/api-types";

// Map database column types to internal field types
export const mapColumnTypeToFieldType = (columnType: string): string => {
  const lowercaseType = columnType.toLowerCase();
  
  if (lowercaseType.includes('varchar') || lowercaseType.includes('text')) {
    return 'text';
  }
  if (lowercaseType.includes('int') || lowercaseType.includes('serial')) {
    return 'number';
  }
  if (lowercaseType.includes('timestamp') || lowercaseType.includes('date')) {
    return 'datetime';
  }
  if (lowercaseType.includes('bool')) {
    return 'checkbox';
  }
  if (lowercaseType.includes('decimal') || lowercaseType.includes('numeric')) {
    return 'currency';
  }
  
  // Default to text for unknown types
  return 'text';
};

// Group fields by table name
export const groupFieldsByTable = (fields: ApiReportField[]): Record<string, ApiReportField[]> => {
  console.log('Inside groupFieldsByTable - fields received:', fields);
  
  return fields.reduce((acc, field) => {
    // Add null check to handle case when tableName is undefined
    if (!field.tableName) {
      const category = 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    }

    const tableName = field.tableName.charAt(0).toUpperCase() + field.tableName.slice(1);
    if (!acc[tableName]) {
      acc[tableName] = [];
    }
    acc[tableName].push(field);
    return acc;
  }, {} as Record<string, ApiReportField[]>);
};

// Get icon for field based on its type
export const getFieldTypeIcon = (columnType: string): string => {
  const mappedType = mapColumnTypeToFieldType(columnType);
  
  switch (mappedType) {
    case 'text':
      return 'Aa';
    case 'number':
      return '#';
    case 'datetime':
      return '🕒';
    case 'checkbox':
      return '✓';
    case 'currency':
      return '$';
    case 'picklist':
      return '📋';
    case 'email':
      return '@';
    case 'phone':
      return '📞';
    default:
      return '•';
  }
}; 