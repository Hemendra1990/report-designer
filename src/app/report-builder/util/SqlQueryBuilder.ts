import { Field } from "../model/Field";
import { Filter } from "../model/Filter";

export interface SqlQueryOptions {
  reportType: string;
  selectedColumns: Field[];
  groupByFields: string[];
  filters: Filter[];
  filterLogic: 'and' | 'or' | 'custom';
  customFilterFormula: string;
}

/**
 * Builds a valid DuckDB SQL query based on the report configuration
 */
export function buildSqlQuery(options: SqlQueryOptions): string {
  const { reportType, selectedColumns, groupByFields, filters, filterLogic, customFilterFormula } = options;
  
  // Generate the SELECT clause
  const selectClause = generateSelectClause(selectedColumns, groupByFields);
  
  // Generate the FROM clause
  const fromClause = `FROM ${reportType}`;
  
  // Generate the WHERE clause if there are filters
  const whereClause = filters.length > 0 
    ? `WHERE ${generateWhereClause(filters, filterLogic, customFilterFormula)}`
    : '';
  
  // Generate the GROUP BY clause if there are group by fields
  const groupByClause = groupByFields.length > 0
    ? `GROUP BY ${groupByFields.join(', ')}`
    : '';
  
  // Combine all clauses into the final SQL query
  // Only include groupByClause if groupByFields is not empty
  const clauses = [
    `SELECT`,
    selectClause,
    fromClause,
    whereClause
  ];
  
  // Only add GROUP BY if we actually have fields to group by
  if (groupByFields.length > 0) {
    clauses.push(groupByClause);
  }
  
  return clauses.filter(Boolean).join('\n');
}

/**
 * Generates the SELECT clause based on selected columns and group by fields
 */
function generateSelectClause(selectedColumns: Field[], groupByFields: string[]): string {
  // If no grouping fields are specified, just return all columns without aggregation
  if (groupByFields.length === 0) {
    return selectedColumns.map(column => `  ${column.id}`).join(',\n');
  }

  // Otherwise, apply appropriate aggregation based on whether the column is in the GROUP BY
  // First, get all columns that are in the GROUP BY clause
  const groupedColumns = selectedColumns.filter(column => groupByFields.includes(column.id));
  
  // Then, get all columns that are NOT in the GROUP BY clause
  const nonGroupedColumns = selectedColumns.filter(column => !groupByFields.includes(column.id));
  
  // Generate the SELECT clause with grouped columns first, then non-grouped columns with aggregation
  const groupedPart = groupedColumns.map(column => `  ${column.id}`);
  
  const nonGroupedPart = nonGroupedColumns.map(column => {
    const columnId = column.id;
    
    // Apply an appropriate aggregate function based on the column type
    let aggregateFunction = 'COUNT';
    
    if (column.type === 'number' || column.type === 'currency') {
      aggregateFunction = 'SUM';
    } else if (column.type === 'datetime' || column.type === 'date') {
      aggregateFunction = 'MAX';
    }
    
    return `  ${aggregateFunction}(${columnId}) AS ${columnId}_${aggregateFunction.toLowerCase()}`;
  });
  
  // Combine the parts and return
  return [...groupedPart, ...nonGroupedPart].join(',\n');
}

/**
 * Generates the WHERE clause based on filters and filter logic
 */
function generateWhereClause(filters: Filter[], logic: 'and' | 'or' | 'custom', customFormula: string): string {
  if (logic === 'custom' && customFormula.trim()) {
    // Replace filter numbers with actual filter conditions
    let formula = customFormula;
    
    for (let i = 1; i <= filters.length; i++) {
      const filterCondition = getSingleFilterCondition(filters[i-1]);
      formula = formula.replace(new RegExp(`\\b${i}\\b`, 'g'), `(${filterCondition})`);
    }
    
    return formula;
  }
  
  // For simple AND/OR logic
  const filterConditions = filters.map(getSingleFilterCondition);
  return filterConditions.join(` ${logic.toUpperCase()} `);
}

/**
 * Converts a single filter to its SQL condition representation
 */
function getSingleFilterCondition(filter: Filter): string {
  const { field, operator, value, rangeStart, rangeEnd, selectedOptions } = filter;
  const fieldId = field.id;
  
  switch (operator) {
    case 'equals':
      return `${fieldId} = '${escapeValue(value || '')}'`;
    case 'not_equals':
      return `${fieldId} <> '${escapeValue(value || '')}'`;
    case 'contains':
      return `${fieldId} LIKE '%${escapeValue(value || '')}%'`;
    case 'not_contains':
      return `${fieldId} NOT LIKE '%${escapeValue(value || '')}%'`;
    case 'starts_with':
      return `${fieldId} LIKE '${escapeValue(value || '')}%'`;
    case 'ends_with':
      return `${fieldId} LIKE '%${escapeValue(value || '')}'`;
    case 'less_than':
      return `${fieldId} < ${getNumericValue(value || '0')}`;
    case 'greater_than':
      return `${fieldId} > ${getNumericValue(value || '0')}`;
    case 'less_or_equal':
      return `${fieldId} <= ${getNumericValue(value || '0')}`;
    case 'greater_or_equal':
      return `${fieldId} >= ${getNumericValue(value || '0')}`;
    case 'between':
      return `${fieldId} BETWEEN ${getNumericValue(rangeStart || '0')} AND ${getNumericValue(rangeEnd || '0')}`;
    case 'is_empty':
      return `${fieldId} IS NULL`;
    case 'is_not_empty':
      return `${fieldId} IS NOT NULL`;
    case 'in_list':
      if (selectedOptions && selectedOptions.length > 0) {
        const optionsList = selectedOptions.map(opt => `'${escapeValue(opt)}'`).join(', ');
        return `${fieldId} IN (${optionsList})`;
      }
      return `FALSE`; // No options selected
    case 'not_in_list':
      if (selectedOptions && selectedOptions.length > 0) {
        const optionsList = selectedOptions.map(opt => `'${escapeValue(opt)}'`).join(', ');
        return `${fieldId} NOT IN (${optionsList})`;
      }
      return `TRUE`; // No options selected means match everything
    default:
      return `${fieldId} = '${escapeValue(value || '')}'`;
  }
}

/**
 * Escapes a string value for SQL
 */
function escapeValue(value: string): string {
  // Replace single quotes with double single quotes for SQL
  return value.replace(/'/g, "''");
}

/**
 * Returns a properly formatted numeric value for SQL
 */
function getNumericValue(value: string): number | string {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num;
} 