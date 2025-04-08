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
      <div className="h-full flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-auto flex-1">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full table-fixed divide-y divide-border">
                <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-border">
                      {headerGroup.headers.map((header) => (
                        <th 
                          key={header.id} 
                          className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center gap-2">
                              {header.column.getCanGroup() && (
                                <Button
                                  onClick={header.column.getToggleGroupingHandler()}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                >
                                  {header.column.getIsGrouped() ? 
                                    <TableIcon className="h-4 w-4 text-primary" /> : 
                                    <TableIcon className="h-4 w-4 text-muted-foreground/40" />
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
                                  <span className="text-muted-foreground">
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
                <tbody className="divide-y divide-border bg-card text-card-foreground">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.length} 
                        className="py-6 text-center text-muted-foreground"
                      >
                        No results found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 text-sm ${cell.getIsGrouped()
                              ? 'bg-primary/5 font-medium'
                              : cell.getIsAggregated()
                                ? 'bg-muted/20 font-medium'
                                : cell.getIsPlaceholder()
                                  ? 'bg-muted/10'
                                  : ''
                              }`}
                            style={{ width: cell.column.getSize() }}
                          >
                            {cell.getIsGrouped() ? (
                              <Button
                                onClick={row.getToggleExpandedHandler()}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 -ml-2 px-2 h-7 hover:bg-primary/10 font-medium"
                              >
                                <ChevronRightIcon 
                                  className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`} 
                                />
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                                {showRowCounts && (
                                  <span className="ml-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                                    {row.subRows.length}
                                  </span>
                                )}
                              </Button>
                            ) : cell.getIsAggregated() ? (
                              flexRender(
                                cell.column.columnDef.aggregatedCell ??
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : cell.getIsPlaceholder() ? null : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Add pagination controls - ensure it's not part of the scrollable area */}
        <div className="flex items-center justify-between px-2 py-3 border-t border-border mt-auto">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalRows > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">{totalRows}</span>{' '}
                results
              </>
            ) : (
              'No results'
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Rows per page</p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  setPagination({ pageIndex: 0, pageSize: Number(value) });
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                <NavigationIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <div className="text-sm mx-2">
                <span className="font-medium">{pagination.pageIndex + 1}</span> / <span>{pageCount || 1}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={pagination.pageIndex === pageCount - 1 || pageCount === 0}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: pageCount - 1 }))}
                disabled={pagination.pageIndex === pageCount - 1 || pageCount === 0}
              >
                <span className="sr-only">Go to last page</span>
                <NavigationIcon className="rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }