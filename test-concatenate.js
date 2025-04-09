// Test for CONCATENATE function

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

// Our test cases
const tests = [
  {
    name: 'CONCATENATE with multiple arguments',
    formula: 'CONCATENATE("Mr.", " ", FirstName, " ", LastName)',
    fieldMap: { FirstName: 'first_name', LastName: 'last_name' },
    expectedOutput: "'Mr.' || ' ' || first_name || ' ' || last_name"
  },
  {
    name: 'CONCATENATE with three arguments',
    formula: 'CONCATENATE("Mr.", " Sathvik", " Sovit")',
    fieldMap: {},
    expectedOutput: "'Mr.' || ' Sathvik' || ' Sovit'"
  },
  {
    name: 'CONCATENATE with one argument',
    formula: 'CONCATENATE(Name)',
    fieldMap: { Name: 'name' },
    expectedOutput: "name"
  }
];

// Run the tests
console.log("CONCATENATE FUNCTION TESTS\n");

tests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`Input:  ${test.formula}`);
  
  try {
    // Parse the formula
    const result = parseFormula(test.formula, test.fieldMap);
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

// Basic implementation of formula parsing for testing
function parseFormula(formula, fieldMap) {
  if (formula.startsWith('CONCATENATE(')) {
    // Simple parser that extracts arguments from CONCATENATE function
    const argsString = formula.substring(12, formula.length - 1);
    const args = parseArgs(argsString);
    
    // Process the arguments
    const processedArgs = args.map(arg => {
      // If it's a string literal (starts and ends with quotes)
      if ((arg.startsWith('"') && arg.endsWith('"')) || 
          (arg.startsWith("'") && arg.endsWith("'"))) {
        // Convert to SQL string with single quotes
        return `'${arg.substring(1, arg.length - 1)}'`;
      }
      
      // If it's a field name in the field map
      if (fieldMap[arg]) {
        return fieldMap[arg];
      }
      
      // Otherwise, return as is
      return arg;
    });
    
    // For single argument, just return it
    if (processedArgs.length === 1) {
      return processedArgs[0];
    }
    
    // For multiple arguments, join with ||
    return processedArgs.join(' || ');
  }
  
  throw new FormulaError('Only CONCATENATE function is supported in this test');
}

// Parse comma-separated arguments, respecting quoted strings
function parseArgs(argsString) {
  const args = [];
  let currentArg = '';
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if ((char === '"' || char === "'") && (i === 0 || argsString[i-1] !== '\\')) {
      if (inQuote && char === quoteChar) {
        // End of quoted string
        currentArg += char;
        inQuote = false;
      } else if (!inQuote) {
        // Start of quoted string
        currentArg += char;
        inQuote = true;
        quoteChar = char;
      } else {
        // Quote character inside string quoted with different quote type
        currentArg += char;
      }
    } else if (char === ',' && !inQuote) {
      // End of argument
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      // Normal character
      currentArg += char;
    }
  }
  
  // Add the last argument if there is one
  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }
  
  return args;
} 