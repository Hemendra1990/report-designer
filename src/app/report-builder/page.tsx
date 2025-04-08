"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

// Import our icon components
import { 
  ChevronDownIcon, 
  ChevronLeftIcon,
  CrossIcon,
  DragHandleIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon
} from "@/components/icons";

import {
  BucketIcon,
  FilterIcon,
  FormulaIcon
} from "@/components/icons/ReportIcons";

// Import TanStack Table
import {
  ColumnDef,
  ColumnFiltersState,
  GroupingState,
  OnChangeFn,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import { FilterRow } from "./components/FilterRow";
import { ReportTypeSelectionModal } from "./components/ReportTypeSelectionModal";
import TopHeaderBar from "./components/TopHeaderBar";
import InfoBanner from "./components/InfoBanner";
import AppliedFiltersBar from "./components/AppliedFiltersBar";
import FormulaBuilder from "./components/FormulaBuilder";
import FilterFieldSelector from "./components/FilterFieldSelector";
import PreviewPanel from "./components/PreviewPanel";
import { getDefaultOperator } from "./helper/ReportBuilderHelper";
import { AccountData } from "./model/AccountData";
import { accountFields, moreSampleData, sampleData } from "./model/fake-data";
import { Field, FieldType } from "./model/Field";
import { Filter } from "./model/Filter";
import { ReportTypeTemplate } from "./model/ReportType";
import { FetchDataOptions, ServerResponse } from "./model/ServerReqRes";
import { formulaFunctions } from "./util/ReportBuilderUtil";
import SimpleFilterSelector from "./components/SimpleFilterSelector";

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

// Create a query client instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component to provide the QueryClient
export default function ReportBuilderWithQueryClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReportBuilderPage />
    </QueryClientProvider>
  );
}

// Convert fetchTableData to a function that returns a promise
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

// Main component
function ReportBuilderPage() {
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

  // Add grouping state
  const [grouping, setGrouping] = useState<GroupingState>([]);
  
  // Add these states
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

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
  
  // State for controlling shortcut visibility in collapsed panels
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Formula related state
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);

  // Handle adding a formula column
  const addFormulaColumn = () => {
    setIsMenuOpen(false);
    setShowFormulaBuilder(true);
  };

  // Handle formula dialog submission
  const handleSubmitFormula = (newFormulaColumn: {
    id: string;
    name: string;
    type: string;
    formula: string;
    description: string;
  }) => {
    setSelectedColumns([...selectedColumns, newFormulaColumn]);
    setShowFormulaBuilder(false);
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

  // Use the query client
  const queryClient = useQueryClient();

  // Create a query key based on all relevant parameters
  const createQueryKey = useCallback(() => {
    return [
      'reportData',
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      grouping,
      selectedColumns,
      filters,
    ];
  }, [pagination.pageIndex, pagination.pageSize, sorting, grouping, selectedColumns, filters]);

  // Use React Query instead of manually fetching
  const {
    data: queryResult,
    isLoading: queryLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: createQueryKey(),
    queryFn: () => fetchTableData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      grouping,
      selectedColumns,
      filters,
    }),
    enabled: autoUpdatePreview && selectedColumns.length > 0,
  });

  // Update state when data changes
  useEffect(() => {
    if (queryResult) {
      setRowData(queryResult.data || []);
      setPageCount(queryResult.pageCount || 0);
      setTotalRows(queryResult.totalRows || 0);
    }
  }, [queryResult]);

  // Function to manually trigger a refresh of the data
  const fetchData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: createQueryKey() });
  }, [queryClient, createQueryKey]);

  // Combine loading states
  const isDataLoading = queryLoading || isFetching;

  // Update isLoading state for the UI
  useEffect(() => {
    setIsLoading(isDataLoading);
  }, [isDataLoading]);

  // Always update when autoUpdatePreview changes
  useEffect(() => {
    if (autoUpdatePreview && selectedColumns.length > 0) {
      fetchData();
    }
  }, [autoUpdatePreview, fetchData, selectedColumns.length]);

  // Show error message if query fails
  useEffect(() => {
    if (error) {
      console.error('Error fetching report data:', error);
      // Could add a toast notification here
    }
  }, [error]);

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

      // We don't need to manually set row data here anymore as React Query handles this
      // setRowData(filteredData);
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
      minSize: 180, // Ensure minimum column width
      size: 200,    // Default column width
    })),
    [selectedColumns]
  );

  return (
    <>
      <ReportTypeSelectionModal
        isOpen={showReportTypeModal}
        onClose={handleModalClose}
        onSelect={handleReportTypeSelect}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopHeaderBar 
          reportName={selectedReportType?.name || "New Accounts Report"}
          reportType="Accounts"
          showShortcuts={showShortcuts}
          onToggleShortcuts={() => setShowShortcuts(!showShortcuts)}
          onRun={() => fetchData()}
          onClose={() => router.push('/reports')}
        />
        
        <InfoBanner message="Previewing a limited number of records. Run the report to see everything." />
        
        <AppliedFiltersBar 
          filters={filters}
          onRemoveFilter={removeFilter}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Fields */}
          <div className={`${leftPanelCollapsed ? 'w-12' : 'w-64'} bg-card border-r border-border flex flex-col overflow-hidden transition-all duration-300 shrink-0`}>
            {/* Collapse Control */}
            <div className="flex justify-end p-1">
              <button
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title={leftPanelCollapsed ? "Expand fields panel" : "Collapse fields panel"}
              >
                <ChevronLeftIcon 
                  className={`transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`} 
                />
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
                    <SearchIcon
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
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
                        <ChevronDownIcon 
                          className={`transition-transform ${expandedCategories[category as keyof typeof expandedCategories] ? 'rotate-180' : ''}`} 
                        />
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
                                <PlusIcon
                                  className="text-blue-600 opacity-0 group-hover:opacity-100"
                                />
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
              // Collapsed view - shows only icons without category shortcuts
              <div className="flex flex-col items-center pt-4 space-y-4 overflow-y-auto">
                <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mb-8">
                  Fields
                </div>
                {/* <div
                  className="p-2 cursor-pointer hover:bg-accent rounded-md"
                  title="All fields"
                  onClick={() => setLeftPanelCollapsed(false)}
                >
                  <TableIcon width={22} height={22} className="text-gray-600" />
                </div> */}
                
                {/* Conditionally render category shortcuts based on state */}
                {showShortcuts && (
                  <>
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
                        <div className="size-8 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center text-sm font-medium">
                          {category.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Center Panel - Report Builder */}
          <div className={`${centerPanelCollapsed ? 'w-12' : 'w-64'} flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0`}>
            {/* Collapse Control */}
            <div className="flex justify-end p-1">
              <button
                onClick={() => setCenterPanelCollapsed(!centerPanelCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title={centerPanelCollapsed ? "Expand builder panel" : "Collapse builder panel"}
              >
                <ChevronLeftIcon 
                  className={`transition-transform ${centerPanelCollapsed ? 'rotate-180' : ''}`}
                />
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
                      <SearchIcon 
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

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
                                <CrossIcon />
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
                          <PlusIcon className="mr-1" />
                          Add Column
                          <ChevronDownIcon className="ml-1" />
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
                                <BucketIcon className="mr-2" />
                                Add Bucket Column
                              </button>
                              <button
                                className="px-4 py-2 text-sm text-gray-400 w-full text-left flex items-center cursor-not-allowed"
                              >
                                <FormulaIcon className="mr-2" />
                                Add Summary Formula
                              </button>
                              <button
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                                onClick={addFormulaColumn}
                              >
                                <FormulaIcon className="mr-2" />
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
                                <TrashIcon className="mr-2" />
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
                              <DragHandleIcon />
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
                            <CrossIcon />
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
                        <FilterIcon width={16} height={16} />
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
                    <SimpleFilterSelector 
                      accountFields={accountFields}
                      addFilter={addFilter}
                      onOpenFullSelector={() => setShowFilterFieldSelector(true)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Collapsed view for center panel
              <div className="flex flex-col items-center pt-4 overflow-hidden">
                <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mb-8">
                  Outline
                </div>
                {/* <div
                  className="p-2 cursor-pointer hover:bg-gray-50 rounded"
                  title="Report columns"
                  onClick={() => setCenterPanelCollapsed(false)}
                >
                  <TableIcon width={22} height={22} className="text-blue-600" />
                </div> */}
                
                {/* Conditionally render shortcuts based on state */}
                {showShortcuts && (
                  <>
                    <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mt-8">
                      Outline
                    </div>
                    <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mt-8">
                      Filters ({filters.length})
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <PreviewPanel 
            rowData={rowData}
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
            toggleRowCounts={toggleRowCounts}
            showDetailRows={showDetailRows}
            toggleDetailRows={toggleDetailRows}
            grouping={grouping}
            onGroupingChange={setGrouping}
            expandedRowGroups={expandedRowGroups}
            setExpandedRowGroups={setExpandedRowGroups}
            pageCount={pageCount}
            totalRows={totalRows}
            isLoading={isLoading}
            autoUpdatePreview={autoUpdatePreview}
            setAutoUpdatePreview={setAutoUpdatePreview}
            onExpandView={() => {
              setLeftPanelCollapsed(true);
              setCenterPanelCollapsed(true);
            }}
          />
        </div>

        {/* Formula Builder */}
        <FormulaBuilder
          isOpen={showFormulaBuilder}
          onClose={() => setShowFormulaBuilder(false)}
          onSubmit={handleSubmitFormula}
          fieldsByCategory={fieldsByCategory}
          formulaFunctions={formulaFunctions}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          searchTerm={searchTerm}
          formulaSearchTerm={formulaSearchTerm}
          onSearchTermChange={setSearchTerm}
          onFormulaSearchTermChange={setFormulaSearchTerm}
        />

        {/* Filter Field Selector */}
        <FilterFieldSelector 
          isOpen={showFilterFieldSelector}
          onClose={() => setShowFilterFieldSelector(false)}
          fieldsByCategory={fieldsByCategory}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          filterSearchTerm={filterSearchTerm}
          onFilterSearchTermChange={setFilterSearchTerm}
          addFilter={addFilter}
        />
      </div>
    </>
  );
}

