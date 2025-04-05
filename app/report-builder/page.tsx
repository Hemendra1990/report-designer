"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Group fields by category
const fieldsByCategory = accountFields.reduce((acc, field) => {
  acc[field.category] = acc[field.category] || [];
  acc[field.category].push(field);
  return acc;
}, {} as Record<string, typeof accountFields>);

// Sample selected columns for the report
const initialSelectedColumns = [
  { id: "last_activity", name: "Last Activity" },
  { id: "account_owner", name: "Account Owner" },
  { id: "account_name", name: "Account Name" },
  { id: "billing_state", name: "Billing State/Province" },
  { id: "type", name: "Type" },
  { id: "rating", name: "Rating" },
  { id: "last_modified_date", name: "Last Modified Date" },
];

export default function ReportBuilderPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(initialSelectedColumns);
  const [expandedCategories, setExpandedCategories] = useState({
    general: true,
    address: false,
    system: false,
  });

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
      setSelectedColumns([...selectedColumns, { id: field.id, name: field.name }]);
    }
  };

  // Handle removing a column from the report
  const removeColumn = (fieldId: string) => {
    setSelectedColumns(selectedColumns.filter(col => col.id !== fieldId));
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
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
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
                          className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                          onClick={() => addColumn(field)}
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
        </div>

        {/* Center Panel - Report Builder */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
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
                <div className="text-xs font-semibold text-gray-500 mb-2">COLUMNS</div>
                
                <div className="space-y-2">
                  {selectedColumns.map((column, index) => (
                    <div 
                      key={column.id}
                      className="bg-white border border-gray-200 rounded p-2 flex items-center justify-between group hover:border-gray-300 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
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
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          <div className="p-3 bg-white border-b border-gray-200 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Update Preview Automatically</span>
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
    </div>
  );
}