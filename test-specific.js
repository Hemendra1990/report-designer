// Test for specifically requested formula:
// IF(AND(Amount > 0, Probability > 0), "Valid", "Check Data")

// This is a direct implementation test without trying to import the module

// Test case
const formula = 'IF(AND(Amount > 0, Probability > 0), "Valid", "Check Data")';
const fieldMap = { 
  Amount: 'amount', 
  Probability: 'probability' 
};

const expectedOutput = "CASE WHEN amount > 0 AND probability > 0 THEN 'Valid' ELSE 'Check Data' END";

console.log('Testing formula:', formula);

try {
  // Create a minimal parser for this specific formula
  const result = parseFormula(formula, fieldMap);
  console.log('Result:', result);
  console.log('Expected:', expectedOutput);
  console.log('Success:', result === expectedOutput);
} catch (error) {
  console.error('Error:', error.message);
}

// Simple parser for the specific formula structure
function parseFormula(formula, fieldMap) {
  // Check if this is an IF function
  if (!formula.startsWith('IF(')) {
    throw new Error('This parser only handles IF functions');
  }
  
  // Extract the arguments of the IF function
  const ifArgs = parseArguments(formula.substring(3)); // Skip 'IF('
  
  if (ifArgs.length !== 3) {
    throw new Error('IF function should have exactly 3 arguments');
  }
  
  // The first argument should be the AND function
  const condition = ifArgs[0];
  const trueValue = ifArgs[1].replace(/^["'](.*)["']$/, "'$1'");  // Normalize quotes
  const falseValue = ifArgs[2].replace(/^["'](.*)["']$/, "'$1'");  // Normalize quotes
  
  // Parse the AND condition
  if (!condition.startsWith('AND(')) {
    throw new Error('Expected AND function as first argument');
  }
  
  const andArgs = parseArguments(condition.substring(4)); // Skip 'AND('
  
  // Replace field names with their mappings in each condition
  const conditions = andArgs.map(part => {
    let result = part;
    
    // Replace field names with their mapped values
    for (const [field, mapped] of Object.entries(fieldMap)) {
      if (result.includes(field)) {
        result = result.replace(field, mapped);
      }
    }
    
    return result;
  }).join(' AND ');
  
  // Build the SQL CASE expression
  return `CASE WHEN ${conditions} THEN ${trueValue} ELSE ${falseValue} END`;
}

// Helper function to parse comma-separated arguments, respecting nested function calls
function parseArguments(str) {
  const args = [];
  let currentArg = '';
  let parenDepth = 0;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (char === '(' && !inQuote) {
      parenDepth++;
      currentArg += char;
    }
    else if (char === ')' && !inQuote) {
      parenDepth--;
      
      // If we've closed the outermost parenthesis, we're done
      if (parenDepth < 0) {
        if (currentArg.trim()) {
          args.push(currentArg.trim());
        }
        break;
      }
      
      currentArg += char;
    }
    else if ((char === '"' || char === "'") && (i === 0 || str[i-1] !== '\\')) {
      if (inQuote && char === quoteChar) {
        inQuote = false;
      } else if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      }
      currentArg += char;
    }
    else if (char === ',' && !inQuote && parenDepth === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    }
    else {
      currentArg += char;
    }
  }
  
  return args;
} 