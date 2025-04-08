/**
 * FormulaTranslator.ts
 * 
 * Translates Salesforce row-level formulas into DuckDB SQL expressions.
 */

/**
 * Translate a Salesforce row-level formula to a DuckDB SQL expression
 * @param formula The formula to translate
 * @param fieldMap A map from Salesforce field names to SQL column names
 * @returns The translated SQL expression
 */
export function translateFormulaToDuckDBSQL(
  formula: string,
  fieldMap: Record<string, string>
): string {
  if (!formula.trim()) {
    throw new FormulaError('Formula cannot be empty');
  }

  const context: ParserContext = {
    formula,
    index: 0,
    fieldMap
  };

  const result = parseExpression(context);

  // Check if we consumed the entire formula
  skipWhitespace(context);
  if (context.index < context.formula.length) {
    throw new FormulaError(
      `Unexpected token: ${context.formula.substring(context.index)}`
    );
  }

  return result;
}

/**
 * Custom error class for formula parsing errors
 */
class FormulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaError';
  }
}

/**
 * The parser context for maintaining state during parsing
 */
interface ParserContext {
  formula: string;
  index: number;
  fieldMap: Record<string, string>;
}

/**
 * Skip whitespace in the formula
 */
function skipWhitespace(context: ParserContext): void {
  while (
    context.index < context.formula.length &&
    /\s/.test(context.formula[context.index])
  ) {
    context.index++;
  }
}

/**
 * Parse an expression (top-level entry point)
 */
function parseExpression(context: ParserContext): string {
  return parseLogicalExpression(context);
}

/**
 * Parse a logical expression (AND, OR)
 */
function parseLogicalExpression(context: ParserContext): string {
  let left = parseComparisonExpression(context);
  
  skipWhitespace(context);
  
  while (
    context.index < context.formula.length &&
    (context.formula.substring(context.index, context.index + 3).toUpperCase() === 'AND' ||
     context.formula.substring(context.index, context.index + 2).toUpperCase() === 'OR')
  ) {
    const operator = context.formula.substring(context.index, context.index + 3).toUpperCase() === 'AND'
      ? 'AND'
      : 'OR';
    
    context.index += operator.length;
    skipWhitespace(context);
    
    const right = parseComparisonExpression(context);
    left = `${left} ${operator} ${right}`;
    
    skipWhitespace(context);
  }
  
  return left;
}

/**
 * Parse a comparison expression (=, <, >, <=, >=, !=, ==)
 */
function parseComparisonExpression(context: ParserContext): string {
  let left = parseAdditiveExpression(context);
  
  skipWhitespace(context);
  
  if (context.index < context.formula.length) {
    // Check for double-character operators first (==, !=, <=, >=)
    const twoChars = context.formula.substring(context.index, context.index + 2);
    if (twoChars === '==' || twoChars === '!=' || twoChars === '<=' || twoChars === '>=') {
      // Map Salesforce operators to SQL operators
      let operator: string;
      switch (twoChars) {
        case '==': operator = '='; break;
        case '!=': operator = '<>'; break;
        case '<=': operator = '<='; break;
        case '>=': operator = '>='; break;
        default: throw new FormulaError(`Unknown operator: ${twoChars}`);
      }
      
      context.index += 2;
      skipWhitespace(context);
      
      const right = parseAdditiveExpression(context);
      return `${left} ${operator} ${right}`;
    }
    // Then check for single-character operators (=, <, >)
    else if (context.formula[context.index] === '=' || 
             context.formula[context.index] === '<' ||
             context.formula[context.index] === '>') {
      const operator = context.formula[context.index];
      context.index++;
      skipWhitespace(context);
      
      const right = parseAdditiveExpression(context);
      return `${left} ${operator} ${right}`;
    }
  }
  
  return left;
}

/**
 * Parse an additive expression (+, -)
 */
function parseAdditiveExpression(context: ParserContext): string {
  let left = parseMultiplicativeExpression(context);
  
  skipWhitespace(context);
  
  while (
    context.index < context.formula.length &&
    (context.formula[context.index] === '+' || context.formula[context.index] === '-')
  ) {
    const operator = context.formula[context.index];
    context.index++;
    skipWhitespace(context);
    
    const right = parseMultiplicativeExpression(context);
    left = `${left} ${operator} ${right}`;
    
    skipWhitespace(context);
  }
  
  return left;
}

/**
 * Parse a multiplicative expression (*, /, %)
 */
function parseMultiplicativeExpression(context: ParserContext): string {
  let left = parseUnaryExpression(context);
  
  skipWhitespace(context);
  
  while (
    context.index < context.formula.length &&
    (context.formula[context.index] === '*' || 
     context.formula[context.index] === '/' || 
     context.formula[context.index] === '%')
  ) {
    const operator = context.formula[context.index];
    context.index++;
    skipWhitespace(context);
    
    const right = parseUnaryExpression(context);
    
    // Handle division by zero
    if (operator === '/') {
      left = `CASE WHEN ${right} = 0 OR ${right} IS NULL THEN NULL ELSE ${left} ${operator} ${right} END`;
    } else {
      left = `${left} ${operator} ${right}`;
    }
    
    skipWhitespace(context);
  }
  
  return left;
}

/**
 * Parse a unary expression (+, -)
 */
function parseUnaryExpression(context: ParserContext): string {
  skipWhitespace(context);
  
  if (
    context.index < context.formula.length &&
    (context.formula[context.index] === '+' || context.formula[context.index] === '-')
  ) {
    const operator = context.formula[context.index];
    context.index++;
    skipWhitespace(context);
    
    const operand = parseUnaryExpression(context);
    return `${operator}${operand}`;
  }
  
  return parsePrimaryExpression(context);
}

/**
 * Parse a primary expression (literal, field reference, parenthesized expression)
 */
function parsePrimaryExpression(context: ParserContext): string {
  skipWhitespace(context);
  
  // Handle parenthesized expressions
  if (context.index < context.formula.length && context.formula[context.index] === '(') {
    context.index++; // Skip the opening (
    skipWhitespace(context);
    
    const result = parseExpression(context);
    
    skipWhitespace(context);
    
    if (context.index >= context.formula.length || context.formula[context.index] !== ')') {
      throw new FormulaError('Unterminated parenthesized expression');
    }
    
    context.index++; // Skip the closing )
    return result;
  }
  
  // Handle string literals
  if (context.index < context.formula.length && (context.formula[context.index] === "'" || context.formula[context.index] === '"')) {
    return parseStringLiteral(context);
  }
  
  // Handle numeric literals
  if (
    context.index < context.formula.length &&
    (/[0-9]/.test(context.formula[context.index]) ||
      (context.formula[context.index] === '.' && 
       context.index + 1 < context.formula.length && 
       /[0-9]/.test(context.formula[context.index + 1])))
  ) {
    return parseNumericLiteral(context);
  }
  
  // Handle field references with bracket notation [Field_Name__c]
  if (context.index < context.formula.length && context.formula[context.index] === '[') {
    return parseFieldReference(context);
  }
  
  // If not a literal or field reference with brackets, try to parse as identifier
  // (field name without brackets, function call, or reserved word)
  return parseIdentifier(context);
}

/**
 * Parse a string literal
 */
function parseStringLiteral(context: ParserContext): string {
  const quote = context.formula[context.index];
  context.index++; // Skip the opening quote
  
  let value = '';
  let escaped = false;
  
  while (context.index < context.formula.length) {
    const char = context.formula[context.index];
    
    if (escaped) {
      // Handle escape sequences
      if (char === quote || char === '\\') {
        value += char;
      } else {
        value += '\\' + char;
      }
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      context.index++; // Skip the closing quote
      return `'${value}'`; // In SQL, string literals use single quotes
    } else {
      value += char;
    }
    
    context.index++;
  }
  
  throw new FormulaError('Unterminated string literal');
}

/**
 * Parse a numeric literal
 */
function parseNumericLiteral(context: ParserContext): string {
  let value = '';
  
  // Parse the integer part
  while (
    context.index < context.formula.length &&
    /[0-9]/.test(context.formula[context.index])
  ) {
    value += context.formula[context.index];
    context.index++;
  }
  
  // Parse the decimal part if present
  if (
    context.index < context.formula.length &&
    context.formula[context.index] === '.'
  ) {
    value += '.';
    context.index++;
    
    // Ensure there's at least one digit after the decimal point
    if (
      context.index < context.formula.length &&
      /[0-9]/.test(context.formula[context.index])
    ) {
      while (
        context.index < context.formula.length &&
        /[0-9]/.test(context.formula[context.index])
      ) {
        value += context.formula[context.index];
        context.index++;
      }
    } else {
      throw new FormulaError('Invalid numeric literal: decimal point must be followed by digits');
    }
  }
  
  // Parse scientific notation if present (e.g., 1.23e+4)
  if (
    context.index < context.formula.length &&
    (context.formula[context.index] === 'e' || context.formula[context.index] === 'E')
  ) {
    value += 'e';
    context.index++;
    
    // Parse the sign of the exponent if present
    if (
      context.index < context.formula.length &&
      (context.formula[context.index] === '+' || context.formula[context.index] === '-')
    ) {
      value += context.formula[context.index];
      context.index++;
    }
    
    // Parse the exponent digits
    if (
      context.index < context.formula.length &&
      /[0-9]/.test(context.formula[context.index])
    ) {
      while (
        context.index < context.formula.length &&
        /[0-9]/.test(context.formula[context.index])
      ) {
        value += context.formula[context.index];
        context.index++;
      }
    } else {
      throw new FormulaError('Invalid numeric literal: exponent must contain digits');
    }
  }
  
  return value;
}

/**
 * Parse a field reference with bracket notation [Field_Name__c]
 */
function parseFieldReference(context: ParserContext): string {
  context.index++; // Skip the opening [
  
  let fieldName = '';
  
  while (
    context.index < context.formula.length &&
    context.formula[context.index] !== ']'
  ) {
    fieldName += context.formula[context.index];
    context.index++;
  }
  
  if (context.index >= context.formula.length) {
    throw new FormulaError('Unterminated field reference');
  }
  
  context.index++; // Skip the closing ]
  
  // Look up the field in the field map
  const columnName = context.fieldMap[fieldName];
  if (!columnName) {
    throw new FormulaError(`Unknown field: ${fieldName}`);
  }
  
  return columnName;
}

/**
 * Parse an identifier (field name without brackets, function call, or reserved word)
 */
function parseIdentifier(context: ParserContext): string {
  // Check if we're at the end of the formula
  if (context.index >= context.formula.length) {
    throw new FormulaError('Unexpected end of formula');
  }
  
  // Check if the field is in the field map
  const fieldMatch = Object.entries(context.fieldMap).find(([field]) => 
    context.formula.substring(context.index).startsWith(field)
  );
  
  if (fieldMatch) {
    context.index += fieldMatch[0].length;
    return fieldMatch[1];
  }
  
  // If not a field name, try function or keyword
  let name = '';
  
  // Capture the function name or identifier
  while (
    context.index < context.formula.length && 
    /[a-zA-Z0-9_]/.test(context.formula[context.index])
  ) {
    name += context.formula[context.index];
    context.index++;
  }
  
  // Convert to uppercase for case-insensitive comparison
  const upperName = name.toUpperCase();
  
  skipWhitespace(context);
  
  // Check for function call with parentheses
  if (context.index < context.formula.length && context.formula[context.index] === '(') {
    return parseFunctionCall(upperName, context);
  }
  
  // Handle logical constants
  if (upperName === 'TRUE') return 'TRUE';
  if (upperName === 'FALSE') return 'FALSE';
  if (upperName === 'NULL') return 'NULL';
  
  // Check if it's a field name that wasn't enclosed in brackets
  const columnName = context.fieldMap[name];
  if (columnName) {
    return columnName;
  }
  
  throw new FormulaError(`Unknown identifier: ${name}`);
}

/**
 * Parse a function call
 */
function parseFunctionCall(funcName: string, context: ParserContext): string {
  context.index++; // Skip the opening (
  
  // Parse the arguments
  const args: string[] = [];
  
  skipWhitespace(context);
  
  // Handle empty argument list
  if (context.index < context.formula.length && context.formula[context.index] === ')') {
    context.index++;
  } else {
    // Parse comma-separated arguments
    while (true) {
      args.push(parseExpression(context));
      
      skipWhitespace(context);
      
      if (context.index >= context.formula.length) {
        throw new FormulaError('Unterminated function call');
      }
      
      if (context.formula[context.index] === ')') {
        context.index++;
        break;
      }
      
      if (context.formula[context.index] === ',') {
        context.index++;
        skipWhitespace(context);
      } else {
        throw new FormulaError(`Expected ',' or ')' in function arguments`);
      }
    }
  }
  
  // Translate Salesforce functions to DuckDB SQL functions
  switch (funcName) {
    // Logical functions
    case 'AND':
      if (args.length === 0) {
        throw new FormulaError('AND() requires at least 1 argument');
      }
      if (args.length === 1) {
        return args[0]; // If there's only one argument, just return it
      }
      return args.join(' AND ');
      
    case 'OR':
      if (args.length === 0) {
        throw new FormulaError('OR() requires at least 1 argument');
      }
      if (args.length === 1) {
        return args[0]; // If there's only one argument, just return it
      }
      return args.join(' OR ');
      
    case 'NOT':
      if (args.length !== 1) {
        throw new FormulaError('NOT() requires exactly 1 argument');
      }
      return `NOT ${args[0]}`;
    
    case 'IF':
      if (args.length !== 3) {
        throw new FormulaError('IF() requires exactly 3 arguments');
      }
      return `CASE WHEN ${args[0]} THEN ${args[1]} ELSE ${args[2]} END`;
      
    case 'CASE':
      // Convert Salesforce CASE to SQL CASE
      return handleCaseFunction(args);
      
    case 'ISBLANK':
      if (args.length !== 1) {
        throw new FormulaError('ISBLANK() requires exactly 1 argument');
      }
      return `(${args[0]} IS NULL OR ${args[0]} = '')`;
      
    case 'ISEMPTY':
      if (args.length !== 1) {
        throw new FormulaError('ISEMPTY() requires exactly 1 argument');
      }
      return `(${args[0]} IS NULL OR ${args[0]} = '')`;
      
    case 'ISNULL':
      if (args.length !== 1) {
        throw new FormulaError('ISNULL() requires exactly 1 argument');
      }
      return `(${args[0]} IS NULL)`;
      
    case 'ISNUMBER':
      if (args.length !== 1) {
        throw new FormulaError('ISNUMBER() requires exactly 1 argument');
      }
      return `TRY_CAST(${args[0]} AS DOUBLE) IS NOT NULL`;
      
    case 'ISTEXT':
      if (args.length !== 1) {
        throw new FormulaError('ISTEXT() requires exactly 1 argument');
      }
      return `(${args[0]} IS NOT NULL AND TRY_CAST(${args[0]} AS VARCHAR) IS NOT NULL)`;
      
    case 'ISDATE':
      if (args.length !== 1) {
        throw new FormulaError('ISDATE() requires exactly 1 argument');
      }
      return `TRY_CAST(${args[0]} AS DATE) IS NOT NULL`;
      
    case 'IF_ERROR':
    case 'IFERROR':
      if (args.length !== 2) {
        throw new FormulaError('IF_ERROR() requires exactly 2 arguments: value, value_if_error');
      }
      return `COALESCE(TRY_CAST(${args[0]} AS VARCHAR), ${args[1]})`;
      
    case 'NULLIF':
      if (args.length !== 2) {
        throw new FormulaError('NULLIF() requires exactly 2 arguments');
      }
      return `NULLIF(${args[0]}, ${args[1]})`;
      
    case 'BLANKVALUE':
      if (args.length !== 2) {
        throw new FormulaError('BLANKVALUE() requires exactly 2 arguments');
      }
      return `COALESCE(NULLIF(${args[0]}, ''), ${args[1]})`;
    
    // Text functions
    case 'LEN':
      if (args.length !== 1) {
        throw new FormulaError('LEN() requires exactly 1 argument');
      }
      return `LENGTH(${args[0]})`;
      
    case 'LEFT':
      if (args.length !== 2) {
        throw new FormulaError('LEFT() requires exactly 2 arguments');
      }
      return `LEFT(${args[0]}, ${args[1]})`;
      
    case 'RIGHT':
      if (args.length !== 2) {
        throw new FormulaError('RIGHT() requires exactly 2 arguments');
      }
      return `RIGHT(${args[0]}, ${args[1]})`;
      
    case 'MID':
      if (args.length !== 3) {
        throw new FormulaError('MID() requires exactly 3 arguments');
      }
      return `SUBSTRING(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'FIND':
      if (args.length < 2 || args.length > 3) {
        throw new FormulaError('FIND() requires 2 or 3 arguments');
      }
      if (args.length === 2) {
        return `POSITION(${args[0]} IN ${args[1]})`;
      }
      return `POSITION(${args[0]} IN SUBSTRING(${args[1]}, ${args[2]})) + ${args[2]} - 1`;
      
    case 'SUBSTITUTE':
      if (args.length !== 3) {
        throw new FormulaError('SUBSTITUTE() requires exactly 3 arguments');
      }
      return `REPLACE(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'CONTAINS':
      if (args.length !== 2) {
        throw new FormulaError('CONTAINS() requires exactly 2 arguments');
      }
      return `POSITION(${args[1]} IN ${args[0]}) > 0`;
      
    case 'BEGINS':
    case 'STARTSWITH':
      if (args.length !== 2) {
        throw new FormulaError('BEGINS() requires exactly 2 arguments');
      }
      return `STARTS_WITH(${args[0]}, ${args[1]})`;
      
    case 'ENDSWITH':
      if (args.length !== 2) {
        throw new FormulaError('ENDSWITH() requires exactly 2 arguments');
      }
      return `ENDS_WITH(${args[0]}, ${args[1]})`;
      
    case 'EQUALS':
      if (args.length !== 2) {
        throw new FormulaError('EQUALS() requires exactly 2 arguments');
      }
      return `${args[0]} = ${args[1]}`;
      
    case 'EQUALSIGNORECASE':
      if (args.length !== 2) {
        throw new FormulaError('EQUALSIGNORECASE() requires exactly 2 arguments');
      }
      return `LOWER(${args[0]}) = LOWER(${args[1]})`;
      
    case 'UPPER':
      if (args.length !== 1) {
        throw new FormulaError('UPPER() requires exactly 1 argument');
      }
      return `UPPER(${args[0]})`;
      
    case 'LOWER':
      if (args.length !== 1) {
        throw new FormulaError('LOWER() requires exactly 1 argument');
      }
      return `LOWER(${args[0]})`;
      
    case 'TRIM':
      if (args.length !== 1) {
        throw new FormulaError('TRIM() requires exactly 1 argument');
      }
      return `TRIM(${args[0]})`;
      
    case 'LPAD':
      if (args.length !== 3) {
        throw new FormulaError('LPAD() requires exactly 3 arguments');
      }
      return `LPAD(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'RPAD':
      if (args.length !== 3) {
        throw new FormulaError('RPAD() requires exactly 3 arguments');
      }
      return `RPAD(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'TEXT':
      if (args.length !== 1) {
        throw new FormulaError('TEXT() requires exactly 1 argument');
      }
      return `CAST(${args[0]} AS VARCHAR)`;
      
    case 'REPLACE':
      if (args.length !== 3) {
        throw new FormulaError('REPLACE() requires exactly 3 arguments: text, old_text, new_text');
      }
      return `REPLACE(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'FORMAT':
      if (args.length < 2) {
        throw new FormulaError('FORMAT() requires at least 2 arguments');
      }
      // For DuckDB we'll use the printf-style formatting
      return `FORMAT(${args.join(', ')})`;
      
    case 'INITCAP':
      if (args.length !== 1) {
        throw new FormulaError('INITCAP() requires exactly 1 argument');
      }
      return `INITCAP(${args[0]})`;
      
    case 'REPEAT':
      if (args.length !== 2) {
        throw new FormulaError('REPEAT() requires exactly 2 arguments: text, num_times');
      }
      return `REPEAT(${args[0]}, ${args[1]})`;
      
    case 'REVERSE':
      if (args.length !== 1) {
        throw new FormulaError('REVERSE() requires exactly 1 argument');
      }
      return `REVERSE(${args[0]})`;
      
    case 'CHARAT':
      if (args.length !== 2) {
        throw new FormulaError('CHARAT() requires exactly 2 arguments: string, position');
      }
      return `SUBSTRING(${args[0]}, ${args[1]}, 1)`;
      
    case 'CHARCODEAT':
      if (args.length !== 2) {
        throw new FormulaError('CHARCODEAT() requires exactly 2 arguments: string, position');
      }
      return `ASCII(SUBSTRING(${args[0]}, ${args[1]}, 1))`;
      
    case 'INCLUDES':
      if (args.length !== 2) {
        throw new FormulaError('INCLUDES() requires exactly 2 arguments: string, searchString');
      }
      return `POSITION(${args[1]} IN ${args[0]}) > 0`;
      
    case 'INDEXOF':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('INDEXOF() requires 2 or 3 arguments: string, searchString, [position]');
      }
      if (args.length === 2) {
        return `(POSITION(${args[1]} IN ${args[0]}) - 1)`;
      }
      return `(POSITION(${args[1]} IN SUBSTRING(${args[0]}, ${args[2]} + 1)) + ${args[2]})`;
      
    case 'LASTINDEXOF':
      if (args.length !== 2) {
        throw new FormulaError('LASTINDEXOF() requires exactly 2 arguments: string, searchString');
      }
      return `(LENGTH(${args[0]}) - POSITION(REVERSE(${args[1]}) IN REVERSE(${args[0]})) - LENGTH(${args[1]}) + 1)`;
      
    case 'MATCH':
      if (args.length !== 2) {
        throw new FormulaError('MATCH() requires exactly 2 arguments: string, regex');
      }
      return `REGEXP_MATCHES(${args[0]}, ${args[1]})`;
      
    case 'PADEND':
    case 'PADSTART':
      if (args.length !== 3) {
        throw new FormulaError(`${funcName}() requires exactly 3 arguments: string, targetLength, padString`);
      }
      if (funcName === 'PADEND') {
        return `RPAD(${args[0]}, ${args[1]}, ${args[2]})`;
      }
      return `LPAD(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'REPLACEALL':
      if (args.length !== 3) {
        throw new FormulaError('REPLACEALL() requires exactly 3 arguments: string, pattern, replacement');
      }
      return `REGEXP_REPLACE(${args[0]}, ${args[1]}, ${args[2]}, 'g')`;
      
    case 'SEARCH':
      if (args.length !== 2) {
        throw new FormulaError('SEARCH() requires exactly 2 arguments: string, searchValue');
      }
      return `POSITION(${args[1]} IN ${args[0]})`;
      
    case 'SLICE':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('SLICE() requires 2 or 3 arguments: string, startIndex, [endIndex]');
      }
      if (args.length === 2) {
        return `SUBSTRING(${args[0]}, ${args[1]} + 1)`;
      }
      return `SUBSTRING(${args[0]}, ${args[1]} + 1, ${args[2]} - ${args[1]})`;
      
    case 'SPLIT':
      if (args.length !== 2) {
        throw new FormulaError('SPLIT() requires exactly 2 arguments: string, separator');
      }
      return `STRING_SPLIT(${args[0]}, ${args[1]})`;
      
    case 'SUBSTRING':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('SUBSTRING() requires 2 or 3 arguments: string, startIndex, [length]');
      }
      if (args.length === 2) {
        return `SUBSTRING(${args[0]}, ${args[1]} + 1)`;
      }
      return `SUBSTRING(${args[0]}, ${args[1]} + 1, ${args[2]})`;
      
    case 'TOLOWERCASE':
      if (args.length !== 1) {
        throw new FormulaError('TOLOWERCASE() requires exactly 1 argument');
      }
      return `LOWER(${args[0]})`;
      
    case 'TOUPPERCASE':
      if (args.length !== 1) {
        throw new FormulaError('TOUPPERCASE() requires exactly 1 argument');
      }
      return `UPPER(${args[0]})`;
      
    case 'TRIMSTART':
      if (args.length !== 1) {
        throw new FormulaError('TRIMSTART() requires exactly 1 argument');
      }
      return `LTRIM(${args[0]})`;
      
    case 'TRIMEND':
      if (args.length !== 1) {
        throw new FormulaError('TRIMEND() requires exactly 1 argument');
      }
      return `RTRIM(${args[0]})`;
      
    case 'CONCATENATE':
    case 'CONCAT':
      if (args.length < 1) {
        throw new FormulaError('CONCATENATE() requires at least 1 argument');
      }
      return args.join(' || ');
    
    // Date/Time functions
    case 'TODAY':
      if (args.length !== 0) {
        throw new FormulaError('TODAY() requires no arguments');
      }
      return `CURRENT_DATE`;
      
    case 'NOW':
      if (args.length !== 0) {
        throw new FormulaError('NOW() requires no arguments');
      }
      return `CURRENT_TIMESTAMP`;
      
    case 'DATEVALUE':
      if (args.length !== 1) {
        throw new FormulaError('DATEVALUE() requires exactly 1 argument');
      }
      return `CAST(${args[0]} AS DATE)`;
      
    case 'DATETIMEVALUE':
      if (args.length !== 1) {
        throw new FormulaError('DATETIMEVALUE() requires exactly 1 argument');
      }
      return `CAST(${args[0]} AS TIMESTAMP)`;
      
    case 'YEAR':
      if (args.length !== 1) {
        throw new FormulaError('YEAR() requires exactly 1 argument');
      }
      return `EXTRACT(YEAR FROM ${args[0]})`;
      
    case 'MONTH':
      if (args.length !== 1) {
        throw new FormulaError('MONTH() requires exactly 1 argument');
      }
      return `EXTRACT(MONTH FROM ${args[0]})`;
      
    case 'DAY':
      if (args.length !== 1) {
        throw new FormulaError('DAY() requires exactly 1 argument');
      }
      return `EXTRACT(DAY FROM ${args[0]})`;
    
    case 'HOUR':
      if (args.length !== 1) {
        throw new FormulaError('HOUR() requires exactly 1 argument');
      }
      return `EXTRACT(HOUR FROM ${args[0]})`;
      
    case 'MINUTE':
      if (args.length !== 1) {
        throw new FormulaError('MINUTE() requires exactly 1 argument');
      }
      return `EXTRACT(MINUTE FROM ${args[0]})`;
      
    case 'SECOND':
      if (args.length !== 1) {
        throw new FormulaError('SECOND() requires exactly 1 argument');
      }
      return `EXTRACT(SECOND FROM ${args[0]})`;
      
    case 'DATEADD':
      if (args.length !== 3) {
        throw new FormulaError('DATEADD() requires exactly 3 arguments: unit, number, date');
      }
      return `DATEADD(${args[0]}, ${args[1]}, ${args[2]})`;
      
    case 'DATEDIFF':
      if (args.length !== 3) {
        throw new FormulaError('DATEDIFF() requires exactly 3 arguments: unit, date1, date2');
      }
      return `DATEDIFF(${args[0]}, ${args[1]}, ${args[2]})`;
    
    // Math functions
    case 'ROUND':
      if (args.length < 1 || args.length > 2) {
        throw new FormulaError('ROUND() requires 1 or 2 arguments');
      }
      if (args.length === 1) {
        return `ROUND(${args[0]})`;
      }
      return `ROUND(${args[0]}, ${args[1]})`;
      
    case 'FLOOR':
      if (args.length !== 1) {
        throw new FormulaError('FLOOR() requires exactly 1 argument');
      }
      return `FLOOR(${args[0]})`;
      
    case 'CEILING':
      if (args.length !== 1) {
        throw new FormulaError('CEILING() requires exactly 1 argument');
      }
      return `CEILING(${args[0]})`;
    
    case 'ABS':
      if (args.length !== 1) {
        throw new FormulaError('ABS() requires exactly 1 argument');
      }
      return `ABS(${args[0]})`;
      
    case 'MAX':
      if (args.length < 1) {
        throw new FormulaError('MAX() requires at least 1 argument');
      }
      if (args.length === 1) {
        return args[0];
      }
      return `GREATEST(${args.join(', ')})`;
      
    case 'MIN':
      if (args.length < 1) {
        throw new FormulaError('MIN() requires at least 1 argument');
      }
      if (args.length === 1) {
        return args[0];
      }
      return `LEAST(${args.join(', ')})`;
      
    case 'POWER':
      if (args.length !== 2) {
        throw new FormulaError('POWER() requires exactly 2 arguments: base, exponent');
      }
      return `POWER(${args[0]}, ${args[1]})`;
      
    case 'SQRT':
      if (args.length !== 1) {
        throw new FormulaError('SQRT() requires exactly 1 argument');
      }
      return `SQRT(${args[0]})`;
      
    case 'EXP':
      if (args.length !== 1) {
        throw new FormulaError('EXP() requires exactly 1 argument');
      }
      return `EXP(${args[0]})`;
      
    case 'LOG':
      if (args.length !== 1 && args.length !== 2) {
        throw new FormulaError('LOG() requires 1 or 2 arguments');
      }
      if (args.length === 1) {
        return `LN(${args[0]})`;
      }
      return `LOG(${args[1]}) / LOG(${args[0]})`;
      
    case 'MOD':
      if (args.length !== 2) {
        throw new FormulaError('MOD() requires exactly 2 arguments: dividend, divisor');
      }
      return `MOD(${args[0]}, ${args[1]})`;
    
    default:
      throw new FormulaError(`Unsupported function: ${funcName}()`);
  }
}

/**
 * Handle the CASE function translation
 */
function handleCaseFunction(args: string[]): string {
  if (args.length < 3 || args.length % 2 === 0) {
    throw new FormulaError('CASE() requires an odd number of arguments (at least 3)');
  }
  
  const expression = args[0];
  let sql = `CASE ${expression}`;
  
  // Process pairs of when/then clauses
  for (let i = 1; i < args.length - 1; i += 2) {
    sql += ` WHEN ${args[i]} THEN ${args[i + 1]}`;
  }
  
  // Add the else clause (last argument)
  sql += ` ELSE ${args[args.length - 1]} END`;
  
  return sql;
} 