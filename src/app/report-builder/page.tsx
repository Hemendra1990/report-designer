"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Import TanStack Table
import {
  ColumnDef,
  ColumnFiltersState,
  GroupingState,
  OnChangeFn,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import { DataTable } from "./components/DataTable";
import { FilterRow } from "./components/FilterRow";
import { ReportTypeSelectionModal } from "./components/ReportTypeSelectionModal";
import { getDefaultOperator, getFieldIcon } from "./helper/ReportBuilderHelper";
import { AccountData } from "./model/AccountData";
import { accountFields, moreSampleData, sampleData } from "./model/fake-data";
import { Field, FieldType } from "./model/Field";
import { Filter } from "./model/Filter";
import { ReportTypeTemplate } from "./model/ReportType";
import { FetchDataOptions, ServerResponse } from "./model/ServerReqRes";
import { formulaFunctions } from "./util/ReportBuilderUtil";



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

// Combine all sample data
const allSampleData: AccountData[] = [...sampleData, ...moreSampleData];


// Add this before the ReportBuilderPage component
async function fetchTableData(options: FetchDataOptions): Promise<ServerResponse> {
  const { pageIndex, pageSize, sorting, grouping, selectedColumns, filters } = options;

  try {
    const response = await fetch('/api/report-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: pageIndex + 1,
        pageSize,
        sorting,
        grouping,
        columns: selectedColumns,
        filters,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      data: [],
      pageCount: 0,
      totalRows: 0
    };
  }
}

export default function ReportBuilderPage() {
  const router = useRouter();
  const [showReportTypeModal, setShowReportTypeModal] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState<ReportTypeTemplate | null>(null);

  const handleReportTypeSelect = (reportType: ReportTypeTemplate) => {
    setSelectedReportType(reportType);
    setShowReportTypeModal(false);
  };

  const handleModalClose = () => {
    if (!selectedReportType) {
      router.push('/reports');
    }
    setShowReportTypeModal(false);
  };

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

  // Group dropdown state
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupByFields, setGroupByFields] = useState<string[]>([]);
  const [expandedRowGroups, setExpandedRowGroups] = useState<Record<string, boolean>>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Preview settings
  const [rowData, setRowData] = useState<AccountData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showRowCounts, setShowRowCounts] = useState(true);
  const [showDetailRows, setShowDetailRows] = useState(true);
  const [autoUpdatePreview, setAutoUpdatePreview] = useState(true);

  // Reference for click outside menu
  const menuRef = useRef<HTMLDivElement>(null);
  const groupSearchRef = useRef<HTMLDivElement>(null);

  // Initialize column refs
  useEffect(() => {
    columnRefs.current = columnRefs.current.slice(0, selectedColumns.length);
  }, [selectedColumns]);

  // Update selectedGroup when groupByFields changes
  useEffect(() => {
    const lastSelectedField = groupByFields[groupByFields.length - 1] || null;
    setSelectedGroup(lastSelectedField);
    if (groupByFields.length > 0) {
      const lastColumn = selectedColumns.find(col => col.id === lastSelectedField);
      setGroupSearchTerm(lastColumn?.name || "");
    } else {
      setGroupSearchTerm("");
    }
  }, [groupByFields, selectedColumns]);

  // Handle click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (groupSearchRef.current && !groupSearchRef.current.contains(event.target as Node)) {
        setShowGroupDropdown(false);
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
      [category]: !prev[category as keyof typeof prev]
    }));
  };

  // Handle adding a column to the report
  const addColumn = (field: typeof accountFields[0]) => {
    if (!selectedColumns.some(col => col.id === field.id)) {
      const newColumns = [...selectedColumns, { id: field.id, name: field.name, type: field.type }];
      setSelectedColumns(newColumns);
      if (autoUpdatePreview) {
        fetchData();
      }
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

  // Add state for filters
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterLogic, setFilterLogic] = useState<'and' | 'or' | 'custom'>('and');
  const [customFormula, setCustomFormula] = useState('');

  // Add state for filter field selector
  const [showFilterFieldSelector, setShowFilterFieldSelector] = useState(false);
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  // Function to add a new filter
  const addFilter = (field: Field) => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      field,
      operator: getDefaultOperator(field.type),
      value: '',
      rangeStart: '',
      rangeEnd: '',
      selectedOptions: []
    };

    setFilters([...filters, newFilter]);
  };

  // Function to remove a filter
  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(filter => filter.id !== filterId));
  };

  // Function to update a filter
  const updateFilter = (filterId: string, updates: Partial<Filter>) => {
    setFilters(filters.map(filter =>
      filter.id === filterId ? { ...filter, ...updates } : filter
    ));
  };

  // Update column definitions when selected columns change
  useEffect(() => {
    if (selectedColumns.length > 0 && autoUpdatePreview) {
      // Apply filters to sample data
      let filteredData = [...allSampleData];

      // Apply filters based on the filter state
      if (filters.length > 0) {
        filteredData = filteredData.filter(item => {
          // For demo purposes, we'll just check if the item has the field and value
          // In a real app, you'd implement proper filter logic based on operators
          return filters.every(filter => {
            const fieldValue = item[filter.field.id];
            if (!fieldValue) return false;

            // Simple filter implementation for demo
            if (filter.operator === 'equals') {
              return fieldValue === filter.value;
            } else if (filter.operator === 'contains') {
              return String(fieldValue).toLowerCase().includes(filter.value.toLowerCase());
            }

            return true;
          });
        });
      }

      // Sort data by group field if one is selected
      if (groupByFields.length > 0) {
        filteredData.sort((a, b) => {
          const aValues = groupByFields.map(field => a[field]?.toString() || 'undefined');
          const bValues = groupByFields.map(field => b[field]?.toString() || 'undefined');
          return aValues.join(' | ').localeCompare(bValues.join(' | '));
        });
      }

      setRowData(filteredData);
    }
  }, [filters, autoUpdatePreview, selectedColumns, allSampleData, groupByFields]);

  // Function to handle grouping by a field
  const handleGroupBy = (fieldId: string) => {
    console.log('Grouping by:', fieldId);

    const updateGrouping: OnChangeFn<GroupingState> = (updater) => {
      const prevGrouping = typeof updater === 'function' ? updater(grouping) : updater;
      setGrouping(prevGrouping);
    };

    updateGrouping((prev) => {
      if (prev.includes(fieldId)) {
        const newGroups = prev.filter(id => id !== fieldId);
        if (newGroups.length === 0) {
          setExpandedRowGroups({});
          setSelectedGroups([]);
          setGroupSearchTerm('');
        }
        return newGroups;
      }
      return [...prev, fieldId];
    });

    // Update expanded groups for the new grouping
    if (!expandedRowGroups[fieldId]) {
      setExpandedRowGroups(prev => ({
        ...prev,
        [fieldId]: true
      }));
    }

    // Fetch new data with updated grouping
    if (autoUpdatePreview) {
      fetchData();
    }
  };

  // Function to toggle row counts
  const toggleRowCounts = () => {
    setShowRowCounts(!showRowCounts);
  };

  // Function to toggle detail rows
  const toggleDetailRows = () => {
    setShowDetailRows(!showDetailRows);
    // When using TanStack Table, this will toggle showing/hiding details
    if (!showDetailRows) {
      // Expand all groups
      const expanded: Record<string, boolean> = {};
      rowData.forEach(row => {
        if (groupByFields.length > 0) {
          groupByFields.forEach(field => {
            expanded[row[field]?.toString() || ''] = true;
          });
        }
      });
      setExpandedRowGroups(expanded);
    } else {
      // Collapse all groups
      setExpandedRowGroups({});
    }
  };

  // Create columns for the table
  const columns = useMemo<ColumnDef<AccountData>[]>(
    () => selectedColumns.map(field => ({
      id: field.id,
      accessorKey: field.id,
      header: field.name,
      cell: info => info.getValue(),
      enableGrouping: true,
      aggregationFn: field.type === 'number' || field.type === 'currency' ? 'mean' : 'count',
      aggregatedCell: info => {
        const value = info.getValue();
        if (typeof value === 'number') {
          return Math.round(value * 100) / 100;
        }
        return value;
      },
    })),
    [selectedColumns]
  );

  // Add grouping state
  const [grouping, setGrouping] = useState<GroupingState>([]);

  // Add these states
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  // Add a function to fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchTableData({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        grouping,
        selectedColumns,
        filters,
      });

      setRowData(result.data);
      setPageCount(result.pageCount);
      setTotalRows(result.totalRows);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, grouping, selectedColumns, filters]);

  // Add effect to fetch data when dependencies change
  useEffect(() => {
    if (autoUpdatePreview) {
      fetchData();
    }
  }, [fetchData, autoUpdatePreview]);

  return (
    <>
      <ReportTypeSelectionModal
        isOpen={showReportTypeModal}
        onClose={handleModalClose}
        onSelect={handleReportTypeSelect}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
          {filters.map((filter) => (
            <div key={filter.id} className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 flex items-center gap-1">
              <span className="font-medium">{filter.field.name}</span>
              <span className="text-gray-500">{filter.operator}</span>
              {filter.value && <span className="text-gray-500">• {filter.value}</span>}
              {filter.rangeStart && filter.rangeEnd && (
                <span className="text-gray-500">• {filter.rangeStart} to {filter.rangeEnd}</span>
              )}
              {filter.selectedOptions && filter.selectedOptions.length > 0 && (
                <span className="text-gray-500">• {filter.selectedOptions.join(', ')}</span>
              )}
              <button
                onClick={() => removeFilter(filter.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          ))}
          {filters.length === 0 && (
            <div className="text-gray-500">No filters applied</div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Fields */}
          <div className={`${leftPanelCollapsed ? 'w-12' : 'w-64'} bg-card border-r border-border flex flex-col overflow-hidden transition-all duration-300`}>
            {/* Collapse Control */}
            <div className="flex justify-end p-1">
              <button
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
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
                                onDragStart={() => {/* Handle field drag if needed */ }}
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
                <div className="text-xs font-medium text-muted-foreground">Field</div>
                {Object.entries(fieldsByCategory).map(([category]) => (
                  <div
                    key={category}
                    className="p-2 cursor-pointer hover:bg-accent rounded-md"
                    title={`${category.toUpperCase()} fields`}
                    onClick={() => {
                      setLeftPanelCollapsed(false);
                      setTimeout(() => toggleCategory(category), 300);
                    }}
                  >
                    <div className="size-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-xs font-medium">
                      {category.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center Panel - Report Builder */}
          <div className={`${centerPanelCollapsed ? 'w-12' : 'w-64'} flex flex-col bg-card border-r border-border transition-all duration-300`}>
            {/* Collapse Control */}
            <div className="flex justify-end p-1">
              <button
                onClick={() => setCenterPanelCollapsed(!centerPanelCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
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
                    <div className="text-xs font-semibold text-muted-foreground mb-2">GROUP ROWS</div>
                    <div className="relative" ref={groupSearchRef}>
                      <Input
                        className="pl-8 text-sm bg-background"
                        placeholder="Add group..."
                        value={groupSearchTerm}
                        onChange={(e) => {
                          setGroupSearchTerm(e.target.value);
                          if (!showGroupDropdown) setShowGroupDropdown(true);
                        }}
                        onClick={() => setShowGroupDropdown(true)}
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
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>

                      {/* Group Dropdown */}
                      {showGroupDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md py-1 max-h-[300px] overflow-y-auto">
                          {selectedColumns.filter(col =>
                            !groupSearchTerm.trim() || col.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                          ).length > 0 ? (
                            selectedColumns
                              .filter(col =>
                                !groupSearchTerm.trim() || col.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                              )
                              .map(column => (
                                <div
                                  key={column.id}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
                                  onClick={() => {
                                    setSelectedGroup(column.id);
                                    setGroupSearchTerm(column.name);
                                    setShowGroupDropdown(false);
                                    handleGroupBy(column.id);
                                  }}
                                >
                                  <span className={`size-4 flex items-center justify-center rounded-sm text-xs ${column.type === 'number' || column.type === 'currency' ? 'bg-primary/10 text-primary' : 'bg-accent/80 text-accent-foreground'}`}>
                                    {column.name.charAt(0).toUpperCase()}
                                  </span>
                                  {column.name}
                                </div>
                              ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No columns match your search
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Groups */}
                    {grouping.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {grouping.map((groupId, index) => {
                          const groupColumn = selectedColumns.find(col => col.id === groupId);
                          if (!groupColumn) return null;
                          return (
                            <div key={groupId} className="bg-accent/50 border rounded-md p-2 text-sm flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{groupColumn.name}</span>
                                <span className="text-muted-foreground">Ascending</span>
                              </div>
                              <button
                                onClick={() => {
                                  handleGroupBy(groupId);
                                }}
                                className="text-muted-foreground hover:text-foreground"
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
                          );
                        })}
                      </div>
                    )}
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
                          ref={(el) => {
                            // Fix the ref assignment
                            if (columnRefs.current) {
                              columnRefs.current[index] = el;
                            }
                          }}
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Filters</h3>
                      <Button
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setShowFilterFieldSelector(true)}
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
                          <line x1="12" x2="12" y1="5" y2="19" />
                          <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                        Add Filter
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Filter Logic Selector */}
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex flex-col space-y-3">
                          <div className="text-sm">
                            <span className="font-medium">Filter Logic:</span>
                          </div>
                          <div>
                            <Select
                              value={filterLogic}
                              onValueChange={(value: 'and' | 'or' | 'custom') => setFilterLogic(value)}
                            >
                              <SelectTrigger className="w-[200px] h-8 text-xs">
                                <SelectValue placeholder="Logic" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="and">AND (1 AND 2 AND 3)</SelectItem>
                                <SelectItem value="or">OR (1 OR 2 OR 3)</SelectItem>
                                <SelectItem value="custom">Custom Formula</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-gray-500">
                            {filterLogic === 'and' ? 'All conditions must be true' :
                              filterLogic === 'or' ? 'Any condition can be true' :
                                'Define a custom formula'}
                          </div>
                        </div>

                        {filterLogic === 'custom' && (
                          <div className="mt-3">
                            <Textarea
                              placeholder="Enter custom formula (e.g., 1 AND (2 OR 3))"
                              value={customFormula}
                              onChange={(e) => setCustomFormula(e.target.value)}
                              className="text-xs"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Use numbers to reference filters (e.g., 1, 2, 3) and combine with AND, OR, NOT
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Display existing filters */}
                      {filters.map((filter, index) => (
                        <FilterRow
                          key={filter.id}
                          filter={filter}
                          onRemove={() => removeFilter(filter.id)}
                          onUpdate={(updates) => updateFilter(filter.id, updates)}
                          index={index + 1}
                        />
                      ))}

                      {/* Show message when no filters exist */}
                      {filters.length === 0 && (
                        <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300 text-center">
                          <p className="text-gray-500">No filters added yet. Click "Add Filter" to create one.</p>
                        </div>
                      )}
                    </div>

                    {/* Filter Field Selection UI */}
                    <div className="mt-8 border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
                      <h4 className="text-sm font-medium mb-3">Add Another Filter</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="filter-field" className="text-xs mb-1 block">Field</Label>
                          <Select onValueChange={(value) => {
                            const field = accountFields.find(f => f.id === value);
                            if (field) {
                              // Convert the field to the correct type
                              const typedField: Field = {
                                id: field.id,
                                name: field.name,
                                type: field.type as FieldType,
                                category: field.category,
                                icon: field.icon
                              };
                              addFilter(typedField);
                            }
                          }}>
                            <SelectTrigger id="filter-field" className="w-full">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {accountFields.map(field => (
                                <SelectItem key={field.id} value={field.id}>
                                  {field.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button className="w-full" onClick={() => setShowFilterFieldSelector(true)}>
                            Add Filter
                          </Button>
                        </div>
                      </div>
                    </div>
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
          <div className="flex-1 bg-accent/10 flex flex-col transition-all duration-300">
            <div className="p-3 bg-background border-b border-border flex justify-between">
              <div className="flex items-center">
                <button
                  className="mr-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
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
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    className={`p-1 rounded ${showRowCounts ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    onClick={toggleRowCounts}
                    title="Toggle Row Counts"
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
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="15" x2="20" y2="15" />
                      <line x1="10" y1="3" x2="8" y2="21" />
                      <line x1="16" y1="3" x2="14" y2="21" />
                    </svg>
                  </button>
                  <button
                    className={`p-1 rounded ${showDetailRows ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    onClick={toggleDetailRows}
                    title="Toggle Detail Rows"
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Update Automatically</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={autoUpdatePreview}
                      onChange={() => setAutoUpdatePreview(!autoUpdatePreview)}
                    />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-muted-foreground after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>

            {rowData.length > 0 ? (
              <div className="flex-1 p-4">
                <div className="w-full h-full rounded-md overflow-hidden border border-border">
                  <DataTable<AccountData>
                    data={rowData}
                    columns={columns}
                    sorting={sorting}
                    setSorting={setSorting}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    columnVisibility={columnVisibility}
                    setColumnVisibility={setColumnVisibility}
                    pagination={pagination}
                    setPagination={setPagination}
                    showRowCounts={showRowCounts}
                    showDetailRows={showDetailRows}
                    grouping={grouping}
                    onGroupingChange={setGrouping}
                    expandedRowGroups={expandedRowGroups}
                    setExpandedRowGroups={setExpandedRowGroups}
                    pageCount={pageCount}
                    totalRows={totalRows}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            ) : (
              // Keep the existing "No records returned" view
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
            )}
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

        {/* Filter Field Selector Dialog */}
        {showFilterFieldSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Add Filter</h2>
                <button
                  onClick={() => setShowFilterFieldSelector(false)}
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

              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Input
                    className="pl-8 text-sm"
                    placeholder="Search fields..."
                    value={filterSearchTerm}
                    onChange={(e) => setFilterSearchTerm(e.target.value)}
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

              <div className="overflow-y-auto flex-1 p-4">
                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <div key={category} className="mb-4">
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
                            !filterSearchTerm.trim() ||
                            field.name.toLowerCase().includes(filterSearchTerm.toLowerCase())
                          )
                          .map(field => (
                            <div
                              key={field.id}
                              className="pl-2 pr-3 py-1.5 text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer group"
                              onClick={() => {
                                // Convert the field to the correct type
                                const typedField: Field = {
                                  id: field.id,
                                  name: field.name,
                                  type: field.type as FieldType,
                                  category: field.category,
                                  icon: field.icon
                                };
                                addFilter(typedField);
                                setShowFilterFieldSelector(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs ${field.type === 'number' || field.type === 'currency' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {getFieldIcon(field.type as FieldType)}
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
