// Test for AND function with a single argument
const formula = 'AND(3>4)';
const fieldMap = {};

console.log('Testing formula:', formula);

try {
  // Create a minimal parser to test the function
  const result = parseSingleAndFormula(formula, fieldMap);
  console.log('Result:', result);
  console.log('Expected: 3>4');
  console.log('Success:', result === '3>4');
} catch (error) {
  console.error('Error:', error.message);
}

// Parse a simple AND formula with a single argument
function parseSingleAndFormula(formula, fieldMap) {
  // Check if this is an AND function
  if (!formula.startsWith('AND(')) {
    throw new Error('This parser only handles AND functions');
  }
  
  // Extract the arguments of the AND function
  const andArgsString = formula.substring(4, formula.length - 1); // Skip 'AND(' and remove trailing ')'
  return andArgsString; // For a single argument, just return it
} 