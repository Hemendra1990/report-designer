// Add DataTable component

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
      showRowCounts,
      showDetailRows,
      grouping,
      onGroupingChange,
      expandedRowGroups,
      setExpandedRowGroups,
      pageCount,
      totalRows,
      isLoading,
      isPivotTable = false,
      pivotColumns = [],
      pivotValues = []
    } = props;
  
    // If it's a pivot table, use the PivotTable component
    if (isPivotTable) {
      return <PivotTable {...props} />;
    }

    // Initialize the table with grouping support
    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
        grouping,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      onGroupingChange,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    });

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
                  table?.getRowModel()?.rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40 transition-colors duration-150`}
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
                        
                        return (
                          <td
                            key={cell.id}
                            className={className.trim()}
                          >
                            {cell.getIsGrouped() ? (
                              // If it's a grouped cell, show an expander and row value
                              <div className="flex items-center">
                                <button
                                  onClick={row.getToggleExpandedHandler()}
                                  className="mr-2"
                                >
                                  {row.getIsExpanded() ? '▼' : '▶'}
                                </button>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                                <span className="ml-2 text-xs text-slate-500">
                                  ({row.subRows.length})
                                </span>
                              </div>
                            ) : cell.getIsAggregated() ? (
                              // If the cell is aggregated, use the aggregatorFn
                              flexRender(
                                cell.column.columnDef.aggregatedCell ??
                                  cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : cell.getIsPlaceholder() ? null : (
                              // For regular cell values
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
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