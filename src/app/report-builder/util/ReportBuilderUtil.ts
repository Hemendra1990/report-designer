// Sample formula functions
export const formulaFunctions = [
    {
      category: "Text",
      functions: [
        { name: "CONCATENATE", description: "Joins text values into one string" },
        { name: "LEFT", description: "Returns the specified number of characters from the start of a text string" },
        { name: "RIGHT", description: "Returns the specified number of characters from the end of a text string" },
        { name: "MID", description: "Returns characters from the middle of a text string" },
        { name: "FIND", description: "Returns the position of a text string within another text string" },
        { name: "LEN", description: "Returns the number of characters in a text string" },
        { name: "LOWER", description: "Converts all characters to lowercase" },
        { name: "UPPER", description: "Converts all characters to uppercase" },
        { name: "TRIM", description: "Removes spaces from both ends of a text string" },
      ]
    },
    {
      category: "Date & Time",
      functions: [
        { name: "DATE", description: "Returns a date value from year, month, and day values" },
        { name: "DATEVALUE", description: "Converts a text date to a date value" },
        { name: "DAY", description: "Returns the day of the month (1-31)" },
        { name: "MONTH", description: "Returns the month (1-12)" },
        { name: "YEAR", description: "Returns the year as a four-digit number" },
        { name: "NOW", description: "Returns the current date and time" },
        { name: "TODAY", description: "Returns the current date" },
      ]
    },
    {
category: "Math",
functions: [
        { name: "ABS", description: "Returns the absolute value of a number" },
        { name: "CEILING", description: "Rounds a number up to the nearest multiple of specified value" },
        { name: "FLOOR", description: "Rounds a number down to the nearest multiple of specified value" },
        { name: "ROUND", description: "Rounds a number to a specified number of digits" },
        { name: "MAX", description: "Returns the maximum value from list of numbers" },
        { name: "MIN", description: "Returns the minimum value from list of numbers" },
        { name: "MOD", description: "Returns the remainder after a number is divided by a divisor" },
        { name: "POWER", description: "Returns a number raised to a power" },
        { name: "SQRT", description: "Returns the square root of a number" },
        { name: "SUM", description: "Adds all the numbers in a range of cells" },
      ]
    },
    {
      category: "Logical",
      functions: [
        { name: "AND", description: "Returns TRUE if all arguments are TRUE" },
        { name: "OR", description: "Returns TRUE if any argument is TRUE" },
        { name: "NOT", description: "Reverses the logical value of its argument" },
        { name: "IF", description: "Returns one value if a condition is TRUE and another value if FALSE" },
        { name: "ISBLANK", description: "Returns TRUE if the value is blank" },
        { name: "ISNUMBER", description: "Returns TRUE if the value is a number" },
        { name: "ISTEXT", description: "Returns TRUE if the value is text" },
      ]
    },
    {
      category: "String Functions",
      functions: [
        { name: "CHARAT", description: "Returns the character at the specified index." },
        { name: "CHARCODEAT", description: "Returns the Unicode of the character at the specified index." },
        { name: "CONCAT", description: "Joins two or more strings." },
        { name: "INCLUDES", description: "Checks if a string contains a specified value." },
        { name: "INDEXOF", description: "Returns the index of the first occurrence of a specified value." },
        { name: "LASTINDEXOF", description: "Returns the index of the last occurrence of a specified value." },
        { name: "MATCH", description: "Searches a string for a match against a regular expression and returns the matches." },
        { name: "PADEND", description: "Pads the current string with a specified string at the end." },
        { name: "PADSTART", description: "Pads the current string with a specified string at the start." },
        { name: "REPEAT", description: "Returns a new string with a specified number of copies of the original string." },
        { name: "REPLACE", description: "Searches a string for a specified value or regular expression and returns a new string with the replacements." },
        { name: "REPLACEALL", description: "Replaces all occurrences of a specified value or regular expression." },
        { name: "SEARCH", description: "Searches a string for a specified value or regular expression and returns the position of the match." },
        { name: "SLICE", description: "Extracts a section of a string and returns it as a new string." },
        { name: "SPLIT", description: "Splits a string into an array of substrings." },
        { name: "STARTSWITH", description: "Checks if a string starts with a specified value." },
        { name: "SUBSTRING", description: "Extracts characters from a string between two specified indices." },
        { name: "TOLOWERCASE", description: "Converts a string to lowercase letters." },
        { name: "TOUPPERCASE", description: "Converts a string to uppercase letters." },
        { name: "TRIM", description: "Removes whitespace from both ends of a string." },
        { name: "TRIMSTART", description: "Removes whitespace from the beginning of a string." },
        { name: "TRIMEND", description: "Removes whitespace from the end of a string." }
      ]
    }
];

