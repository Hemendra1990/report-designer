/**
 * FormulaTranslatorTest.ts
 * 
 * Test cases for the FormulaTranslator.
 */
import { translateFormulaToDuckDBSQL } from './FormulaTranslator';

// Sample field mapping
const fieldMap: Record<string, string> = {
  "First Name": "first_name",
  "Last Name": "last_name",
  "Email": "email",
  "Amount": "amount",
  "CreatedDate": "created_date",
  "Status": "status",
  "Account": "account_name",
  "Industry": "industry",
  "Priority": "priority",
  "Due Date": "due_date",
  "Is Active": "is_active",
  "Last Modified Date": "last_modified_date",
  "Owner": "owner_name",
  "Account Number": "account_number",
  "Description": "description"
};

// Test and demonstrate the formula translator
function runTests() {
  const testCases = [
    // Simple field references
    {
      formula: '[First Name]',
      expected: 'first_name'
    },
    {
      formula: '[First Name] + " " + [Last Name]',
      expected: '(first_name || \' \' || last_name)'
    },
    
    // Math operations with proper precedence
    {
      formula: '[Amount] * 1.1',
      expected: '(amount * 1.1)'
    },
    {
      formula: '[Amount] + 100 * 0.05',
      expected: '(amount + (100 * 0.05))'
    },
    {
      formula: '([Amount] + 100) * 0.05',
      expected: '((amount + 100) * 0.05)'
    },
    
    // Division by zero protection
    {
      formula: '[Amount] / 0',
      expected: 'CASE WHEN 0 = 0 OR 0 IS NULL THEN NULL ELSE amount / 0 END'
    },
    {
      formula: '[Amount] / [Account Number]',
      expected: 'CASE WHEN account_number = 0 OR account_number IS NULL THEN NULL ELSE amount / account_number END'
    },
    
    // Logical functions
    {
      formula: 'IF([Amount] > 1000, "High Value", "Standard")',
      expected: 'CASE WHEN (amount > 1000) THEN \'High Value\' ELSE \'Standard\' END'
    },
    {
      formula: 'IF(AND([Amount] > 1000, [Priority] = "High"), "Urgent", "Normal")',
      expected: 'CASE WHEN ((amount > 1000) AND (priority = \'High\')) THEN \'Urgent\' ELSE \'Normal\' END'
    },
    {
      formula: 'CASE([Status], "Open", "In Progress", "Closed", "Complete", "Unknown")',
      expected: 'CASE status WHEN \'Open\' THEN \'In Progress\' WHEN \'Closed\' THEN \'Complete\' ELSE \'Unknown\' END'
    },
    {
      formula: 'ISBLANK([Description])',
      expected: '(description IS NULL OR description = \'\')'
    },
    {
      formula: 'BLANKVALUE([Description], "No description provided")',
      expected: 'COALESCE(NULLIF(description, \'\'), \'No description provided\')'
    },
    
    // Text functions
    {
      formula: 'UPPER([First Name])',
      expected: 'UPPER(first_name)'
    },
    {
      formula: 'LOWER([Last Name])',
      expected: 'LOWER(last_name)'
    },
    {
      formula: 'LEN([Description])',
      expected: 'LENGTH(description)'
    },
    {
      formula: 'LEFT([Account], 3)',
      expected: 'LEFT(account_name, 3)'
    },
    {
      formula: 'RIGHT([Email], 4)',
      expected: 'RIGHT(email, 4)'
    },
    {
      formula: 'MID([Description], 5, 10)',
      expected: 'SUBSTRING(description, 5, 10)'
    },
    {
      formula: 'FIND("@", [Email])',
      expected: 'POSITION(\'@\' IN email)'
    },
    {
      formula: 'SUBSTITUTE([Description], "old", "new")',
      expected: 'REPLACE(description, \'old\', \'new\')'
    },
    {
      formula: 'CONTAINS([Email], "@example.com")',
      expected: 'POSITION(\'@example.com\' IN email) > 0'
    },
    {
      formula: 'BEGINS([Email], "info")',
      expected: 'STARTS_WITH(email, \'info\')'
    },
    {
      formula: 'TRIM([Description])',
      expected: 'TRIM(description)'
    },
    
    // Date/Time functions
    {
      formula: 'TODAY()',
      expected: 'CURRENT_DATE'
    },
    {
      formula: 'NOW()',
      expected: 'CURRENT_TIMESTAMP'
    },
    {
      formula: 'YEAR([CreatedDate])',
      expected: 'EXTRACT(YEAR FROM created_date)'
    },
    {
      formula: 'MONTH([CreatedDate])',
      expected: 'EXTRACT(MONTH FROM created_date)'
    },
    {
      formula: 'DAY([CreatedDate])',
      expected: 'EXTRACT(DAY FROM created_date)'
    },
    {
      formula: 'DATEVALUE("2023-01-15")',
      expected: 'CAST(\'2023-01-15\' AS DATE)'
    },
    {
      formula: 'DATEADD("day", 7, [Due Date])',
      expected: 'DATEADD(\'day\', 7, due_date)'
    },
    {
      formula: 'DATEDIFF("day", [CreatedDate], [Due Date])',
      expected: 'DATEDIFF(\'day\', created_date, due_date)'
    },
    
    // Math functions
    {
      formula: 'ROUND([Amount], 2)',
      expected: 'ROUND(amount, 2)'
    },
    {
      formula: 'FLOOR([Amount])',
      expected: 'FLOOR(amount)'
    },
    {
      formula: 'CEILING([Amount])',
      expected: 'CEILING(amount)'
    },
    
    // Complex examples
    {
      formula: 'IF(CONTAINS([Email], "@example.com") AND [Amount] > 5000, "Key Account", "Standard Account")',
      expected: 'CASE WHEN ((POSITION(\'@example.com\' IN email) > 0) AND (amount > 5000)) THEN \'Key Account\' ELSE \'Standard Account\' END'
    },
    {
      formula: 'UPPER(LEFT([First Name], 1)) + LOWER(RIGHT([First Name], LEN([First Name]) - 1))',
      expected: '(UPPER(LEFT(first_name, 1)) || LOWER(RIGHT(first_name, (LENGTH(first_name) - 1))))'
    },
    {
      formula: 'CASE([Industry], "Technology", 0.15, "Healthcare", 0.12, "Finance", 0.08, 0.05) * [Amount]',
      expected: '(CASE industry WHEN \'Technology\' THEN 0.15 WHEN \'Healthcare\' THEN 0.12 WHEN \'Finance\' THEN 0.08 ELSE 0.05 END * amount)'
    },
    {
      formula: 'IF(ISBLANK([Description]), "No description", LEFT([Description], 50) + "...")',
      expected: 'CASE WHEN (description IS NULL OR description = \'\') THEN \'No description\' ELSE (LEFT(description, 50) || \'...\') END'
    },
    {
      formula: 'IF(DATEDIFF("day", TODAY(), [Due Date]) < 0, "Overdue", IF(DATEDIFF("day", TODAY(), [Due Date]) <= 7, "Due Soon", "On Track"))',
      expected: 'CASE WHEN (DATEDIFF(\'day\', CURRENT_DATE, due_date) < 0) THEN \'Overdue\' ELSE CASE WHEN (DATEDIFF(\'day\', CURRENT_DATE, due_date) <= 7) THEN \'Due Soon\' ELSE \'On Track\' END END'
    },
    // New tests for field references without square brackets
    {
      formula: 'First Name',
      expected: 'first_name'
    },
    {
      formula: 'First Name + " " + Last Name',
      expected: '(first_name || \' \' || last_name)'
    },
    {
      formula: 'Amount * 1.1',
      expected: '(amount * 1.1)'
    },
    {
      formula: 'IF(Amount > 1000, "High Value", "Standard")',
      expected: 'CASE WHEN (amount > 1000) THEN \'High Value\' ELSE \'Standard\' END'
    },
    {
      formula: 'UPPER(First Name)',
      expected: 'UPPER(first_name)'
    },
    {
      formula: 'YEAR(CreatedDate)',
      expected: 'EXTRACT(YEAR FROM created_date)'
    },
    {
      formula: 'IF(AND(Amount > 1000, Priority = "High"), "Urgent", "Normal")',
      expected: 'CASE WHEN ((amount > 1000) AND (priority = \'High\')) THEN \'Urgent\' ELSE \'Normal\' END'
    },
    {
      formula: 'CASE(Industry, "Technology", 0.15, "Healthcare", 0.12, "Finance", 0.08, 0.05) * Amount',
      expected: '(CASE industry WHEN \'Technology\' THEN 0.15 WHEN \'Healthcare\' THEN 0.12 WHEN \'Finance\' THEN 0.08 ELSE 0.05 END * amount)'
    },
    // Tests for multi-word field names without brackets
    {
      formula: 'Account Number + " | " + Account',
      expected: '(account_number || \' | \' || account_name)'
    },
    {
      formula: 'Last Modified Date > TODAY()',
      expected: '(last_modified_date > CURRENT_DATE)'
    },
    // Mixed format tests (some fields with brackets, some without)
    {
      formula: 'Amount > 1000 AND [Status] = "Active"',
      expected: '((amount > 1000) AND (status = \'Active\'))'
    },
    {
      formula: 'IF(ISBLANK(Description), "No description", LEFT([Description], 50) + "...")',
      expected: 'CASE WHEN (description IS NULL OR description = \'\') THEN \'No description\' ELSE (LEFT(description, 50) || \'...\') END'
    }
  ];

  let passCount = 0;
  const failedTests: Array<{formula: string, expected: string, actual: string}> = [];

  console.log('Running Formula Translator Tests:');
  console.log('--------------------------------');

  testCases.forEach((test, index) => {
    const actual = translateFormulaToDuckDBSQL(test.formula, fieldMap);
    
    if (actual === test.expected) {
      passCount++;
      console.log(`✅ Test ${index + 1} passed`);
    } else {
      failedTests.push({
        formula: test.formula,
        expected: test.expected,
        actual: actual
      });
      console.log(`❌ Test ${index + 1} failed`);
    }
  });

  console.log('--------------------------------');
  console.log(`Results: ${passCount}/${testCases.length} tests passed`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach((test, index) => {
      console.log(`\nTest #${index + 1}:`);
      console.log(`Formula: ${test.formula}`);
      console.log(`Expected: ${test.expected}`);
      console.log(`Actual:   ${test.actual}`);
    });
  }
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).runFormulaTranslatorTests = runTests;
  console.log('Formula Translator test function available as window.runFormulaTranslatorTests()');
} else {
  // Node.js environment
  runTests();
}

export { runTests }; 