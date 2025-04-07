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
    }
];

