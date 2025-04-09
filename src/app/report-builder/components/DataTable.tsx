// Add DataTable component

import { flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableProps } from "../model/DataTableProps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, TableIcon } from "@/components/icons";
import { NavigationIcon } from "@/components/icons/ReportIcons";

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
      isLoading
    } = props;
  
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
      <div className="h-full flex flex-col bg-white rounded-md shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm rounded-md">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
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
                        className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap border-b border-slate-200 first:rounded-tl-md"
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      className="py-8 text-center text-slate-500"
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-100/60 hover:shadow-inner transition-all duration-200 ease-in-out cursor-default`}
                    >
                      {row.getVisibleCells().map(cell => {
                        // Determine if the cell contains a number, date or currency
                        const cellValue = cell.getValue();
                        const isNumber = typeof cellValue === 'number' && !isNaN(cellValue);
                        const isCurrency = cell.column.id.includes('amount') || cell.column.id.includes('price') || cell.column.id.includes('revenue');
                        const isDate = cell.column.id.includes('date') || cell.column.id.includes('time');
                        
                        // Set appropriate text alignment based on content type
                        let textAlignment = '';
                        if (isNumber || isCurrency) {
                          textAlignment = 'text-right';
                        } else if (isDate) {
                          textAlignment = 'text-left whitespace-nowrap';
                        }
                        
                        // Use different styles based on cell type
                        const cellStyle = cell.getIsGrouped()
                          ? 'bg-slate-100 border-l-2 border-l-primary/60'
                          : cell.getIsAggregated()
                            ? 'bg-slate-50 font-medium text-slate-700'
                            : cell.getIsPlaceholder()
                              ? ''
                              : '';
                              
                        return (
                          <td
                            key={cell.id}
                            className={`px-4 py-2 text-sm ${textAlignment} ${cellStyle} ${index === table.getRowModel().rows.length - 1 ? 'border-b border-slate-200' : ''}`}
                            style={{ width: cell.column.getSize() }}
                          >
                            {cell.getIsGrouped() ? (
                              <div className="flex items-center">
                                <Button
                                  onClick={row.getToggleExpandedHandler()}
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center -ml-2 px-2 py-0.5 rounded-md hover:bg-white/80 hover:shadow-sm text-slate-700"
                                >
                                  <ChevronRightIcon 
                                    className={`h-3.5 w-3.5 mr-1.5 transition-transform text-primary/80 ${row.getIsExpanded() ? 'rotate-90' : ''}`} 
                                  />
                                  <span className="font-medium">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </span>
                                  {showRowCounts && (
                                    <span className="ml-2 text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                                      {row.subRows.length}
                                    </span>
                                  )}
                                </Button>
                              </div>
                            ) : cell.getIsAggregated() ? (
                              <span className="font-medium">
                                {flexRender(
                                  cell.column.columnDef.aggregatedCell ??
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </span>
                            ) : cell.getIsPlaceholder() ? null : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Add pagination controls - ensure it's not part of the scrollable area */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/70 rounded-b-md">
          <div className="flex-1 text-sm text-slate-500">
            {totalRows > 0 ? (
              <>
                <span className="font-medium text-slate-700">
                  {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-700">{totalRows}</span>{' '}
                results
              </>
            ) : (
              'No results'
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-xs text-slate-500">Rows per page</p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  setPagination({ pageIndex: 0, pageSize: Number(value) });
                }}
              >
                <SelectTrigger className="h-7 w-[65px] text-xs bg-white border-slate-200">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 p-0 flex items-center justify-center bg-white border-slate-200 text-slate-600 rounded-md"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 p-0 flex items-center justify-center bg-white border-slate-200 text-slate-600 rounded-md"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }