"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Import our icon components


// Import TanStack Table
import {
  ColumnDef,
  ColumnFiltersState,
  GroupingState,
  OnChangeFn,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import AppliedFiltersBar from "./components/AppliedFiltersBar";
import FieldsPanel from "./components/FieldsPanel";
import FilterFieldSelector from "./components/FilterFieldSelector";
import FormulaBuilder from "./components/FormulaBuilder";
import InfoBanner from "./components/InfoBanner";
import PreviewPanel from "./components/PreviewPanel";
import ReportBuilderPanel from "./components/ReportBuilderPanel";
import { ReportTypeSelectionModal } from "./components/ReportTypeSelectionModal";
import TopHeaderBar from "./components/TopHeaderBar";
import { getDefaultOperator } from "./helper/ReportBuilderHelper";
import { AccountData } from "./model/AccountData";
import { accountFields, moreSampleData, sampleData } from "./model/fake-data";
import { Field } from "./model/Field";
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
const initialSelectedColumns: Field[] = [
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

  // Add state for SQL generation and saving
  const [generatedSql, setGeneratedSql] = useState<string>('');
  const [showSqlPreview, setShowSqlPreview] = useState<boolean>(false);
  
  // Add filter state
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterLogic, setFilterLogic] = useState<'and' | 'or' | 'custom'>('and');
  const [customFormula, setCustomFormula] = useState('');

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
          // For demo purposes, we'll check if the item matches all filters based on the filterLogic
          if (filterLogic === 'and') {
            return filters.every(filter => matchesFilter(item, filter));
          } else if (filterLogic === 'or') {
            return filters.some(filter => matchesFilter(item, filter));
          }
          // For custom logic, we'd need more complex processing
          return true;
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
  }, [filters, autoUpdatePreview, selectedColumns, allSampleData, groupByFields, filterLogic]);

  // Helper function to check if an item matches a filter
  const matchesFilter = (item: AccountData, filter: Filter): boolean => {
    const fieldId = filter.field.id;
    const fieldValue = item[fieldId];
    
    // If the field doesn't exist on the item, it can't match
    if (fieldValue === undefined) return false;
    
    const stringValue = String(fieldValue).toLowerCase();
    const filterValue = (filter.value || '').toLowerCase();
    
    switch (filter.operator) {
      case 'equals':
        return stringValue === filterValue;
        
      case 'not_equals':
        return stringValue !== filterValue;
        
      case 'contains':
        return stringValue.includes(filterValue);
        
      case 'not_contains':
        return !stringValue.includes(filterValue);
        
      case 'starts_with':
        return stringValue.startsWith(filterValue);
        
      case 'ends_with':
        return stringValue.endsWith(filterValue);
        
      case 'is_empty':
        return !fieldValue || stringValue === '';
        
      case 'is_not_empty':
        return !!fieldValue && stringValue !== '';
        
      case 'in_list':
        return filter.selectedOptions?.some(option => 
          stringValue === option.toLowerCase()
        ) || false;
        
      case 'not_in_list':
        return !filter.selectedOptions?.some(option => 
          stringValue === option.toLowerCase()
        ) || false;
        
      // For numeric comparisons
      case 'less_than':
      case 'greater_than':
      case 'less_or_equal':
      case 'greater_or_equal':
      case 'between':
        // These would need proper numeric parsing and comparison
        return true; // Simplified for this example
        
      default:
        return false;
    }
  };

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
        // Also update groupByFields
        setGroupByFields(newGroups);
        return newGroups;
      }
      // Also update groupByFields
      const newGroups = [...prev, fieldId];
      setGroupByFields(newGroups);
      return newGroups;
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

  // Handle saving the report with generated SQL
  const handleSaveReport = (sql: string, reportName: string) => {
    console.log(`Saving report '${reportName}' with SQL:`, sql);
    // Here you would typically persist this data to your backend
    // For example, using an API call
    
    // Provide feedback to the user
    alert(`Report "${reportName}" has been saved successfully!`);
    
    // Optionally navigate to reports list page
    // router.push('/reports');
  };

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
          reportType={selectedReportType?.type || "Accounts"}
          showShortcuts={showShortcuts}
          onToggleShortcuts={() => setShowShortcuts(!showShortcuts)}
          onRun={() => fetchData()}
          onClose={() => router.push('/reports')}
          // Pass SQL generation props
          selectedColumns={selectedColumns}
          groupByFields={groupByFields}
          filters={filters}
          filterLogic={filterLogic}
          customFilterFormula={customFormula}
          onSaveReport={handleSaveReport}
        />
        
        <InfoBanner message="Previewing a limited number of records. Run the report to see everything." />
        
        <AppliedFiltersBar 
          filters={filters}
          onRemoveFilter={removeFilter}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Fields */}
          <FieldsPanel
            leftPanelCollapsed={leftPanelCollapsed}
            setLeftPanelCollapsed={setLeftPanelCollapsed}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fieldsByCategory={fieldsByCategory}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            addColumn={addColumn}
            showShortcuts={showShortcuts}
          />

          {/* Center Panel - Report Builder */}
          <ReportBuilderPanel
            centerPanelCollapsed={centerPanelCollapsed}
            setCenterPanelCollapsed={setCenterPanelCollapsed}
            showShortcuts={showShortcuts}
            filters={filters}
            
            // Groups section props
            selectedColumns={selectedColumns}
            groupSearchTerm={groupSearchTerm}
            setGroupSearchTerm={setGroupSearchTerm}
            showGroupDropdown={showGroupDropdown}
            setShowGroupDropdown={setShowGroupDropdown}
            setSelectedGroup={setSelectedGroup}
            handleGroupBy={handleGroupBy}
            grouping={grouping}
            groupSearchRef={groupSearchRef}
            
            // Columns section props
            isMenuOpen={isMenuOpen}
            menuRef={menuRef}
            menuPosition={menuPosition}
            columnRefs={columnRefs}
            draggedItem={draggedItem}
            openColumnMenu={openColumnMenu}
            addFormulaColumn={addFormulaColumn}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            removeColumn={removeColumn}
            setIsMenuOpen={setIsMenuOpen}
            setSelectedColumns={setSelectedColumns}
            setDraggedItem={setDraggedItem}
            
            // Filters section props
            filterLogic={filterLogic}
            setFilterLogic={setFilterLogic}
            customFormula={customFormula}
            setCustomFormula={setCustomFormula}
            accountFields={accountFields}
            addFilter={addFilter}
            removeFilter={removeFilter}
            updateFilter={updateFilter}
            setShowFilterFieldSelector={setShowFilterFieldSelector}
          />

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

