// Test for the newly added string functions

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormulaError';
  }
}

// Our test cases
const tests = [
  {
    name: 'CHARAT function',
    formula: 'CHARAT("Hello", 1)',
    fieldMap: {},
    expectedOutput: "SUBSTRING('Hello', 1, 1)"
  },
  {
    name: 'CHARCODEAT function',
    formula: 'CHARCODEAT("Hello", 1)',
    fieldMap: {},
    expectedOutput: "ASCII(SUBSTRING('Hello', 1, 1))"
  },
  {
    name: 'INCLUDES function',
    formula: 'INCLUDES(Description, "important")',
    fieldMap: { Description: 'description' },
    expectedOutput: "POSITION('important' IN description) > 0"
  },
  {
    name: 'INDEXOF function',
    formula: 'INDEXOF("Hello world", "world")',
    fieldMap: {},
    expectedOutput: "(POSITION('world' IN 'Hello world') - 1)"
  },
  {
    name: 'INDEXOF function with position',
    formula: 'INDEXOF("Hello world world", "world", 7)',
    fieldMap: {},
    expectedOutput: "(POSITION('world' IN SUBSTRING('Hello world world', 7 + 1)) + 7)"
  },
  {
    name: 'LASTINDEXOF function',
    formula: 'LASTINDEXOF("Hello world world", "world")',
    fieldMap: {},
    expectedOutput: "(LENGTH('Hello world world') - POSITION(REVERSE('world') IN REVERSE('Hello world world')) - LENGTH('world') + 1)"
  },
  {
    name: 'PADSTART function',
    formula: 'PADSTART("123", 5, "0")',
    fieldMap: {},
    expectedOutput: "LPAD('123', 5, '0')"
  },
  {
    name: 'PADEND function',
    formula: 'PADEND("123", 5, "0")',
    fieldMap: {},
    expectedOutput: "RPAD('123', 5, '0')"
  },
  {
    name: 'REPLACEALL function',
    formula: 'REPLACEALL("Hello world", "l", "L")',
    fieldMap: {},
    expectedOutput: "REGEXP_REPLACE('Hello world', 'l', 'L', 'g')"
  },
  {
    name: 'SEARCH function',
    formula: 'SEARCH("Hello world", "world")',
    fieldMap: {},
    expectedOutput: "POSITION('world' IN 'Hello world')"
  },
  {
    name: 'SLICE function with start only',
    formula: 'SLICE("Hello world", 6)',
    fieldMap: {},
    expectedOutput: "SUBSTRING('Hello world', 6 + 1)"
  },
  {
    name: 'SLICE function with start and end',
    formula: 'SLICE("Hello world", 0, 5)',
    fieldMap: {},
    expectedOutput: "SUBSTRING('Hello world', 0 + 1, 5 - 0)"
  },
  {
    name: 'SPLIT function',
    formula: 'SPLIT("Hello,world", ",")',
    fieldMap: {},
    expectedOutput: "STRING_SPLIT('Hello,world', ',')"
  },
  {
    name: 'SUBSTRING function with start only',
    formula: 'SUBSTRING("Hello world", 6)',
    fieldMap: {},
    expectedOutput: "SUBSTRING('Hello world', 6 + 1)"
  },
  {
    name: 'SUBSTRING function with start and length',
    formula: 'SUBSTRING("Hello world", 0, 5)',
    fieldMap: {},
    expectedOutput: "SUBSTRING('Hello world', 0 + 1, 5)"
  },
  {
    name: 'TOLOWERCASE function',
    formula: 'TOLOWERCASE("Hello World")',
    fieldMap: {},
    expectedOutput: "LOWER('Hello World')"
  },
  {
    name: 'TOUPPERCASE function',
    formula: 'TOUPPERCASE("Hello World")',
    fieldMap: {},
    expectedOutput: "UPPER('Hello World')"
  },
  {
    name: 'TRIMSTART function',
    formula: 'TRIMSTART("  Hello World  ")',
    fieldMap: {},
    expectedOutput: "LTRIM('  Hello World  ')"
  },
  {
    name: 'TRIMEND function',
    formula: 'TRIMEND("  Hello World  ")',
    fieldMap: {},
    expectedOutput: "RTRIM('  Hello World  ')"
  }
];

// Run the tests
console.log("NEW STRING FUNCTIONS TESTS\n");

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
    case 'CHARAT':
      if (args.length !== 2) {
        throw new FormulaError('CHARAT() requires exactly 2 arguments: string, position');
      }
      return `SUBSTRING(${processedArgs[0]}, ${processedArgs[1]}, 1)`;
      
    case 'CHARCODEAT':
      if (args.length !== 2) {
        throw new FormulaError('CHARCODEAT() requires exactly 2 arguments: string, position');
      }
      return `ASCII(SUBSTRING(${processedArgs[0]}, ${processedArgs[1]}, 1))`;
      
    case 'INCLUDES':
      if (args.length !== 2) {
        throw new FormulaError('INCLUDES() requires exactly 2 arguments: string, searchString');
      }
      return `POSITION(${processedArgs[1]} IN ${processedArgs[0]}) > 0`;
      
    case 'INDEXOF':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('INDEXOF() requires 2 or 3 arguments: string, searchString, [position]');
      }
      if (args.length === 2) {
        return `(POSITION(${processedArgs[1]} IN ${processedArgs[0]}) - 1)`;
      }
      return `(POSITION(${processedArgs[1]} IN SUBSTRING(${processedArgs[0]}, ${processedArgs[2]} + 1)) + ${processedArgs[2]})`;
      
    case 'LASTINDEXOF':
      if (args.length !== 2) {
        throw new FormulaError('LASTINDEXOF() requires exactly 2 arguments: string, searchString');
      }
      return `(LENGTH(${processedArgs[0]}) - POSITION(REVERSE(${processedArgs[1]}) IN REVERSE(${processedArgs[0]})) - LENGTH(${processedArgs[1]}) + 1)`;
      
    case 'MATCH':
      if (args.length !== 2) {
        throw new FormulaError('MATCH() requires exactly 2 arguments: string, regex');
      }
      return `REGEXP_MATCHES(${processedArgs[0]}, ${processedArgs[1]})`;

    case 'PADSTART':
      if (args.length !== 3) {
        throw new FormulaError('PADSTART() requires exactly 3 arguments: string, targetLength, padString');
      }
      return `LPAD(${processedArgs[0]}, ${processedArgs[1]}, ${processedArgs[2]})`;
      
    case 'PADEND':
      if (args.length !== 3) {
        throw new FormulaError('PADEND() requires exactly 3 arguments: string, targetLength, padString');
      }
      return `RPAD(${processedArgs[0]}, ${processedArgs[1]}, ${processedArgs[2]})`;
      
    case 'REPLACEALL':
      if (args.length !== 3) {
        throw new FormulaError('REPLACEALL() requires exactly 3 arguments: string, pattern, replacement');
      }
      return `REGEXP_REPLACE(${processedArgs[0]}, ${processedArgs[1]}, ${processedArgs[2]}, 'g')`;
      
    case 'SEARCH':
      if (args.length !== 2) {
        throw new FormulaError('SEARCH() requires exactly 2 arguments: string, searchValue');
      }
      return `POSITION(${processedArgs[1]} IN ${processedArgs[0]})`;
      
    case 'SLICE':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('SLICE() requires 2 or 3 arguments: string, startIndex, [endIndex]');
      }
      if (args.length === 2) {
        return `SUBSTRING(${processedArgs[0]}, ${processedArgs[1]} + 1)`;
      }
      return `SUBSTRING(${processedArgs[0]}, ${processedArgs[1]} + 1, ${processedArgs[2]} - ${processedArgs[1]})`;
      
    case 'SPLIT':
      if (args.length !== 2) {
        throw new FormulaError('SPLIT() requires exactly 2 arguments: string, separator');
      }
      return `STRING_SPLIT(${processedArgs[0]}, ${processedArgs[1]})`;
      
    case 'SUBSTRING':
      if (args.length !== 2 && args.length !== 3) {
        throw new FormulaError('SUBSTRING() requires 2 or 3 arguments: string, startIndex, [length]');
      }
      if (args.length === 2) {
        return `SUBSTRING(${processedArgs[0]}, ${processedArgs[1]} + 1)`;
      }
      return `SUBSTRING(${processedArgs[0]}, ${processedArgs[1]} + 1, ${processedArgs[2]})`;
      
    case 'TOLOWERCASE':
      if (args.length !== 1) {
        throw new FormulaError('TOLOWERCASE() requires exactly 1 argument');
      }
      return `LOWER(${processedArgs[0]})`;
      
    case 'TOUPPERCASE':
      if (args.length !== 1) {
        throw new FormulaError('TOUPPERCASE() requires exactly 1 argument');
      }
      return `UPPER(${processedArgs[0]})`;
      
    case 'TRIMSTART':
      if (args.length !== 1) {
        throw new FormulaError('TRIMSTART() requires exactly 1 argument');
      }
      return `LTRIM(${processedArgs[0]})`;
      
    case 'TRIMEND':
      if (args.length !== 1) {
        throw new FormulaError('TRIMEND() requires exactly 1 argument');
      }
      return `RTRIM(${processedArgs[0]})`;
      
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