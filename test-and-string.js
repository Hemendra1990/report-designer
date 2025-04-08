// Test script for AND function and string functions

/**
 * Small implementation of our FormulaTranslator focused on testing:
 * 1. AND function: IF(AND(Amount > 0, Probability > 0), "Valid", "Check Data")
 * 2. String functions: LPAD, RPAD, TEXT, etc.
 */

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

function translateFormulaToSQL(formula, fieldMap) {
  const context = {
    formula,
    index: 0,
    fieldMap
  };
  
  const result = parseExpression(context);
  
  // Check if we consumed the entire formula
  skipWhitespace(context);
  if (context.index < context.formula.length) {
    throw new FormulaError(`Unexpected token: ${context.formula.substring(context.index)}`);
  }
  
  return result;
}

function skipWhitespace(context) {
  while (
    context.index < context.formula.length &&
    /\s/.test(context.formula[context.index])
  ) {
    context.index++;
  }
}

function parseExpression(context) {
  return parseLogicalExpression(context);
}

function parseLogicalExpression(context) {
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

function parseComparisonExpression(context) {
  let left = parseAdditiveExpression(context);
  
  skipWhitespace(context);
  
  if (context.index < context.formula.length) {
    // Check for double-character operators first (==, !=, <=, >=)
    const twoChars = context.formula.substring(context.index, context.index + 2);
    if (twoChars === '==' || twoChars === '!=' || twoChars === '<=' || twoChars === '>=') {
      // Map Salesforce operators to SQL operators
      let operator;
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

function parseAdditiveExpression(context) {
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

function parseMultiplicativeExpression(context) {
  return parsePrimaryExpression(context);
}

function parsePrimaryExpression(context) {
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
  return parseIdentifier(context);
}

/**
 * Parse a numeric literal
 */
function parseNumericLiteral(context) {
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
  
  return value;
}

function parseStringLiteral(context) {
  const quote = context.formula[context.index];
  context.index++; // Skip the opening quote
  
  let value = '';
  
  while (context.index < context.formula.length && context.formula[context.index] !== quote) {
    value += context.formula[context.index];
    context.index++;
  }
  
  if (context.index >= context.formula.length) {
    throw new FormulaError('Unterminated string literal');
  }
  
  context.index++; // Skip the closing quote
  return `'${value}'`; // In SQL, string literals use single quotes
}

function parseFieldReference(context) {
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

function parseIdentifier(context) {
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

function parseFunctionCall(funcName, context) {
  context.index++; // Skip the opening (
  
  // Parse the arguments
  const args = [];
  
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
      
    // String functions
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
      
    case 'CONCAT':
      if (args.length < 2) {
        throw new FormulaError('CONCAT() requires at least 2 arguments');
      }
      return args.join(' || ');
      
    default:
      throw new FormulaError(`Unsupported function: ${funcName}()`);
  }
}

// Test cases
const tests = [
  {
    name: 'Direct single argument AND function',
    formula: 'AND(Score > 90)',
    fieldMap: { Score: 'score' },
    expectedOutput: "score > 90"
  },
  {
    name: 'Single argument AND function in IF',
    formula: 'IF(AND(Amount > 0), "Positive", "Zero or Negative")',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "CASE WHEN amount > 0 THEN 'Positive' ELSE 'Zero or Negative' END"
  },
  {
    name: 'AND function',
    formula: 'IF(AND(Amount > 0, Probability > 0), "Valid", "Check Data")',
    fieldMap: { Amount: 'amount', Probability: 'probability' },
    expectedOutput: "CASE WHEN amount > 0 AND probability > 0 THEN 'Valid' ELSE 'Check Data' END"
  },
  {
    name: 'String LPAD function',
    formula: 'LPAD(AccountNumber, 10, "0")',
    fieldMap: { AccountNumber: 'account_number' },
    expectedOutput: "LPAD(account_number, 10, '0')"
  },
  {
    name: 'String RPAD function',
    formula: 'RPAD(Name, 20, " ")',
    fieldMap: { Name: 'name' },
    expectedOutput: "RPAD(name, 20, ' ')"
  },
  {
    name: 'TEXT function',
    formula: 'TEXT(CloseDate)',
    fieldMap: { CloseDate: 'close_date' },
    expectedOutput: "CAST(close_date AS VARCHAR)"
  },
  {
    name: 'Multiple nested functions',
    formula: 'IF(AND(UPPER(Type) == "NEW", Amount > 1000), CONCAT(Name, " - ", "High Value"), "Standard")',
    fieldMap: { Type: 'type', Amount: 'amount', Name: 'name' },
    expectedOutput: "CASE WHEN UPPER(type) = 'NEW' AND amount > 1000 THEN name || ' - ' || 'High Value' ELSE 'Standard' END"
  }
];

// Run the tests
console.log("FORMULA TRANSLATOR TESTS\n");

tests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`Input:  ${test.formula}`);
  
  try {
    const result = translateFormulaToSQL(test.formula, test.fieldMap);
    console.log(`Output: ${result}`);
    
    if (result === test.expectedOutput) {
      console.log("✓ PASSED");
    } else {
      console.log(`✗ FAILED - Expected: ${test.expectedOutput}`);
    }
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    console.log("✗ FAILED - Test threw an error");
  }
  
  console.log(); // Add a blank line between tests
}); 