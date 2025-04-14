// Add DataTable component

import React, { useEffect, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {DataTableProps} from "../model/DataTableProps";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon, TableIcon} from "@/components/icons";
import {PivotTable} from "./PivotTable";
import { GroupDetailView } from "./GroupDetailView";
import { fetchGroupDetailRecords } from "../services/groupDetailService";

// Add a custom interface to track which groups have been expanded
interface ExpandedGroupDetailState {
  [key: string]: boolean;
}

// Helper function to format cell values based on their type
const formatCellValue = (value: any): React.ReactNode => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return <span className="text-gray-400">(Empty)</span>;
  }
  
  // If it's already a React element (from flexRender), return it directly
  if (React.isValidElement(value)) {
    return value;
  }
  
  // Handle objects (including instances that might be coming from DuckDB)
  if (typeof value === 'object') {
    // Check if it has a 'value' property (common in some SQL results)
    if ('value' in value) {
      return formatCellValue(value.value);
    }
    
    // Check if it has a 'text' property
    if ('text' in value) {
      return <span>{String(value.text)}</span>;
    }
    
    // If it has just one property, use that
    const keys = Object.keys(value);
    if (keys.length === 1) {
      return formatCellValue(value[keys[0]]);
    }
    
    // If it's a Date object
    if (value instanceof Date) {
      return <span>{value.toLocaleString()}</span>;
    }
    
    // Try to convert to readable JSON
    try {
      // Only stringify if it's not already a string
      const str = JSON.stringify(value);
      if (str === '[object Object]') {
        // If it's just [object Object], check for string properties
        const strProps = Object.entries(value)
          .filter(([_, v]) => typeof v === 'string' || typeof v === 'number')
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        
        return <span>{strProps || str}</span>;
      }
      return <span>{str}</span>;
    } catch (e) {
      return <span>{String(value)}</span>;
    }
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    if (value % 1 !== 0) {
      return <span>{value.toFixed(2)}</span>;
    }
    return <span>{value}</span>;
  }
  
  // Handle booleans
  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }
  
  // Default: return as string
  return <span>{String(value)}</span>;
};

export function DataTable<TData extends Record<string, any>>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
    showRowCounts = false,
    showDetailRows = false,
    grouping,
    onGroupingChange,
    expandedRowGroups,
    setExpandedRowGroups,
    pageCount,
    totalRows,
    isLoading,
    isPivotTable = false,
    pivotColumns,
    pivotValues,
    generatedSql,
    cteQuery,
    selectedReportType,
    selectedColumns,
    filters,
    filterLogic,
    selectedAggregations
  } = props;

  // IMPORTANT: Define all hooks at the top level before any conditional returns
  const hasLoggedSample = React.useRef(false);
  const [expandedGroupDetails, setExpandedGroupDetails] = React.useState<Record<string, boolean>>({});
  const [groupValueHierarchy, setGroupValueHierarchy] = React.useState<Record<string, Record<string, string>>>({});
  const [rowsToUpdate, setRowsToUpdate] = React.useState<Array<{id: string, values: Record<string, string>}>>([]);

  // Initialize the table with grouping support - must be before any conditional returns
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      grouping,
      expanded: expandedRowGroups,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGroupingChange,
    onExpandedChange: setExpandedRowGroups,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    manualGrouping: false,
    autoResetExpanded: false,
  });

  // Effect to update group value hierarchies - define before conditional returns
  React.useEffect(() => {
    if (rowsToUpdate.length > 0) {
      setGroupValueHierarchy(prev => {
        const newState = {...prev};
        rowsToUpdate.forEach(({id, values}) => {
          newState[id] = values;
        });
        return newState;
      });
      setRowsToUpdate([]);
    }
  }, [rowsToUpdate]);
  
  // Effect to help preserve expansion state when grouping changes - define before conditional returns
  useEffect(() => {
    // Only if we have grouping
    if (grouping.length > 0) {
      // If we have no expanded state yet, auto-expand all groups
      if (Object.keys(expandedRowGroups).length === 0) {
        // Find all rows that are root rows (depth 0) in grouped data
        const autoExpandState = {};
        
        // Get all grouped rows
        const rowsToExpand = table.getRowModel().rows.filter(
          row => row.getIsGrouped()
        );
        
        // Check if we need to create expanded state
        if (rowsToExpand.length > 0 && Object.keys(expandedRowGroups).length === 0) {
          console.log('Auto-expanding all groups:', rowsToExpand.length);
          
          // Set all group rows to expanded
          const newExpandedState = {};
          
          // Use row IDs as keys for expansion state
          rowsToExpand.forEach(row => {
            newExpandedState[row.id] = true;
          });
          
          // Update the expanded state if we have rows to expand
          if (Object.keys(newExpandedState).length > 0) {
            console.log('Setting new expanded state:', newExpandedState);
            setExpandedRowGroups(newExpandedState);
          }
        }
      }
    }
  }, [grouping, data, table, expandedRowGroups, setExpandedRowGroups]);

  // NOW it's safe to have conditional returns after all hooks are defined
  // Return the PivotTable component if isPivotTable is true
  if (isPivotTable) {
    return (
      <PivotTable
        {...props}
      />
    );
  }

  // Debug logging
  console.log('DataTable Props:', {
    dataLength: data?.length,
    columnsLength: columns?.length,
    grouping,
    sample: data?.slice(0, 2)
  });
  console.log('DataTable Column IDs:', columns.map(col => ({ 
    id: col.id,
    // Use optional chaining for accessorKey which might not exist on all column definitions
    accessorKey: (col as any).accessorKey 
  })));
  console.log('Expanded row groups:', expandedRowGroups);
  
  // Debug the first row data structure if available
  if (data && data.length > 0) {
    console.log('First row raw data:', data[0]);
    console.log('All field keys:', Object.keys(data[0]));
    
    // Check if there are count fields
    const countFields = Object.keys(data[0]).filter(key => key.includes('count'));
    console.log('Count fields:', countFields);
  }
  
  // Debug row rendering
  console.log('Table row model info:', {
    totalRows: table.getFilteredRowModel().rows.length,
    currentPageRows: table.getRowModel().rows.length,
    groupedRows: table.getRowModel().rows.filter(row => row.getIsGrouped()).length,
  });
  
  // Debug the first few rows' data
  const debugRows = table.getRowModel().rows.slice(0, 3);
  console.log('First 3 rows details:', debugRows.map(row => ({
    id: row.id,
    index: row.index,
    isGrouped: row.getIsGrouped(),
    depth: row.depth,
    subRowCount: row.subRows?.length,
    original: row.original
  })));

  return (
    <div className="h-full flex flex-col bg-white rounded-md shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 rounded-md">
          <div className="bg-white p-3 rounded-lg shadow-md flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-indigo-600"></div>
            <span className="text-sm text-slate-600 font-medium">Loading data...</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden rounded-t-md">
        <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th 
                      key={header.id} 
                      className="px-4 py-2.5 text-left text-xs font-medium tracking-wide whitespace-nowrap border-b border-slate-200"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {header.column.getCanGroup() && (
                            <Button
                              onClick={header.column.getToggleGroupingHandler()}
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded-full"
                            >
                              {header.column.getIsGrouped() ? 
                                <TableIcon className="h-3.5 w-3.5 text-primary" /> : 
                                <TableIcon className="h-3.5 w-3.5 text-slate-400" />
                              }
                            </Button>
                          )}
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={header.column.getToggleSortingHandler()}
                              className="ml-1 p-0 h-5 hover:bg-transparent"
                            >
                              <span className="text-slate-400">
                                {{
                                  asc: '▲',
                                  desc: '▼',
                                }[header.column.getIsSorted() as string] ?? '⇅'}
                              </span>
                            </Button>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
              {table?.getRowModel()?.rows.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="py-8 text-center text-slate-500"
                  >
                    No results found
                  </td>
                </tr>
              ) : (
                table?.getRowModel()?.rows.map((row, index) => {
                  // Add debugging for this row
                  if (index === 0 && !hasLoggedSample.current) {
                    console.log('Raw cell value sample:', {
                      value: row.original,
                      columnIds: row.getVisibleCells().map(cell => cell.column.id),
                      types: row.getVisibleCells().map(cell => typeof cell.getValue()),
                      isObjects: row.getVisibleCells().map(cell => typeof cell.getValue() === 'object'),
                      keys: row.getVisibleCells().map(cell => typeof cell.getValue() === 'object' ? Object.keys(cell.getValue() || {}) : [])
                    });
                    hasLoggedSample.current = true;
                  }

                  // Create a unique ID for this group row based on the grouped values
                  const groupRowId = row.getIsGrouped() ? `group-${row.id}` : null;
                  
                  // Check if this is the deepest level of the grouping hierarchy (last level)
                  const isDeepestLevel = row.getIsGrouped() && row.depth === grouping.length - 1;
                  
                  // Check if we should show server-side loaded details for this group
                  // Only show details if this is the deepest level of grouping
                  const shouldShowDetails = groupRowId && 
                                           expandedGroupDetails[groupRowId] && 
                                           row.getIsExpanded() &&
                                           isDeepestLevel;
                  
                  // Determine which group field and value to use for fetching details
                  const groupField = row.getIsGrouped() ? grouping[row.depth] : null;
                  const groupValue = row.getIsGrouped() ? String(row.getValue(grouping[row.depth] || '')) : null;
                  
                  // For multi-level grouping, collect parent group values
                  const parentGroupValues: Record<string, string> = {};
                  
                  if (row.getIsGrouped() && groupField && groupValue) {
                    // Add current group field/value
                    parentGroupValues[groupField] = groupValue;
                    
                    // Track group values for each level of depth
                    if (grouping.length > 1) {
                      // For nested grouping, we need to capture values for each group level
                      for (let i = 0; i < row.depth; i++) {
                        const parentField = grouping[i];
                        if (parentField && row.original[parentField]) {
                          parentGroupValues[parentField] = String(row.original[parentField]);
                        }
                      }
                      
                      console.log('Built parent group values for nested row:', {
                        rowId: row.id,
                        rowDepth: row.depth,
                        grouping,
                        values: parentGroupValues
                      });
                    }
                    
                    // Update hierarchy when a group is expanded
                    if (row.getIsExpanded()) {
                      // Instead of updating state directly, queue this update
                      const updateInfo = {
                        id: groupRowId as string,
                        values: {...parentGroupValues}
                      };
                      
                      // Only queue if not already in state to avoid extra re-renders
                      if (!groupValueHierarchy[groupRowId as string] || 
                          JSON.stringify(groupValueHierarchy[groupRowId as string]) !== JSON.stringify(parentGroupValues)) {
                        // Use a callback-style to prevent this from causing re-renders immediately
                        // This will be processed in the useEffect above
                        setTimeout(() => {
                          setRowsToUpdate(prev => {
                            // Don't add duplicate updates for the same row
                            if (prev.some(item => item.id === updateInfo.id)) {
                              return prev;
                            }
                            return [...prev, updateInfo];
                          });
                        }, 0);
                      }
                    }
                  }
                  
                  // Get the parent group values for this row from state
                  const storedParentValues = groupRowId ? groupValueHierarchy[groupRowId] : undefined;
                  
                  return (
                    <React.Fragment key={row.id}>
                      <tr 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40 transition-colors duration-150 ${row.getIsGrouped() ? 'font-medium bg-slate-100/80' : ''}`}
                      >
                        {row.getVisibleCells().map(cell => {
                          const cellValue = cell.getValue();
                          const isNumber = typeof cellValue === 'number' && !isNaN(cellValue);
                          const isCurrency = cell.column.id.includes('amount') || 
                                          cell.column.id.includes('price') || 
                                          cell.column.id.includes('revenue') ||
                                          (cell.column.id.includes('annual') && cell.column.id.includes('revenue'));
                          const isDate = cell.column.id.includes('date') || cell.column.id.includes('time');
                          
                          // Build the className string based on conditions
                          let className = "px-4 py-2.5 ";
                          
                          // Text alignment
                          if (isNumber || isCurrency) {
                            className += "text-right ";
                          } else if (isDate) {
                            className += "text-left whitespace-nowrap ";
                          } else {
                            className += "text-left ";
                          }
                          
                          // Cell styling based on type
                          if (cell.getIsGrouped()) {
                            className += "bg-slate-100 font-medium text-slate-800 border-l-2 border-l-primary/60 ";
                          } else if (cell.getIsAggregated()) {
                            className += "bg-slate-50 font-medium text-slate-800 ";
                          } else if (cell.getIsPlaceholder()) {
                            className += "";
                          }
                          
                          // Debug a sample of raw cell values for troubleshooting
                          if (index === 0 && !hasLoggedSample.current) {
                            console.log('Raw cell value sample:', {
                              value: cellValue,
                              columnId: cell.column.id,
                              type: typeof cellValue,
                              isObject: typeof cellValue === 'object',
                              keys: typeof cellValue === 'object' ? Object.keys(cellValue || {}) : []
                            });
                            hasLoggedSample.current = true;
                          }

                          return (
                            <td
                              key={cell.id}
                              className={className.trim()}
                            >
                              {cell.getIsGrouped() ? (
                                // If it's a grouped cell, show an expander and row value
                                <div className="flex items-center">
                                  <button
                                    onClick={() => {
                                      console.log('Toggling row expansion:', row.id);
                                      
                                      // First toggle the row expansion
                                      row.toggleExpanded();
                                      
                                      // Then update the detail view state for this group separately
                                      if (groupRowId) {
                                        // Use a callback to ensure latest state
                                        setTimeout(() => {
                                          setExpandedGroupDetails(prev => {
                                            const newState = {...prev};
                                            
                                            // Toggle based on the current expanded state after the toggleExpanded call
                                            if (row.getIsExpanded()) {
                                              newState[groupRowId] = true;
                                            } else {
                                              delete newState[groupRowId];
                                            }
                                            
                                            return newState;
                                          });
                                        }, 0);
                                      }
                                    }}
                                    className="mr-2 text-gray-600 hover:text-gray-900"
                                  >
                                    {row.getIsExpanded() ? '▼' : '▶'}
                                  </button>
                                  <span className="font-medium">
                                    {/* For the grouped cell, show the value that's being grouped by */}
                                    {formatCellValue(row.getValue(cell.column.id))}
                                  </span>
                                  <span className="ml-2 text-xs text-slate-500">
                                    ({row.subRows.length})
                                  </span>
                                </div>
                              ) : cell.getIsAggregated() ? (
                                // For aggregated cells, check for count fields
                                <span>
                                  {(() => {
                                    // Get the column ID without any alias
                                    const columnId = cell.column.id;
                                    
                                    // Check different possible count field patterns
                                    const countField1 = `${columnId}_count`;
                                    const countField2 = columnId.replace('accounts_', 'accounts_') + '_count';
                                    
                                    // Debug aggregated cell to find count fields
                                    console.log(`Aggregated cell for ${columnId}:`, {
                                      columnId,
                                      possibleCountFields: [countField1, countField2],
                                      rowOriginal: row.original,
                                      hasCount1: countField1 in row.original,
                                      hasCount2: countField2 in row.original,
                                      allKeys: Object.keys(row.original)
                                    });
                                    
                                    // Check for both possible count field patterns
                                    if (countField1 in row.original) {
                                      return formatCellValue(row.original[countField1]);
                                    } else if (countField2 in row.original) {
                                      return formatCellValue(row.original[countField2]);
                                    }
                                    
                                    // For any field that has "count" in its name in the original data
                                    const countFields = Object.keys(row.original).filter(key => 
                                      key.includes('count') && key.includes(columnId.replace('accounts_', ''))
                                    );
                                    
                                    if (countFields.length > 0) {
                                      return formatCellValue(row.original[countFields[0]]);
                                    }
                                    
                                    // Fall back to the regular aggregation function
                                    return formatCellValue(
                                      flexRender(
                                        cell.column.columnDef.aggregatedCell ??
                                          cell.column.columnDef.cell,
                                        cell.getContext()
                                      )
                                    );
                                  })()}
                                </span>
                              ) : cell.getIsPlaceholder() ? null : (
                                // For regular cell values
                                formatCellValue(cell.getValue())
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Add the GroupDetailView component if this group is expanded */}
                      {shouldShowDetails && groupRowId && groupField && groupValue && (
                        <tr>
                          <td colSpan={columns.length} className="p-0 border-b">
                            <div className="bg-slate-50 py-2 px-8">
                              <GroupDetailView
                                groupField={groupField}
                                groupValue={groupValue}
                                groupLabel={columns.find(col => col.id === groupField)?.header?.toString() || groupField}
                                fetchDetailData={(field, value, page, pageSize) => 
                                  // Pass the generatedSql from props if available
                                  fetchGroupDetailRecords(
                                    field, 
                                    value, 
                                    page, 
                                    pageSize,
                                    generatedSql,
                                    cteQuery,
                                    {
                                      selectedReportType,
                                      selectedColumns,
                                      filters,
                                      filterLogic,
                                      groupByFields: grouping || [],
                                      isPivotActive: isPivotTable || false,
                                      pivotColumnIds: pivotColumns || [],
                                      pivotValues: pivotValues || [],
                                      selectedAggregations
                                    },
                                    storedParentValues || parentGroupValues
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add pagination controls - ensure it's not part of the scrollable area */}
      <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-slate-500">
            {table.getFilteredRowModel().rows.length > 0 ? (
              <>
                Showing{' '}
                <span className="font-medium text-slate-700">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-700">
                  {totalRows || table.getFilteredRowModel().rows.length}
                </span>{' '}
                results
              </>
            ) : (
              "No results to display"
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              setPagination({
                ...pagination,
                pageSize: Number(value),
              });
            }}
          >
            <SelectTrigger className="w-[110px] h-8 bg-white text-xs">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={!table.getCanPreviousPage() || table.getFilteredRowModel().rows.length === 0}
              className="h-8 bg-white"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronLeftIcon className="h-3 w-3 mr-1" />
              <ChevronLeftIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage() || table.getFilteredRowModel().rows.length === 0}
              className="h-8 bg-white"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-3 w-3" />
            </Button>
            <span className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Page</span>{' '}
              <span className="font-medium">{pagination.pageIndex + 1}</span> of{' '}
              <span className="font-medium">{pageCount || 1}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage() || table.getFilteredRowModel().rows.length === 0}
              className="h-8 bg-white"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }))}
              disabled={!table.getCanNextPage() || table.getFilteredRowModel().rows.length === 0 || pageCount <= 1}
              className="h-8 bg-white"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronRightIcon className="h-3 w-3 mr-1" />
              <ChevronRightIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}