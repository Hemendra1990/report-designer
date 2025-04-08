// Test for the specific user example: CONCATENATE("Mr.", "Sathvik", "Sovit")

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

const formula = 'CONCATENATE("Mr.", "Sathvik", "Sovit")';
const fieldMap = {};
const expectedOutput = "'Mr.' || 'Sathvik' || 'Sovit'";

console.log("Testing specific user example:");
console.log(`Input:  ${formula}`);

try {
  // Parse the formula
  const result = parseFormula(formula, fieldMap);
  console.log(`Output: ${result}`);
  console.log(`Expected: ${expectedOutput}`);
  console.log(`Success: ${result === expectedOutput}`);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
}

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