import { Field } from "../model/Field";
import { Filter } from "../model/Filter";
import { translateFormulaToDuckDBSQL } from "./FormulaTranslator";
import { accountFields } from "../model/fake-data";

export interface SqlQueryOptions {
  reportType: string;
  selectedColumns: Field[];
  groupByFields: string[];
  filters: Filter[];
  filterLogic: 'and' | 'or' | 'custom';
  customFilterFormula: string;
  isPivotActive?: boolean;
  pivotColumnIds?: string[];
  pivotValues?: string[];
  selectedAggregations?: Record<string, string>;
}

/**
 * Builds a valid DuckDB SQL query based on the report configuration
 */
export function buildSqlQuery(options: SqlQueryOptions): string {
  const { 
    reportType, 
    selectedColumns, 
    groupByFields, 
    filters, 
    filterLogic, 
    customFilterFormula,
    isPivotActive,
    pivotColumnIds,
    pivotValues,
    selectedAggregations
  } = options;
  
  // Check if we're building a pivot query
  if (isPivotActive && pivotColumnIds && pivotColumnIds.length > 0 && pivotValues && pivotValues.length > 0) {
    // For pivot queries, we need to build the base query first, then add the pivot clause
    
    // Filter out summary formula fields from the selected columns
    const filteredColumns = selectedColumns.filter(column => 
      !('isSummaryFormula' in column && column.isSummaryFormula === true)
    );
    
    // Build the base query to use in the WITH clause
    let sql = 'WITH base_data AS (\n';
    
    // Calculate all fields needed - from group by, pivot, and value columns
    const allNeededColumns = Array.from(new Set([
      ...groupByFields,
      ...(pivotColumnIds || []),
      ...(pivotValues || [])
    ]));
    
    // SELECT clause for base data
    console.log('allNeededColumns', allNeededColumns);
    sql += '  SELECT\n';
    allNeededColumns.forEach((id, index) => {
      const column = selectedColumns.find(col => col.id === id);
      sql += `    ${id}${index < allNeededColumns.length - 1 ? ',' : ''}\n`;
    });
    
    // FROM clause
    sql += `  FROM ${reportType}\n`;
    
    // WHERE clause if needed
    if (filters.length > 0) {
      sql += `  WHERE ${generateWhereClause(filters, filterLogic, customFilterFormula)}\n`;
    }
    
    // Close the base CTE
    sql += ')\n\n';
    
    // Add the pivot clause
    sql += generatePivotClause({
      selectedColumns,
      pivotColumnIds,
      pivotValues,
      selectedAggregations,
      groupByFields
    });
    
    return sql;
  }
  
  // Handle non-pivot queries (regular SQL)
  // Filter out summary formula fields from the selected columns
  const filteredColumns = selectedColumns.filter(column => 
    !('isSummaryFormula' in column && column.isSummaryFormula === true)
  );
  
  // Generate the SELECT clause
  const selectClause = generateSelectClause(filteredColumns, groupByFields);
  
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
  // Skip summary formula fields - these should already be filtered out, but this is a safeguard
  const columnsToInclude = selectedColumns.filter(column => 
    !('isSummaryFormula' in column && column.isSummaryFormula === true)
  );
  
  // Early return if no columns are left after filtering
  if (columnsToInclude.length === 0) {
    return '  1 as dummy_column'; // Fallback to ensure valid SQL
  }
  
  // Create a field map for formula translation that includes ALL available fields
  // This ensures formulas can reference fields not in the current selection
  const fieldMap: Record<string, string> = {};
  
  // First add all available fields from the system
  accountFields.forEach(field => {
    fieldMap[field.id] = field.id;
  });
  
  // Then add any custom fields from the selected columns that might not be in accountFields
  columnsToInclude.forEach(column => {
    if (!fieldMap[column.id]) {
      fieldMap[column.id] = column.id;
    }
  });

  // If no grouping fields are specified, just return all columns without aggregation
  if (groupByFields.length === 0) {
    return columnsToInclude.map(column => {
      // Check if this is a formula column
      if ('isFormula' in column && column.isFormula) {
        // For formula columns, use the translated SQL expression instead of raw formula
        const formulaCol = column as any; // Type assertion to access formula properties
        try {
          // Translate the formula to SQL
          return `  ${translateFormulaToDuckDBSQL(formulaCol.formula, fieldMap, formulaCol.alias)}`;
        } catch (error) {
          console.error(`Error translating formula "${formulaCol.formula}":`, error);
          // Fallback: return the formula as-is with the alias
          return `  '${formulaCol.formula}' AS ${formulaCol.alias}`;
        }
      }
      // Regular column, just use the ID
      return `  ${column.id}`;
    }).join(',\n');
  }

  // Otherwise, apply appropriate aggregation based on whether the column is in the GROUP BY
  // First, get all columns that are in the GROUP BY clause
  const groupedColumns = columnsToInclude.filter(column => groupByFields.includes(column.id));
  
  // Then, get all columns that are NOT in the GROUP BY clause
  const nonGroupedColumns = columnsToInclude.filter(column => !groupByFields.includes(column.id));
  
  // Generate the SELECT clause with grouped columns first, then non-grouped columns with aggregation
  const groupedPart = groupedColumns.map(column => {
    // Check if this is a formula column
    if ('isFormula' in column && column.isFormula) {
      const formulaCol = column as any; // Type assertion to access formula properties
      try {
        // Translate the formula to SQL
        return `  ${translateFormulaToDuckDBSQL(formulaCol.formula, fieldMap, formulaCol.alias)}`;
      } catch (error) {
        console.error(`Error translating formula "${formulaCol.formula}":`, error);
        // Fallback: return the formula as-is with the alias
        return `  '${formulaCol.formula}' AS ${formulaCol.alias}`;
      }
    }
    return `  ${column.id}`;
  });
  
  const nonGroupedPart = nonGroupedColumns.map(column => {
    // Check if this is a formula column
    if ('isFormula' in column && column.isFormula) {
      const formulaCol = column as any; // Type assertion to access formula properties
      
      // For formula columns, we'll still apply aggregation but use the translated SQL expression
      let aggregateFunction = 'COUNT';
      
      if (formulaCol.type === 'number' || formulaCol.type === 'currency') {
        aggregateFunction = 'SUM';
      } else if (formulaCol.type === 'datetime' || formulaCol.type === 'date') {
        aggregateFunction = 'MAX';
      }

      try {
        // Translate the formula without an alias, as we'll add the aggregation suffix
        const translatedFormula = translateFormulaToDuckDBSQL(formulaCol.formula, fieldMap);
        return `  ${aggregateFunction}(${translatedFormula}) AS ${formulaCol.alias}_${aggregateFunction.toLowerCase()}`;
      } catch (error) {
        console.error(`Error translating formula "${formulaCol.formula}":`, error);
        // Fallback: use a placeholder
        return `  NULL AS ${formulaCol.alias}_${aggregateFunction.toLowerCase()}`;
      }
    }
    
    // Regular column with aggregation
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
 * Formats a date string for SQL
 * Handles different date formats and special date values
 */
function formatDateForSql(dateStr: string): string {
  if (!dateStr) {
    // If no date provided, return today
    return new Date().toISOString().slice(0, 10);
  }

  // Convert to lowercase for case-insensitive comparison
  const dateValue = dateStr.toLowerCase();

  // Check if it's a relative date keyword
  // If so, handle these specially by returning a SQL expression rather than a literal date
  switch (dateValue) {
    case 'today':
      return 'CURRENT_DATE';
    case 'yesterday':
      return 'CURRENT_DATE - INTERVAL \'1 day\'';
    case 'tomorrow':
      return 'CURRENT_DATE + INTERVAL \'1 day\'';
    case 'this_week':
    case 'this week':
      return 'DATE_TRUNC(\'week\', CURRENT_DATE)';
    case 'last_week':
    case 'last week':
      return 'DATE_TRUNC(\'week\', CURRENT_DATE - INTERVAL \'7 days\')';
    case 'next_week':
    case 'next week':
      return 'DATE_TRUNC(\'week\', CURRENT_DATE + INTERVAL \'7 days\')';
    case 'this_month':
    case 'this month':
      return 'DATE_TRUNC(\'month\', CURRENT_DATE)';
    case 'last_month':
    case 'last month':
      return 'DATE_TRUNC(\'month\', CURRENT_DATE - INTERVAL \'1 month\')';
    case 'next_month':
    case 'next month':
      return 'DATE_TRUNC(\'month\', CURRENT_DATE + INTERVAL \'1 month\')';
    case 'this_year':
    case 'this year':
      return 'DATE_TRUNC(\'year\', CURRENT_DATE)';
    case 'last_year':
    case 'last year':
      return 'DATE_TRUNC(\'year\', CURRENT_DATE - INTERVAL \'1 year\')';
    case 'next_year':
    case 'next year':
      return 'DATE_TRUNC(\'year\', CURRENT_DATE + INTERVAL \'1 year\')';
    case 'current_quarter':
    case 'this_quarter':
    case 'this quarter':
      return 'DATE_TRUNC(\'quarter\', CURRENT_DATE)';
    case 'last_quarter':
    case 'last quarter':
      return 'DATE_TRUNC(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')';
    case 'next_quarter':
    case 'next quarter':
      return 'DATE_TRUNC(\'quarter\', CURRENT_DATE + INTERVAL \'3 months\')';
    case 'last_90_days':
    case 'last 90 days':
      return 'CURRENT_DATE - INTERVAL \'90 days\'';
    default:
      // Try to parse as a date if it's not a special keyword
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // For dates only, use YYYY-MM-DD
          if (dateStr.includes('T') || dateStr.includes(':')) {
            // Full ISO format for datetime
            return date.toISOString().replace('T', ' ').slice(0, 19);
          } else {
            // Date only format
            return date.toISOString().slice(0, 10);
          }
        }
        // If parsing failed, return as is (this could be a custom date pattern or expression)
        return dateStr;
      } catch (e) {
        // If date parsing fails, return as is
        return dateStr;
      }
  }
}

/**
 * Helper function to check if a value is a special date keyword
 */
function hasSpecialDateKeyword(value: string): boolean {
  if (!value) return false;
  
  const valueLC = value.toLowerCase();
  const specialDateKeywords = [
    'today', 'yesterday', 'tomorrow',
    'this week', 'last week', 'next week',
    'this month', 'last month', 'next month',
    'this year', 'last year', 'next year',
    'this_week', 'last_week', 'next_week',
    'this_month', 'last_month', 'next_month',
    'this_year', 'last_year', 'next_year',
    'current_quarter', 'last_quarter', 'next_quarter',
    'this quarter', 'last quarter', 'next quarter',
    'this_quarter', 'last_quarter', 'next_quarter',
    'current_fiscal_year', 'last_fiscal_year',
    'last_90_days', 'last 90 days'
  ];
  
  return specialDateKeywords.includes(valueLC);
}

/**
 * Converts a single filter to its SQL condition representation
 */
function getSingleFilterCondition(filter: Filter): string {
  const { field, operator, value, rangeStart, rangeEnd, selectedOptions } = filter;
  const fieldId = field.id;
  
  // Special handling for date and datetime fields
  if (field.type === 'date' || field.type === 'datetime') {
    // Check for special date value keywords
    // These need to be special expressions, not literal strings
    const isSpecialDate = hasSpecialDateKeyword(value);
    
    switch (operator) {
      case 'equals':
        return isSpecialDate 
          ? `DATE_TRUNC('day', ${fieldId}) = DATE_TRUNC('day', ${formatDateForSql(value)})`
          : `DATE_TRUNC('day', ${fieldId}) = DATE_TRUNC('day', DATE '${formatDateForSql(value)}')`;
      case 'not_equals':
        return isSpecialDate
          ? `DATE_TRUNC('day', ${fieldId}) <> DATE_TRUNC('day', ${formatDateForSql(value)})`
          : `DATE_TRUNC('day', ${fieldId}) <> DATE_TRUNC('day', DATE '${formatDateForSql(value)}')`;
      case 'less_than':
      case 'before':
        return isSpecialDate
          ? `${fieldId} < ${formatDateForSql(value)}`
          : `${fieldId} < DATE '${formatDateForSql(value)}'`;
      case 'greater_than':
      case 'after':
        return isSpecialDate
          ? `${fieldId} > ${formatDateForSql(value)}`
          : `${fieldId} > DATE '${formatDateForSql(value)}'`;
      case 'less_or_equal':
        return isSpecialDate
          ? `${fieldId} <= ${formatDateForSql(value)}`
          : `${fieldId} <= DATE '${formatDateForSql(value)}'`;
      case 'greater_or_equal':
        return isSpecialDate
          ? `${fieldId} >= ${formatDateForSql(value)}`
          : `${fieldId} >= DATE '${formatDateForSql(value)}'`;
      case 'between':
        // Special case for custom date range with two specific dates
        if (rangeStart && rangeEnd) {
          const startSpecial = hasSpecialDateKeyword(rangeStart);
          const endSpecial = hasSpecialDateKeyword(rangeEnd);
          
          const startExpr = startSpecial
            ? formatDateForSql(rangeStart)
            : `DATE '${formatDateForSql(rangeStart)}'`;
          const endExpr = endSpecial
            ? formatDateForSql(rangeEnd)
            : `DATE '${formatDateForSql(rangeEnd)}'`;
          
          return `${fieldId} BETWEEN ${startExpr} AND ${endExpr}`;
        }
        
        // Handle special date range keywords like "This Month" or "Last Year"
        if (value && hasSpecialDateKeyword(value)) {
          const valueLower = value.toLowerCase();
          
          // Common date ranges
          if (valueLower === 'this month' || valueLower === 'this_month') {
            return `${fieldId} >= DATE_TRUNC('month', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
          } else if (valueLower === 'last month' || valueLower === 'last_month') {
            return `${fieldId} >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND ${fieldId} < DATE_TRUNC('month', CURRENT_DATE)`;
          } else if (valueLower === 'next month' || valueLower === 'next_month') {
            return `${fieldId} >= DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') AND ${fieldId} < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 month')`;
          } else if (valueLower === 'this year' || valueLower === 'this_year') {
            return `${fieldId} >= DATE_TRUNC('year', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'`;
          } else if (valueLower === 'last year' || valueLower === 'last_year') {
            return `${fieldId} >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year') AND ${fieldId} < DATE_TRUNC('year', CURRENT_DATE)`;
          } else if (valueLower === 'next year' || valueLower === 'next_year') {
            return `${fieldId} >= DATE_TRUNC('year', CURRENT_DATE + INTERVAL '1 year') AND ${fieldId} < DATE_TRUNC('year', CURRENT_DATE + INTERVAL '2 year')`;
          } else if (valueLower === 'this quarter' || valueLower === 'this_quarter' || valueLower === 'current_quarter') {
            return `${fieldId} >= DATE_TRUNC('quarter', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months'`;
          } else if (valueLower === 'last quarter' || valueLower === 'last_quarter') {
            return `${fieldId} >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months') AND ${fieldId} < DATE_TRUNC('quarter', CURRENT_DATE)`;
          } else if (valueLower === 'this week' || valueLower === 'this_week') {
            return `${fieldId} >= DATE_TRUNC('week', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`;
          } else if (valueLower === 'last week' || valueLower === 'last_week') {
            return `${fieldId} >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AND ${fieldId} < DATE_TRUNC('week', CURRENT_DATE)`;
          } else if (valueLower === 'yesterday') {
            return `${fieldId} >= CURRENT_DATE - INTERVAL '1 day' AND ${fieldId} < CURRENT_DATE`;
          } else if (valueLower === 'today') {
            return `${fieldId} >= CURRENT_DATE AND ${fieldId} < CURRENT_DATE + INTERVAL '1 day'`;
          } else if (valueLower === 'tomorrow') {
            return `${fieldId} >= CURRENT_DATE + INTERVAL '1 day' AND ${fieldId} < CURRENT_DATE + INTERVAL '2 days'`;
          } else if (valueLower === 'last 7 days' || valueLower === 'last_7_days') {
            return `${fieldId} >= CURRENT_DATE - INTERVAL '7 days' AND ${fieldId} <= CURRENT_DATE`;
          } else if (valueLower === 'last 30 days' || valueLower === 'last_30_days') {
            return `${fieldId} >= CURRENT_DATE - INTERVAL '30 days' AND ${fieldId} <= CURRENT_DATE`;
          } else if (valueLower === 'last 90 days' || valueLower === 'last_90_days') {
            return `${fieldId} >= CURRENT_DATE - INTERVAL '90 days' AND ${fieldId} <= CURRENT_DATE`;
          } else if (valueLower === 'next 7 days' || valueLower === 'next_7_days') {
            return `${fieldId} >= CURRENT_DATE AND ${fieldId} <= CURRENT_DATE + INTERVAL '7 days'`;
          } else if (valueLower === 'next 30 days' || valueLower === 'next_30_days') {
            return `${fieldId} >= CURRENT_DATE AND ${fieldId} <= CURRENT_DATE + INTERVAL '30 days'`;
          } else if (valueLower === 'next 90 days' || valueLower === 'next_90_days') {
            return `${fieldId} >= CURRENT_DATE AND ${fieldId} <= CURRENT_DATE + INTERVAL '90 days'`;
          }
        }
        
        const startSpecial = hasSpecialDateKeyword(rangeStart || '');
        const endSpecial = hasSpecialDateKeyword(rangeEnd || '');
        
        const startExpr = startSpecial
          ? formatDateForSql(rangeStart || '')
          : `DATE '${formatDateForSql(rangeStart || '')}'`;
        const endExpr = endSpecial
          ? formatDateForSql(rangeEnd || '')
          : `DATE '${formatDateForSql(rangeEnd || '')}'`;
        
        return `${fieldId} BETWEEN ${startExpr} AND ${endExpr}`;
      case 'is_empty':
        return `${fieldId} IS NULL`;
      case 'is_not_empty':
        return `${fieldId} IS NOT NULL`;
      // Handle special date operators
      case 'last_n_days':
        const days = parseInt(value) || 30; // Default to 30 days if not specified
        return `${fieldId} >= CURRENT_DATE - INTERVAL '${days} days' AND ${fieldId} <= CURRENT_DATE`;
      case 'next_n_days':
        const nextDays = parseInt(value) || 30; // Default to 30 days if not specified
        return `${fieldId} >= CURRENT_DATE AND ${fieldId} <= CURRENT_DATE + INTERVAL '${nextDays} days'`;
      case 'this_year':
        return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE)`;
      case 'last_year':
        return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) - 1`;
      case 'this_month':
        return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM ${fieldId}) = EXTRACT(MONTH FROM CURRENT_DATE)`;
      case 'last_month':
        // This handles the last month, even across year boundaries
        return `(
          (EXTRACT(MONTH FROM ${fieldId}) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month') AND 
           EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month'))
        )`;
      case 'this_week':
        return `${fieldId} >= DATE_TRUNC('week', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`;
      case 'last_week':
        return `${fieldId} >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AND ${fieldId} < DATE_TRUNC('week', CURRENT_DATE)`;
      case 'next_week':
        return `${fieldId} >= DATE_TRUNC('week', CURRENT_DATE + INTERVAL '1 week') AND ${fieldId} < DATE_TRUNC('week', CURRENT_DATE + INTERVAL '2 week')`;
      case 'current_quarter':
      case 'this_quarter':
        return `${fieldId} >= DATE_TRUNC('quarter', CURRENT_DATE) AND ${fieldId} < DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months'`;
      case 'last_quarter':
        return `${fieldId} >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months') AND ${fieldId} < DATE_TRUNC('quarter', CURRENT_DATE)`;
      case 'next_quarter':
        return `${fieldId} >= DATE_TRUNC('quarter', CURRENT_DATE + INTERVAL '3 months') AND ${fieldId} < DATE_TRUNC('quarter', CURRENT_DATE + INTERVAL '6 months')`;
      case 'current_fiscal_year':
        // Assuming a fiscal year starts on October 1st
        return `(
          (${fieldId} >= DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months' AND 
           EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE)) OR
          (${fieldId} < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months' AND 
           EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) + 1)
        )`;
      case 'last_fiscal_year':
        // Assuming a fiscal year starts on October 1st
        return `(
          (${fieldId} >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year') + INTERVAL '9 months' AND 
           EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) - 1) OR
          (${fieldId} < DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year') + INTERVAL '9 months' AND 
           EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE))
        )`;
      case 'current_fiscal_quarter':
        // Assuming fiscal quarters start on: Oct 1, Jan 1, Apr 1, Jul 1
        return `
          CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 10 AND 12 THEN
              ${fieldId} >= make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 1) AND
              ${fieldId} < make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 1) + INTERVAL '3 months'
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 3 THEN
              ${fieldId} >= make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 1) AND
              ${fieldId} < make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 1) + INTERVAL '3 months'
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 4 AND 6 THEN
              ${fieldId} >= make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 1) AND
              ${fieldId} < make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 1) + INTERVAL '3 months'
            ELSE
              ${fieldId} >= make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 1) AND
              ${fieldId} < make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 1) + INTERVAL '3 months'
          END
        `;
      case 'last_90_days':
        return `${fieldId} >= CURRENT_DATE - INTERVAL '90 days' AND ${fieldId} <= CURRENT_DATE`;
      case 'custom_date_range':
        // Handle custom date range with explicit start and end dates
        if (rangeStart && rangeEnd) {
          const startDate = formatDateForSql(rangeStart);
          const endDate = formatDateForSql(rangeEnd);
          return `${fieldId} >= DATE '${startDate}' AND ${fieldId} <= DATE '${endDate}'`;
        }
        return `FALSE`; // No valid range specified
      default:
        // Handle special date values with standard operators
        if (isSpecialDate) {
          // Special handling for equivalence-type operators using special date values
          if (value.toLowerCase().includes('year')) {
            if (value.toLowerCase().includes('last')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) - 1`;
            } else if (value.toLowerCase().includes('this')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE)`;
            } else if (value.toLowerCase().includes('next')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) + 1`;
            }
          } else if (value.toLowerCase().includes('quarter')) {
            // For quarter comparisons, use the date expressions directly
            return `${fieldId} ${getOperatorSymbol(operator)} ${formatDateForSql(value)}`;
          } else if (value.toLowerCase().includes('month')) {
            if (value.toLowerCase().includes('last')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month') AND
                     EXTRACT(MONTH FROM ${fieldId}) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')`;
            } else if (value.toLowerCase().includes('this')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE) AND
                     EXTRACT(MONTH FROM ${fieldId}) = EXTRACT(MONTH FROM CURRENT_DATE)`;
            } else if (value.toLowerCase().includes('next')) {
              return `EXTRACT(YEAR FROM ${fieldId}) = EXTRACT(YEAR FROM CURRENT_DATE + INTERVAL '1 month') AND
                     EXTRACT(MONTH FROM ${fieldId}) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 month')`;
            }
          }
          
          // Use direct expression for other special date values
          return `${fieldId} ${getOperatorSymbol(operator)} ${formatDateForSql(value)}`;
        }
        
        // Default to equals with quoted date for regular date strings
        return `${fieldId} = DATE '${formatDateForSql(value)}'`;
    }
  }
  
  // For non-date fields, use the original logic
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
 * Helper function to get the right SQL operator symbol
 */
function getOperatorSymbol(operator: string): string {
  switch (operator) {
    case 'equals': return '=';
    case 'not_equals': return '<>';
    case 'less_than':
    case 'before': return '<';
    case 'greater_than':
    case 'after': return '>';
    case 'less_or_equal': return '<=';
    case 'greater_or_equal': return '>=';
    default: return '=';
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

/**
 * Helper function to generate a pivot SQL clause
 */
function generatePivotClause(
  options: Pick<SqlQueryOptions, 'selectedColumns' | 'pivotColumnIds' | 'pivotValues' | 'selectedAggregations' | 'groupByFields'>
): string {
  const { selectedColumns, pivotColumnIds = [], pivotValues = [], selectedAggregations = {}, groupByFields = [] } = options;
  
  if (pivotColumnIds.length === 0 || pivotValues.length === 0) {
    return '';
  }
  
  // Build the PIVOT clause
  let pivotSql = 'PIVOT base_data\n';
  
  // ON clause (what to pivot)
  if (pivotColumnIds.length === 1) {
    pivotSql += `ON ${pivotColumnIds[0]}\n`;
  } else {
    // For multiple pivot columns, use concatenation
    pivotSql += `ON ${pivotColumnIds.join(' || \'_\' || ')}\n`;
  }
  
  // USING clause (aggregations)
  pivotSql += 'USING ';
  pivotValues.forEach((id, index) => {
    const aggregation = selectedAggregations[id] || 'SUM';
    pivotSql += `${aggregation}(${id})`;
    
    if (index < pivotValues.length - 1) {
      pivotSql += ', ';
    }
  });
  pivotSql += '\n';
  
  // GROUP BY clause if needed - IMPORTANT: exclude fields used in the pivot ON clause
  const validGroupByFields = groupByFields.filter(field => !pivotColumnIds.includes(field));
  
  if (validGroupByFields.length > 0) {
    pivotSql += 'GROUP BY ';
    validGroupByFields.forEach((id, index) => {
      pivotSql += id;
      if (index < validGroupByFields.length - 1) {
        pivotSql += ', ';
      }
    });
  }
  
  return pivotSql;
} 