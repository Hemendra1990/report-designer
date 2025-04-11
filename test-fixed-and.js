// Test for the fixed AND function with a single argument: AND(3>4)

/**
 * This test simulates the behavior of the FormulaTranslator.ts with the fix
 * for the AND function with a single argument.
 */

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

// Our main test case
const formula = 'AND(3>4)';
const fieldMap = {}; // No fields to map in this case

console.log('Testing formula:', formula);

try {
  // Use the simulator to test the formula
  const result = translateFormula(formula, fieldMap);
  console.log('Result:', result);
  console.log('Expected: 3>4');
  console.log('Success:', result === '3>4');
} catch (error) {
  console.error('Error:', error.message);
}

// A simplified version of the translator focused on the AND function
function translateFormula(formula, fieldMap) {
  const context = { formula, index: 0, fieldMap };
  return parseExpression(context);
}

function parseExpression(context) {
  skipWhitespace(context);
  
  // Look for function calls
  let name = '';
  while (
    context.index < context.formula.length && 
    /[a-zA-Z0-9_]/.test(context.formula[context.index])
  ) {
    name += context.formula[context.index];
    context.index++;
  }
  
  // If we found "AND", check for a function call
  if (name.toUpperCase() === 'AND') {
    skipWhitespace(context);
    if (context.index < context.formula.length && context.formula[context.index] === '(') {
      return parseAndFunction(context);
    }
  }
  
  // For simplicity, just return the rest of the formula for other cases
  return context.formula.substring(context.index);
}

function parseAndFunction(context) {
  context.index++; // Skip the opening (
  
  // Parse the arguments
  const args = [];
  let arg = '';
  
  skipWhitespace(context);
  
  // For simplicity, just capture everything until the closing parenthesis
  while (context.index < context.formula.length && context.formula[context.index] !== ')') {
    arg += context.formula[context.index];
    context.index++;
  }
  
  if (context.index >= context.formula.length) {
    throw new FormulaError('Unterminated function call');
  }
  
  context.index++; // Skip the closing )
  
  // Add the argument to our args array
  if (arg.trim()) {
    args.push(arg.trim());
  }
  
  // Handle the arguments according to our fixed logic
  if (args.length === 0) {
    throw new FormulaError('AND() requires at least 1 argument');
  }
  
  if (args.length === 1) {
    return args[0]; // If there's only one argument, just return it
  }
  
  return args.join(' AND ');
}

function skipWhitespace(context) {
  while (
    context.index < context.formula.length &&
    /\s/.test(context.formula[context.index])
  ) {
    context.index++;
  }
} 