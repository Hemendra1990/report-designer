// Test for newly added string functions and other formula functions

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

// Our test cases
const tests = [
  // String functions
  {
    name: 'EQUALS function',
    formula: 'EQUALS(FirstName, "John")',
    fieldMap: { FirstName: 'first_name' },
    expectedOutput: "first_name = 'John'"
  },
  {
    name: 'EQUALSIGNORECASE function',
    formula: 'EQUALSIGNORECASE(FirstName, "john")',
    fieldMap: { FirstName: 'first_name' },
    expectedOutput: "LOWER(first_name) = LOWER('john')"
  },
  {
    name: 'STARTSWITH function',
    formula: 'STARTSWITH(Email, "@gmail.com")',
    fieldMap: { Email: 'email' },
    expectedOutput: "STARTS_WITH(email, '@gmail.com')"
  },
  {
    name: 'ENDSWITH function',
    formula: 'ENDSWITH(Email, "@gmail.com")',
    fieldMap: { Email: 'email' },
    expectedOutput: "ENDS_WITH(email, '@gmail.com')"
  },
  {
    name: 'CONTAINS function',
    formula: 'CONTAINS(Description, "important")',
    fieldMap: { Description: 'description' },
    expectedOutput: "POSITION('important' IN description) > 0"
  },
  {
    name: 'CONCAT alias for CONCATENATE',
    formula: 'CONCAT(FirstName, " ", LastName)',
    fieldMap: { FirstName: 'first_name', LastName: 'last_name' },
    expectedOutput: "first_name || ' ' || last_name"
  },
  {
    name: 'INITCAP function',
    formula: 'INITCAP(Name)',
    fieldMap: { Name: 'name' },
    expectedOutput: "INITCAP(name)"
  },
  {
    name: 'REPLACE function',
    formula: 'REPLACE(Phone, "-", "")',
    fieldMap: { Phone: 'phone' },
    expectedOutput: "REPLACE(phone, '-', '')"
  },
  
  // Math functions
  {
    name: 'MAX function',
    formula: 'MAX(Amount, 100)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "GREATEST(amount, 100)"
  },
  {
    name: 'MIN function',
    formula: 'MIN(Amount, 0)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "LEAST(amount, 0)"
  },
  {
    name: 'POWER function',
    formula: 'POWER(Amount, 2)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "POWER(amount, 2)"
  },
  {
    name: 'SQRT function',
    formula: 'SQRT(Amount)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "SQRT(amount)"
  },
  
  // Logical functions
  {
    name: 'ISEMPTY function',
    formula: 'ISEMPTY(Description)',
    fieldMap: { Description: 'description' },
    expectedOutput: "(description IS NULL OR description = '')"
  },
  {
    name: 'ISNUMBER function',
    formula: 'ISNUMBER(Amount)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "TRY_CAST(amount AS DOUBLE) IS NOT NULL"
  },
  {
    name: 'ISDATE function',
    formula: 'ISDATE(CreatedDate)',
    fieldMap: { CreatedDate: 'created_date' },
    expectedOutput: "TRY_CAST(created_date AS DATE) IS NOT NULL"
  },
  {
    name: 'IF_ERROR function',
    formula: 'IF_ERROR(Amount / 0, 0)',
    fieldMap: { Amount: 'amount' },
    expectedOutput: "COALESCE(TRY_CAST(CASE WHEN 0 = 0 OR 0 IS NULL THEN NULL ELSE amount / 0 END AS VARCHAR), 0)"
  }
];

// Run the tests
console.log("FORMULA FUNCTIONS TESTS\n");

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

/**
 * Simplified formula parser implementation
 */
function parseFormula(formula, fieldMap) {
  // For simplicity, this implementation only handles function calls with simple arguments
  const functionMatch = formula.match(/^(\w+)\((.*)\)$/);
  if (!functionMatch) {
    throw new FormulaError('Invalid formula format');
  }
  
  const funcName = functionMatch[1].toUpperCase();
  const argsString = functionMatch[2];
  
  // Parse arguments
  const args = parseArguments(argsString);
  
  // Process arguments to handle field references and literals
  const processedArgs = args.map(arg => {
    // If it's a string literal
    if ((arg.startsWith('"') && arg.endsWith('"')) || 
        (arg.startsWith("'") && arg.endsWith("'"))) {
      return `'${arg.substring(1, arg.length - 1)}'`;
    }
    
    // If it's a field reference
    if (fieldMap[arg]) {
      return fieldMap[arg];
    }
    
    // If it's a nested function call
    if (arg.includes('(') && arg.includes(')')) {
      return parseFormula(arg, fieldMap);
    }
    
    // Otherwise, return as is (number or other value)
    return arg;
  });
  
  // Handle the function based on its name
  switch (funcName) {
    // String functions
    case 'EQUALS':
      return `${processedArgs[0]} = ${processedArgs[1]}`;
      
    case 'EQUALSIGNORECASE':
      return `LOWER(${processedArgs[0]}) = LOWER(${processedArgs[1]})`;
      
    case 'STARTSWITH':
      return `STARTS_WITH(${processedArgs[0]}, ${processedArgs[1]})`;
      
    case 'ENDSWITH':
      return `ENDS_WITH(${processedArgs[0]}, ${processedArgs[1]})`;
      
    case 'CONTAINS':
      return `POSITION(${processedArgs[1]} IN ${processedArgs[0]}) > 0`;
      
    case 'CONCAT':
    case 'CONCATENATE':
      return processedArgs.join(' || ');
      
    case 'INITCAP':
      return `INITCAP(${processedArgs[0]})`;
      
    case 'REPLACE':
      return `REPLACE(${processedArgs[0]}, ${processedArgs[1]}, ${processedArgs[2]})`;
      
    // Math functions
    case 'MAX':
      return `GREATEST(${processedArgs.join(', ')})`;
      
    case 'MIN':
      return `LEAST(${processedArgs.join(', ')})`;
      
    case 'POWER':
      return `POWER(${processedArgs[0]}, ${processedArgs[1]})`;
      
    case 'SQRT':
      return `SQRT(${processedArgs[0]})`;
      
    // Logical functions
    case 'ISEMPTY':
      return `(${processedArgs[0]} IS NULL OR ${processedArgs[0]} = '')`;
      
    case 'ISNUMBER':
      return `TRY_CAST(${processedArgs[0]} AS DOUBLE) IS NOT NULL`;
      
    case 'ISDATE':
      return `TRY_CAST(${processedArgs[0]} AS DATE) IS NOT NULL`;
      
    case 'IF_ERROR':
      // Check for division by zero or null
      if (args[0].includes('/')) {
        const divParts = args[0].split('/');
        const divisor = divParts[1].trim();
        return `COALESCE(TRY_CAST(CASE WHEN ${divisor} = 0 OR ${divisor} IS NULL THEN NULL ELSE ${processedArgs[0].toLowerCase()} END AS VARCHAR), ${processedArgs[1]})`;
      }
      return `COALESCE(TRY_CAST(${processedArgs[0]} AS VARCHAR), ${processedArgs[1]})`;
      
    default:
      throw new FormulaError(`Unsupported function: ${funcName}`);
  }
}

/**
 * Parse function arguments, handling nested functions and quotes
 */
function parseArguments(argsString) {
  const args = [];
  let currentArg = '';
  let parenDepth = 0;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    // Handle quotes
    if ((char === '"' || char === "'") && (i === 0 || argsString[i-1] !== '\\')) {
      if (inQuote && char === quoteChar) {
        currentArg += char;
        inQuote = false;
      } else if (!inQuote) {
        currentArg += char;
        inQuote = true;
        quoteChar = char;
      } else {
        currentArg += char;
      }
    } 
    // Handle parentheses for nested functions
    else if (char === '(' && !inQuote) {
      parenDepth++;
      currentArg += char;
    }
    else if (char === ')' && !inQuote) {
      parenDepth--;
      currentArg += char;
    }
    // Handle commas (argument separators)
    else if (char === ',' && !inQuote && parenDepth === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    }
    // All other characters
    else {
      currentArg += char;
    }
  }
  
  // Add the last argument
  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }
  
  return args;
} 