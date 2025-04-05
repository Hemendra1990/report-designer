"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Sample Account fields with type indicators
const accountFields = [
  { id: "account_owner", name: "Account Owner", category: "general", type: "user", icon: "A" },
  { id: "created_by", name: "Created By", category: "general", type: "user", icon: "A" },
  { id: "account_name", name: "Account Name", category: "general", type: "text", icon: "A" },
  { id: "account_number", name: "Account Number", category: "general", type: "number", icon: "#" },
  { id: "type", name: "Type", category: "general", type: "picklist", icon: "A" },
  { id: "industry", name: "Industry", category: "general", type: "picklist", icon: "A" },
  { id: "annual_revenue", name: "Annual Revenue", category: "general", type: "currency", icon: "#" },
  { id: "rating", name: "Rating", category: "general", type: "picklist", icon: "A" },
  { id: "phone", name: "Phone", category: "general", type: "phone", icon: "A" },
  { id: "billing_street", name: "Billing Street", category: "address", type: "text", icon: "A" },
  { id: "billing_city", name: "Billing City", category: "address", type: "text", icon: "A" },
  { id: "billing_state", name: "Billing State/Province", category: "address", type: "text", icon: "A" },
  { id: "billing_postal_code", name: "Billing Postal Code", category: "address", type: "text", icon: "A" },
  { id: "billing_country", name: "Billing Country", category: "address", type: "text", icon: "A" },
  { id: "shipping_street", name: "Shipping Street", category: "address", type: "text", icon: "A" },
  { id: "shipping_city", name: "Shipping City", category: "address", type: "text", icon: "A" },
  { id: "shipping_state", name: "Shipping State/Province", category: "address", type: "text", icon: "A" },
  { id: "shipping_postal_code", name: "Shipping Postal Code", category: "address", type: "text", icon: "A" },
  { id: "shipping_country", name: "Shipping Country", category: "address", type: "text", icon: "A" },
  { id: "website", name: "Website", category: "general", type: "url", icon: "A" },
  { id: "description", name: "Description", category: "general", type: "textarea", icon: "A" },
  { id: "employees", name: "Employees", category: "general", type: "number", icon: "#" },
  { id: "ownership", name: "Ownership", category: "general", type: "picklist", icon: "A" },
  { id: "parent_account", name: "Parent Account", category: "general", type: "lookup", icon: "A" },
  { id: "created_date", name: "Created Date", category: "system", type: "datetime", icon: "A" },
  { id: "last_modified_date", name: "Last Modified Date", category: "system", type: "datetime", icon: "A" },
  { id: "last_activity", name: "Last Activity", category: "system", type: "datetime", icon: "A" },
  { id: "sic_code", name: "SIC Code", category: "general", type: "text", icon: "A" },
  { id: "account_source", name: "Account Source", category: "general", type: "picklist", icon: "A" },
  { id: "customer_priority", name: "Customer Priority", category: "general", type: "picklist", icon: "A" },
  { id: "active", name: "Active", category: "general", type: "checkbox", icon: "A" },
  { id: "sla", name: "SLA", category: "general", type: "picklist", icon: "A" },
  { id: "sla_expiration_date", name: "SLA Expiration Date", category: "general", type: "date", icon: "A" },
  { id: "sla_serial_number", name: "SLA Serial Number", category: "general", type: "text", icon: "A" },
  { id: "number_of_locations", name: "Number of Locations", category: "general", type: "number", icon: "#" },
  { id: "upsell_opportunity", name: "Upsell Opportunity", category: "general", type: "picklist", icon: "A" },
  { id: "last_viewed_date", name: "Last Viewed Date", category: "system", type: "datetime", icon: "A" },
];

// Sample formula functions
const formulaFunctions = [
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

// Group fields by category
const fieldsByCategory = accountFields.reduce((acc, field) => {
  acc[field.category] = acc[field.category] || [];
  acc[field.category].push(field);
  return acc;
}, {} as Record<string, typeof accountFields>);

// Sample selected columns for the report
const initialSelectedColumns = [
  { id: "last_activity", name: "Last Activity", type: "datetime" },
  { id: "account_owner", name: "Account Owner", type: "user" },
  { id: "account_name", name: "Account Name", type: "text" },
  { id: "billing_state", name: "Billing State/Province", type: "text" },
  { id: "type", name: "Type", type: "picklist" },
  { id: "rating", name: "Rating", type: "picklist" },
  { id: "last_modified_date", name: "Last Modified Date", type: "datetime" },
];

// Drag and drop helper function
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function ReportBuilderPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formulaSearchTerm, setFormulaSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(initialSelectedColumns);
  const [expandedCategories, setExpandedCategories] = useState({
    general: true,
    address: false,
    system: false,
  });
  
  // Context menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  // Dragging state
  const [draggedItem, setDraggedItem] = useState<null | number>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Reference for click outside menu
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Initialize column refs
  useEffect(() => {
    columnRefs.current = columnRefs.current.slice(0, selectedColumns.length);
  }, [selectedColumns]);
  
  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter fields based on search term
  const filteredFields = searchTerm.trim() === "" 
    ? accountFields 
    : accountFields.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle adding a column to the report
  const addColumn = (field: typeof accountFields[0]) => {
    if (!selectedColumns.some(col => col.id === field.id)) {
      setSelectedColumns([...selectedColumns, { id: field.id, name: field.name, type: field.type }]);
    }
  };
  
  // Handle removing a column from the report
  const removeColumn = (fieldId: string) => {
    setSelectedColumns(selectedColumns.filter(col => col.id !== fieldId));
  };
  
  // Handle dragging start
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };
  
  // Handle dragging over another column
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;
    if (draggedItem === index) return;
    
    const newSelectedColumns = reorder(
      selectedColumns,
      draggedItem,
      index
    );
    
    setSelectedColumns(newSelectedColumns);
    setDraggedItem(index);
  };
  
  // Handle context menu for columns
  const openColumnMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
    setIsMenuOpen(true);
  };
  
  // Panel collapse state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [centerPanelCollapsed, setCenterPanelCollapsed] = useState(false);
  
  // Formula editor state
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [formulaName, setFormulaName] = useState("");
  const [formulaDescription, setFormulaDescription] = useState("");
  const [formulaEditorValue, setFormulaEditorValue] = useState("");
  const [formulaOutputType, setFormulaOutputType] = useState("number");
  const [decimalPoints, setDecimalPoints] = useState("2");
  const [formulaDialogTab, setFormulaDialogTab] = useState("fields");

  // Filter formula functions based on search term
  const filteredFunctions = formulaSearchTerm.trim() === ""
    ? formulaFunctions
    : formulaFunctions.map(category => ({
        category: category.category,
        functions: category.functions.filter(func => 
          func.name.toLowerCase().includes(formulaSearchTerm.toLowerCase()) ||
          func.description.toLowerCase().includes(formulaSearchTerm.toLowerCase())
        )
      })).filter(category => category.functions.length > 0);
  
  // Handle adding a formula column
  const addFormulaColumn = () => {
    setIsMenuOpen(false);
    setShowFormulaBuilder(true);
  };
  
  // Handle formula dialog submission
  const handleSubmitFormula = () => {
    if (!formulaName.trim()) return;
    
    // Create a new formula column
    const newFormulaColumn = {
      id: `formula_${Date.now()}`,
      name: formulaName,
      type: formulaOutputType,
      formula: formulaEditorValue,
      description: formulaDescription,
    };
    
    setSelectedColumns([...selectedColumns, newFormulaColumn]);
    setShowFormulaBuilder(false);
    
    // Reset form
    setFormulaName("");
    setFormulaDescription("");
    setFormulaEditorValue("");
    setFormulaOutputType("number");
    setDecimalPoints("2");
  };
  
  // Insert a field into the formula editor
  const insertFieldIntoFormula = (field: typeof accountFields[0]) => {
    setFormulaEditorValue(prev => `${prev}[${field.name}]`);
  };
  
  // Insert a function into the formula editor
  const insertFunctionIntoFormula = (funcName: string) => {
    setFormulaEditorValue(prev => `${prev}${funcName}()`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/next.svg" 
              alt="Report Designer Logo" 
              width={80} 
              height={20}
              className="dark:invert" 
            />
            <span className="font-bold text-lg">Report Designer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Reports</Button>
            </Link>
            <Link href="/report-types">
              <Button variant="ghost">Report Types</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="text-xs text-gray-500 uppercase font-semibold">REPORT</div>
            <div className="text-lg font-semibold">New Accounts Report</div>
          </div>
          <div className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 flex items-center gap-1">
            <Image src="/icons/account.svg" width={14} height={14} alt="Account" />
            <span>Accounts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Button>
          <Button variant="outline" size="sm" className="text-gray-400 bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 17H9" />
            </svg>
          </Button>
          <Select defaultValue="save">
            <SelectTrigger className="w-[130px] h-9 bg-sky-50 text-blue-600 border-blue-100">
              <SelectValue placeholder="Save" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="save">Save</SelectItem>
              <SelectItem value="save_as">Save As</SelectItem>
              <SelectItem value="save_copy">Save Copy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Close</Button>
          <Button size="sm" className="bg-blue-600">Run</Button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm border-b border-blue-100">
        Previewing a limited number of records. Run the report to see everything.
      </div>

      {/* Selected Filters Bar */}
      <div className="bg-white border-b border-gray-200 py-2 px-4 flex gap-3 text-xs flex-wrap">
        <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 flex items-center gap-1">
          <span className="font-medium">Last Activity</span>
          <span className="text-gray-500">equals Last 30 Days</span>
          <button className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 flex items-center gap-1">
          <span className="font-medium">Account Owner</span>
          <span className="text-gray-500">equals Current User</span>
          <button className="text-gray-400 hover:text-gray-600">×</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Fields */}
        <div className={`${leftPanelCollapsed ? 'w-12' : 'w-64'} bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300`}>
          {/* Collapse Control */}
          <div className="flex justify-end p-1">
            <button 
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={leftPanelCollapsed ? "Expand fields panel" : "Collapse fields panel"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          
          {!leftPanelCollapsed ? (
            <>
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Input 
                    className="pl-8 text-sm" 
                    placeholder="Search all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                  <div className="text-xs font-semibold text-gray-500">SUMMARY FORMULAS (0)</div>
                  <button className="text-blue-600 text-xs">Add</button>
                </div>

                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <div key={category} className="border-b border-gray-200">
                    <div 
                      className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase">
                        {category} FIELDS ({fields.length})
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    
                    {expandedCategories[category as keyof typeof expandedCategories] && (
                      <div className="pl-2">
                        {fields
                          .filter(field => 
                            !searchTerm.trim() || 
                            field.name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map(field => (
                            <div 
                              key={field.id}
                              className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer group"
                              onClick={() => addColumn(field)}
                              draggable
                              onDragStart={() => {/* Handle field drag if needed */}}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {field.icon}
                                </span>
                                <span>{field.name}</span>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-600 opacity-0 group-hover:opacity-100"
                              >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </div>
                          ))}
                        {fields.filter(field => 
                          !searchTerm.trim() || 
                          field.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 && searchTerm.trim() !== "" && (
                          <div className="p-2 text-sm text-gray-500">No matching fields found</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Collapsed view - shows only icons and minimal information
            <div className="flex flex-col items-center pt-4 space-y-4 overflow-y-auto">
              {Object.entries(fieldsByCategory).map(([category]) => (
                <div 
                  key={category}
                  className="p-2 cursor-pointer hover:bg-gray-50 rounded"
                  title={`${category.toUpperCase()} fields`}
                  onClick={() => {
                    setLeftPanelCollapsed(false);
                    setTimeout(() => toggleCategory(category), 300);
                  }}
                >
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-sm flex items-center justify-center text-xs font-medium">
                    {category.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center Panel - Report Builder */}
        <div className={`${centerPanelCollapsed ? 'w-12' : 'flex-1'} flex flex-col bg-white border-r border-gray-200 transition-all duration-300`}>
          {/* Collapse Control */}
          <div className="flex justify-end p-1">
            <button 
              onClick={() => setCenterPanelCollapsed(!centerPanelCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={centerPanelCollapsed ? "Expand builder panel" : "Collapse builder panel"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${centerPanelCollapsed ? 'rotate-180' : ''}`}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>

          {!centerPanelCollapsed ? (
            <Tabs defaultValue="outline" className="flex flex-col flex-1">
              <div className="border-b border-gray-200">
                <TabsList className="p-0 bg-transparent border-b-0">
                  <TabsTrigger 
                    value="outline" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Outline
                  </TabsTrigger>
                  <TabsTrigger 
                    value="filters" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Filters (2)
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="outline" className="flex-1 flex flex-col m-0 data-[state=active]:p-0">
                {/* Groups Section */}
                <div className="border-b border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">GROUP ROWS</div>
                  <div className="relative">
                    <Input 
                      className="pl-8 text-sm bg-gray-50" 
                      placeholder="Add group..."
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                {/* Columns Section */}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-semibold text-gray-500">COLUMNS</div>
                    <div className="relative">
                      <button 
                        className="text-sm text-blue-600 flex items-center"
                        onClick={openColumnMenu}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        Add Column
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      
                      {/* Column Menu Dropdown */}
                      {isMenuOpen && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48"
                          style={{ 
                            top: menuPosition.top - 250, 
                            left: menuPosition.left - 100,
                            position: 'fixed'
                          }}
                        >
                          <div className="py-1">
                            <button
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <path d="M3 6h18" />
                                <path d="M3 12h18" />
                                <path d="M3 18h18" />
                              </svg>
                              Add Bucket Column
                            </button>
                            <button
                              className="px-4 py-2 text-sm text-gray-400 w-full text-left flex items-center cursor-not-allowed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                              Add Summary Formula
                            </button>
                            <button
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                              onClick={addFormulaColumn}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <path d="M4 19h16" />
                                <path d="M4 14h16" />
                                <path d="M4 9h16" />
                                <path d="M4 4h16" />
                              </svg>
                              Add Row-Level Formula
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                              onClick={() => {
                                setSelectedColumns([]);
                                setIsMenuOpen(false);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              Remove All Columns
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedColumns.map((column, index) => (
                      <div 
                        key={column.id}
                        ref={el => columnRefs.current[index] = el}
                        className={`bg-white border border-gray-200 rounded p-2 flex items-center justify-between group hover:border-gray-300 shadow-sm ${draggedItem === index ? 'opacity-50 border-dashed' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={() => setDraggedItem(null)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 cursor-move">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="21" x2="3" y1="6" y2="6" />
                              <line x1="21" x2="3" y1="12" y2="12" />
                              <line x1="21" x2="3" y1="18" y2="18" />
                            </svg>
                          </span>
                          <span className="text-sm">{column.name}</span>
                          {'formula' in column && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Formula</span>
                          )}
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => removeColumn(column.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="m-0 data-[state=active]:p-4">
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium mb-2">Last Activity</h3>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="equals">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">not equals</SelectItem>
                          <SelectItem value="greater_than">greater than</SelectItem>
                          <SelectItem value="less_than">less than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="last_30_days">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="yesterday">Yesterday</SelectItem>
                          <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                          <SelectItem value="this_month">This Month</SelectItem>
                          <SelectItem value="last_month">Last Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium mb-2">Account Owner</h3>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="equals">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">not equals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="current_user">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current_user">Current User</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="role_subordinates">Role & Subordinates</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add Filter
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // Collapsed view for center panel
            <div className="flex flex-col items-center pt-4 space-y-4 overflow-hidden">
              {/* Simple icon indicators for collapsed center panel */}
              <div 
                className="p-2 cursor-pointer hover:bg-gray-50 rounded"
                title="Report columns"
                onClick={() => setCenterPanelCollapsed(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M4 19h16" />
                  <path d="M4 14h16" />
                  <path d="M4 9h16" />
                  <path d="M4 4h16" />
                </svg>
              </div>
              <div className="text-xs font-medium text-gray-500 rotate-90 mt-2 whitespace-nowrap">
                {selectedColumns.length} columns
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className={`${leftPanelCollapsed || centerPanelCollapsed ? 'flex-[2]' : 'flex-1'} bg-gray-50 flex flex-col transition-all duration-300`}>
          <div className="p-3 bg-white border-b border-gray-200 flex justify-between">
            <div className="flex items-center">
              <button 
                className="mr-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {
                  setLeftPanelCollapsed(true);
                  setCenterPanelCollapsed(true);
                }}
                title="Expand preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700">Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Update Automatically</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mx-auto mb-4 text-gray-400"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>

              <h3 className="text-lg font-medium mb-3 text-gray-700">No records returned in preview</h3>
              <p className="text-gray-500 mb-4">Try running the report or editing report filters.</p>
              
              <div className="space-y-2 text-left">
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Show All accounts.
                  </Link>
                </div>
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Set the Created Date filter to All Time.
                  </Link>
                </div>
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Edit other filters in the filter panel.
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formula Builder Panel (shown conditionally) */}
      {showFormulaBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit Row-Level Formula Column</h2>
              <button 
                onClick={() => setShowFormulaBuilder(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 text-sm text-gray-600">
              Create a custom formula to calculate values for each row in your report.
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Section: Fields & Functions */}
                <div className="md:col-span-1 border border-gray-200 rounded-md overflow-hidden">
                  <div className="border-b border-gray-200">
                    <div className="flex w-full">
                      <button 
                        onClick={() => setFormulaDialogTab("fields")}
                        className={`flex-1 px-4 py-2 text-center ${formulaDialogTab === "fields" 
                          ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium" 
                          : "bg-gray-50 text-gray-600"}`}
                      >
                        Fields
                      </button>
                      <button 
                        onClick={() => setFormulaDialogTab("functions")}
                        className={`flex-1 px-4 py-2 text-center ${formulaDialogTab === "functions" 
                          ? "bg-white border-b-2 border-blue-600 text-blue-600 font-medium" 
                          : "bg-gray-50 text-gray-600"}`}
                      >
                        Functions
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2 border-b border-gray-200">
                    <Input 
                      placeholder={formulaDialogTab === "fields" ? "Search fields..." : "Search functions..."}
                      value={formulaDialogTab === "fields" ? searchTerm : formulaSearchTerm}
                      onChange={(e) => formulaDialogTab === "fields" 
                        ? setSearchTerm(e.target.value) 
                        : setFormulaSearchTerm(e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="overflow-y-auto max-h-72">
                    {formulaDialogTab === "fields" ? (
                      // Fields Tab Content
                      <div>
                        {Object.entries(fieldsByCategory).map(([category, fields]) => (
                          <div key={category} className="border-b border-gray-200 last:border-b-0">
                            <div 
                              className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleCategory(category)}
                            >
                              <div className="text-xs font-semibold text-gray-500 uppercase">
                                {category} ({fields.length})
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </div>
                            
                            {expandedCategories[category as keyof typeof expandedCategories] && (
                              <div className="pl-2">
                                {fields
                                  .filter(field => 
                                    !searchTerm.trim() || 
                                    field.name.toLowerCase().includes(searchTerm.toLowerCase())
                                  )
                                  .map(field => (
                                    <div 
                                      key={field.id}
                                      className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                                      onClick={() => insertFieldIntoFormula(field)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                          {field.icon}
                                        </span>
                                        <span>{field.name}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Functions Tab Content
                      <div>
                        {filteredFunctions.map((category) => (
                          <div key={category.category} className="border-b border-gray-200 last:border-b-0">
                            <div className="p-2 bg-gray-50">
                              <div className="text-xs font-semibold text-gray-500 uppercase">
                                {category.category} ({category.functions.length})
                              </div>
                            </div>
                            <div className="pl-2">
                              {category.functions.map((func) => (
                                <div 
                                  key={func.name}
                                  className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                                  onClick={() => insertFunctionIntoFormula(func.name)}
                                >
                                  <div>
                                    <div className="font-medium text-blue-600">{func.name}</div>
                                    <div className="text-xs text-gray-500">{func.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Section: Formula Builder */}
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="formula-name" className="flex items-center text-sm font-medium">
                          * Column Name
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input 
                          id="formula-name" 
                          value={formulaName}
                          onChange={(e) => setFormulaName(e.target.value)}
                          placeholder="Enter a name for this column"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="formula-description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Input 
                          id="formula-description" 
                          value={formulaDescription}
                          onChange={(e) => setFormulaDescription(e.target.value)}
                          placeholder="Optional description"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="output-type" className="text-sm font-medium">
                          Formula Output Type
                        </Label>
                        <Select 
                          value={formulaOutputType} 
                          onValueChange={setFormulaOutputType}
                        >
                          <SelectTrigger id="output-type" className="mt-1">
                            <SelectValue placeholder="Select output type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="percent">Percent</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="datetime">Date/Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(formulaOutputType === 'number' || formulaOutputType === 'currency' || formulaOutputType === 'percent') && (
                        <div>
                          <Label htmlFor="decimal-points" className="text-sm font-medium">
                            Decimal Points
                          </Label>
                          <Select 
                            value={decimalPoints} 
                            onValueChange={setDecimalPoints}
                          >
                            <SelectTrigger id="decimal-points" className="mt-1">
                              <SelectValue placeholder="Select decimal points" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">Formula</Label>
                        <div className="flex items-center space-x-1">
                          {['+', '-', '*', '/', '^', '(', ')'].map((op) => (
                            <button
                              key={op}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                              onClick={() => setFormulaEditorValue(prev => `${prev}${op}`)}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative border border-gray-300 rounded-md">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 border-r border-gray-300 text-right">
                          {Array.from({ length: Math.max((formulaEditorValue.match(/\n/g) || []).length + 1, 1) }).map((_, i) => (
                            <div key={i} className="text-xs text-gray-400 px-1.5 h-6 leading-6">{i + 1}</div>
                          ))}
                        </div>
                        <Textarea
                          value={formulaEditorValue}
                          onChange={(e) => setFormulaEditorValue(e.target.value)}
                          className="min-h-[150px] pl-8 font-mono text-sm resize-none"
                          placeholder="Enter your formula here..."
                        />
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!formulaEditorValue.trim()}
                        >
                          Validate Formula
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      <div>
                        <strong>Tips for creating formulas:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          <li>Use square brackets to reference fields: [Field Name]</li>
                          <li>Numeric operations: +, -, *, /, ^ (exponentiation)</li>
                          <li>Use functions like SUM(), MAX(), IF() for advanced calculations</li>
                          <li>Validate your formula before applying it</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFormulaBuilder(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitFormula} 
                disabled={!formulaName.trim() || !formulaEditorValue.trim()}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}