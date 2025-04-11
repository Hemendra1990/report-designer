// Basic test for formula == operator issue

// Test the formula: IF(rating == 'hot', 50, 10)
function testFormula() {
  const formula = "IF(rating == 'hot', 50, 10)";
  const fieldMap = { rating: 'rating' };
  
  try {
    const result = translateFormula(formula, fieldMap);
    console.log('Formula:', formula);
    console.log('Result:', result);
    console.log('Expected: CASE WHEN rating = \'hot\' THEN 50 ELSE 10 END');
    console.log('Success:', result === "CASE WHEN rating = 'hot' THEN 50 ELSE 10 END");
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Simplified formula translator that handles == operator
function translateFormula(formula, fieldMap) {
  const context = {
    formula,
    index: 0,
    fieldMap
  };
  
  return parseExpression(context);
}

// Parse an expression
function parseExpression(context) {
  return parseIf(context);
}

// Parse IF function
function parseIf(context) {
  // Skip "IF"
  context.index += 2;
  
  // Skip the opening parenthesis
  while (context.index < context.formula.length && context.formula[context.index] !== '(') {
    context.index++;
  }
  context.index++; // Skip '('
  
  // Parse the condition (rating == 'hot')
  const condition = parseCondition(context);
  
  // Skip the comma after condition
  while (context.index < context.formula.length && context.formula[context.index] !== ',') {
    context.index++;
  }
  context.index++; // Skip ','
  
  // Skip whitespace
  while (context.index < context.formula.length && /\s/.test(context.formula[context.index])) {
    context.index++;
  }
  
  // Parse the true value (50)
  let trueValue = '';
  while (context.index < context.formula.length && context.formula[context.index] !== ',') {
    trueValue += context.formula[context.index];
    context.index++;
  }
  trueValue = trueValue.trim();
  
  // Skip the comma after true value
  context.index++; // Skip ','
  
  // Skip whitespace
  while (context.index < context.formula.length && /\s/.test(context.formula[context.index])) {
    context.index++;
  }
  
  // Parse the false value (10)
  let falseValue = '';
  while (context.index < context.formula.length && context.formula[context.index] !== ')') {
    falseValue += context.formula[context.index];
    context.index++;
  }
  falseValue = falseValue.trim();
  
  return `CASE WHEN ${condition} THEN ${trueValue} ELSE ${falseValue} END`;
}

// Parse condition (rating == 'hot')
function parseCondition(context) {
  // Parse the left side of the condition
  let left = '';
  while (
    context.index < context.formula.length && 
    !/[\s=<>!]/.test(context.formula[context.index])
  ) {
    left += context.formula[context.index];
    context.index++;
  }
  left = left.trim();
  
  // Replace with the field name from the map if it exists
  if (context.fieldMap[left]) {
    left = context.fieldMap[left];
  }
  
  // Skip whitespace
  while (context.index < context.formula.length && /\s/.test(context.formula[context.index])) {
    context.index++;
  }
  
  // Check for == operator
  if (context.index < context.formula.length - 1 && 
      context.formula[context.index] === '=' && 
      context.formula[context.index + 1] === '=') {
    context.index += 2; // Skip '=='
  } else {
    throw new Error('Expected == operator');
  }
  
  // Skip whitespace
  while (context.index < context.formula.length && /\s/.test(context.formula[context.index])) {
    context.index++;
  }
  
  // Parse the right side of the condition (string literal 'hot')
  let right = '';
  const quote = context.formula[context.index];
  if (quote === "'" || quote === '"') {
    context.index++; // Skip opening quote
    
    while (
      context.index < context.formula.length && 
      context.formula[context.index] !== quote
    ) {
      right += context.formula[context.index];
      context.index++;
    }
    
    context.index++; // Skip closing quote
    right = `'${right}'`;
  } else {
    // Handle non-string values
    while (
      context.index < context.formula.length && 
      !/[\s,)]/.test(context.formula[context.index])
    ) {
      right += context.formula[context.index];
      context.index++;
    }
  }
  
  // Return the SQL condition
  return `${left} = ${right}`;
}

// Run the test
testFormula(); 