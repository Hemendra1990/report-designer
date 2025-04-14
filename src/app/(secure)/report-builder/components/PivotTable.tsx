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
import {PivotTableIcon} from "@/components/icons/ReportIcons";
import {useMemo} from "react";

export function PivotTable<TData extends Record<string, any>>(props: DataTableProps<TData>) {
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
        pageCount,
        totalRows,
        isLoading,
        pivotColumns = [],
        pivotValues = [],
        grouping = [],
        groupByFields = [], // Use this for row fields in pivot
    } = props;

    // Check if we have data to display
    const hasData = useMemo(() => {
        return data && data.length > 0;
    }, [data]);
    
    // Debug log what fields we're receiving
    console.log('PivotTable received props:', {
        pivotColumns,
        pivotValues,
        grouping,
        groupByFields,
        hasData
    });

    // Initialize the table
    const table = useReactTable({
        data: data || [],
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Helper function to determine if a column likely contains currency values
    const isCurrencyColumn = (columnId: string) => {
        // Check for common patterns in column names that might indicate currency
        const currencyPatterns = [
            'amount', 'price', 'cost', 'revenue', 'sale', 'budget',
            'income', 'expense', 'payment', 'fee', 'charge', 'balance'
        ];
        
        return currencyPatterns.some(pattern => 
            columnId.toLowerCase().includes(pattern)
        );
    };

    // Render the pivot table directly from the data received from DuckDB
    const renderPivotTable = () => {
        if (!hasData) return null;

        const firstRow = data[0];
        const allColumns = Object.keys(firstRow);
        
        console.log('Available columns in data:', allColumns);
        
        // Create a prioritized array to hold our sorted columns
        let sortedColumns: string[] = [];
        
        // First try to use groupByFields (from pivot configuration)
        const rowFields = groupByFields && groupByFields.length > 0 
            ? groupByFields  // Use the fields selected in pivot config
            : grouping;      // Fall back to regular grouping if needed
            
        console.log('Using row fields for column ordering:', rowFields);
        
        // Step 1: Process row fields first in their original order
        if (rowFields && rowFields.length > 0) {
            rowFields.forEach(field => {
                // Try exact match first
                const exactMatch = allColumns.find(col => col === field);
                if (exactMatch) {
                    sortedColumns.push(exactMatch);
                    return;
                }
                
                // Then try partial matches - especially for fields like "country" matching "accounts - country"
                const partialMatches = allColumns.filter(col => {
                    if (sortedColumns.includes(col)) return false; // Skip already matched columns
                    
                    const colLower = col.toLowerCase();
                    const fieldLower = field.toLowerCase();
                    
                    return colLower.includes(fieldLower);
                });
                
                if (partialMatches.length > 0) {
                    // Sort by length - shorter matches are usually better
                    partialMatches.sort((a, b) => a.length - b.length);
                    sortedColumns.push(partialMatches[0]);
                }
            });
        }
        
        // Step 2: Add remaining columns
        allColumns.forEach(col => {
            if (!sortedColumns.includes(col)) {
                sortedColumns.push(col);
            }
        });
        
        console.log('Final column order:', sortedColumns);

        // Format column header for display
        const formatColumnHeader = (columnName: string) => {
            // Handle struct-type column headers from multi-column pivots
            // Example: {'category': 'Clothing', 'region': 'North'}
            if (columnName.startsWith('{') && columnName.endsWith('}')) {
                // Use simple string manipulation instead of JSON parsing
                return columnName
                    .replace(/[{}']/g, '')  // Remove braces and single quotes
                    .replace(/:/g, ': ')    // Add space after colons
                    .replace(/,/g, ', ');   // Add space after commas
            }
            
            // Handle simple underscore-separated column names
            // Example: 2022_Jan or category_region
            if (columnName.includes('_')) {
                return columnName.split('_').join(' - ');
            }
            
            // Default case - just replace underscores with spaces
            return columnName.replace(/_/g, ' ');
        };

        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/40">
                                {sortedColumns.map((columnName, index) => {
                                    const isFirstColumn = index === 0;
                                    // Apply different styling for the first column vs pivot columns
                                    return (
                                        <th key={columnName} 
                                            className={`px-4 py-3 text-xs font-medium tracking-wide whitespace-nowrap border-b border-indigo-200 ${
                                                isFirstColumn 
                                                ? 'text-left sticky left-0 z-10 bg-gradient-to-r from-slate-50 to-indigo-50/40' 
                                                : 'text-right bg-gradient-to-b from-indigo-50/30 to-white'
                                            }`}
                                        >
                                            {formatColumnHeader(columnName)}
                                    </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {data.map((row, rowIndex) => (
                                <tr 
                                    key={rowIndex} 
                                    className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-indigo-50/10'} hover:bg-indigo-50/30 transition-colors duration-150`}
                                >
                                    {sortedColumns.map((columnName, colIndex) => {
                                        const value = row[columnName];
                                        const isFirstColumn = colIndex === 0;
                                        const isNull = value === null || value === undefined;
                                        const isNumber = typeof value === 'number';
                                        const isCurrency = isNumber && isCurrencyColumn(columnName);
                                        
                                        // Background color for first column
                                        const bgColor = rowIndex % 2 === 0 ? 'bg-white' : 'bg-indigo-50/10';
                                        
                                        // Format cell content based on data type
                                        let cellContent;
                                        if (isNull) {
                                            cellContent = <span className="text-slate-300">—</span>;
                                        } else if (isCurrency) {
                                            cellContent = new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }).format(value);
                                        } else if (isNumber) {
                                            // For decimal values, show 2 decimal places
                                            const decimalPlaces = Number.isInteger(value) ? 0 : 2;
                                            cellContent = new Intl.NumberFormat('en-US', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: decimalPlaces
                                            }).format(value);
                                        } else {
                                            cellContent = value;
                                        }

                                        return (
                                            <td 
                                                key={columnName} 
                                                className={`px-4 py-3 whitespace-nowrap ${
                                                    isFirstColumn 
                                                    ? `text-left font-medium text-indigo-700 sticky left-0 z-10 ${bgColor}` 
                                                    : isNumber ? 'text-right font-medium' : 'text-left'
                                                } ${isNull ? 'text-slate-300' : ''}`}
                                            >
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 rounded-md">
                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-indigo-600"></div>
                        <span className="text-sm text-slate-600 font-medium">Loading pivot data...</span>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-indigo-100">
                <div className="px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <PivotTableIcon className="h-5 w-5 text-indigo-500" />
                            <span className="font-medium text-indigo-700">Pivot View</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center text-xs">
                            <span className="text-slate-500 mr-2 font-medium">Values:</span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {pivotValues.map(pv => {
                                    const col = columns.find(c => c.id === pv);
                                    const displayName = col ? (typeof col.header === 'string' ? col.header : pv) : pv;
                                    return (
                                        <span key={pv} className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-xs border border-emerald-200">
                                            {displayName}
                                        </span>
                                    );
                                })}
                                {pivotValues.length === 0 && (
                                    <span className="text-slate-400 italic">None selected</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-xs">
                            <span className="text-slate-500 mr-2 font-medium">Columns:</span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {pivotColumns.map(pc => {
                                    const col = columns.find(c => c.id === pc);
                                    const displayName = col ? (typeof col.header === 'string' ? col.header : pc) : pc;
                                    return (
                                        <span key={pc} className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs border border-amber-200">
                                            {displayName}
                                        </span>
                                    );
                                })}
                                {pivotColumns.length === 0 && (
                                    <span className="text-slate-400 italic">None selected</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simply render the data as received from DuckDB */}
            {hasData ? (
                renderPivotTable()
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50/50">
                    <div className="flex flex-col items-center gap-3 max-w-md p-8">
                                                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    <PivotTableIcon className="h-8 w-8 text-indigo-400" />
                                                </div>
                                                <p className="text-lg font-medium text-indigo-600 mt-3">No pivot data available</p>
                        <p className="text-sm text-slate-400 text-center">
                                                    {pivotColumns.length === 0
                                                        ? "Add pivot columns and values in the Pivot section to see your data transformed"
                                                        : "Try selecting different pivot columns or values to see results"}
                                                </p>
                    </div>
                </div>
            )}

            {/* Pagination controls */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/20">
                <div className="flex items-center">
                    <span className="text-xs text-slate-500">
                        {hasData ? (
                            <span className="text-indigo-600">
                                <span className="font-medium">Pivot view</span>: {data.length} rows
                            </span>
                        ) : (
                            <>
                                <span className="text-indigo-600">
                                    <span className="font-medium">Pivot mode</span> -
                                    {pivotColumns.length === 0
                                        ? " Please select pivot columns in the Pivot section"
                                        : " Data is grouped by pivot columns"}
                                </span>
                            </>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {hasData && (
                        <>
                            <Select
                                value={pagination.pageSize.toString()}
                                onValueChange={(value) => {
                                    setPagination({
                                        ...pagination,
                                        pageSize: Number(value),
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[110px] h-8 bg-white text-xs border border-indigo-200 shadow-sm">
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
                                    disabled={pagination.pageIndex === 0}
                                    className="h-8 bg-white border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronLeftIcon className="h-3 w-3 mr-1" />
                                    <ChevronLeftIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                                    disabled={pagination.pageIndex === 0}
                                    className="h-8 bg-white border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeftIcon className="h-3 w-3" />
                                </Button>
                                <span className="flex items-center gap-1 px-3 h-8 text-xs bg-indigo-50 border border-indigo-200 rounded shadow-sm">
                                    <span className="text-indigo-600">Page</span>{' '}
                                    <span className="font-medium text-indigo-700">{pagination.pageIndex + 1}</span> of{' '}
                                    <span className="font-medium">{pageCount || 1}</span>
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                                    disabled={pagination.pageIndex >= (pageCount - 1)}
                                    className="h-8 bg-white border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRightIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }))}
                                    disabled={pagination.pageIndex >= (pageCount - 1)}
                                    className="h-8 bg-white border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronRightIcon className="h-3 w-3 mr-1" />
                                    <ChevronRightIcon className="h-3 w-3" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 