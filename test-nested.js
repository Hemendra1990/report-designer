// Test for nested formula: IF(industry == IF(account_name == "IT", "MAF", "OTH"), 50, 10)

/**
 * Small implementation of our formula parser to verify the fix.
 * This handles the nested IF case: IF(industry == IF(account_name == "IT", "MAF", "OTH"), 50, 10)
 */

function testNestedFormula() {
  const formula = 'IF(industry == IF(account_name == "IT", "MAF", "OTH"), 50, 10)';
  const fieldMap = { 
    industry: 'industry', 
    account_name: 'account_name' 
  };
  
  try {
    const result = translateFormulaToSQL(formula, fieldMap);
    console.log('Nested Formula:', formula);
    console.log('Result:', result);
    const expected = "CASE WHEN industry = CASE WHEN account_name = 'IT' THEN 'MAF' ELSE 'OTH' END THEN 50 ELSE 10 END";
    console.log('Expected:', expected);
    console.log('Success:', result === expected);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Main entry function to translate a formula to SQL
function translateFormulaToSQL(formula, fieldMap) {
  const context = {
    formula,
    index: 0,
    fieldMap
  };
  
  return parseExpression(context);
}

// Parse an expression which could include nested expressions
function parseExpression(context) {
  skipWhitespace(context);
  
  // Check if this is an IF function
  if (context.index < context.formula.length - 2 && 
      context.formula.substring(context.index, context.index + 2).toUpperCase() === 'IF') {
    return parseIfFunction(context);
  }
  
  // Parse a basic value (string, field, etc.)
  return parseValue(context);
}

// Parse an IF function and its arguments
function parseIfFunction(context) {
  // Skip 'IF'
  context.index += 2;
  skipWhitespace(context);
  
  // Expect an opening parenthesis
  if (context.formula[context.index] !== '(') {
    throw new Error('Expected ( after IF');
  }
  context.index++;
  skipWhitespace(context);
  
  // Parse the condition (can be complex with nested IFs)
  const condition = parseCondition(context);
  skipWhitespace(context);
  
  // Expect a comma after the condition
  if (context.formula[context.index] !== ',') {
    throw new Error('Expected , after condition');
  }
  context.index++;
  skipWhitespace(context);
  
  // Parse the true value (could be another nested expression)
  const trueValue = parseExpression(context);
  skipWhitespace(context);
  
  // Expect a comma after the true value
  if (context.formula[context.index] !== ',') {
    throw new Error('Expected , after true value');
  }
  context.index++;
  skipWhitespace(context);
  
  // Parse the false value
  const falseValue = parseExpression(context);
  skipWhitespace(context);
  
  // Expect a closing parenthesis
  if (context.formula[context.index] !== ')') {
    throw new Error('Expected ) at end of IF function');
  }
  context.index++;
  
  // Return the SQL CASE expression
  return `CASE WHEN ${condition} THEN ${trueValue} ELSE ${falseValue} END`;
}

// Parse a condition which may include comparison operators like == or nested functions
function parseCondition(context) {
  // Parse the left side of the condition
  const left = parseExpression(context);
  skipWhitespace(context);
  
  // Look for comparison operators
  if (context.index < context.formula.length - 1) {
    // Check for == operator
    if (context.formula[context.index] === '=' && context.formula[context.index + 1] === '=') {
      context.index += 2; // Skip ==
      skipWhitespace(context);
      
      const right = parseExpression(context);
      return `${left} = ${right}`; // Convert == to = for SQL
    }
    
    // Other operators could be added here (!=, >, <, etc.)
  }
  
  // If no operator found, just return the expression as is
  return left;
}

// Parse a simple value (string, field, number)
function parseValue(context) {
  skipWhitespace(context);
  
  // Check if it's a string literal
  if (context.formula[context.index] === '"' || context.formula[context.index] === "'") {
    return parseStringLiteral(context);
  }
  
  // Check if it's a number
  if (/[0-9]/.test(context.formula[context.index])) {
    return parseNumber(context);
  }
  
  // Otherwise it's probably a field name
  return parseField(context);
}

// Parse a string literal
function parseStringLiteral(context) {
  const quote = context.formula[context.index];
  context.index++; // Skip opening quote
  
  let value = '';
  while (context.index < context.formula.length && context.formula[context.index] !== quote) {
    value += context.formula[context.index];
    context.index++;
  }
  
  if (context.index >= context.formula.length) {
    throw new Error('Unterminated string literal');
  }
  
  context.index++; // Skip closing quote
  return `'${value}'`; // Use SQL single quotes
}

// Parse a number
function parseNumber(context) {
  let value = '';
  
  while (context.index < context.formula.length && 
         /[0-9.]/.test(context.formula[context.index])) {
    value += context.formula[context.index];
    context.index++;
  }
  
  return value;
}

// Parse a field name
function parseField(context) {
  let name = '';
  
  while (context.index < context.formula.length && 
         /[a-zA-Z0-9_]/.test(context.formula[context.index])) {
    name += context.formula[context.index];
    context.index++;
  }
  
  // Use the field map if provided
  if (context.fieldMap && context.fieldMap[name]) {
    return context.fieldMap[name];
  }
  
  return name;
}

// Skip whitespace characters
function skipWhitespace(context) {
  while (context.index < context.formula.length && /\s/.test(context.formula[context.index])) {
    context.index++;
  }
}

// Run the test
testNestedFormula(); 