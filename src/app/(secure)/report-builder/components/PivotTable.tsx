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

    // Helper to determine if a column is a percentage
    const isPercentColumn = (columnId: string) => {
        const percentPatterns = [
            'percent', 'rate', 'ratio', 'margin', 'growth', 
            'change', 'discount', 'tax', 'commission'
        ];
        
        return percentPatterns.some(pattern => 
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

        // Function to determine if a column is a dimension/row identifier
        const isDimensionColumn = (index: number, columnName: string) => {
            if (index < (rowFields?.length || 0)) return true; // First N columns are dimensions

            // Also check if the column name contains typical dimension names
            const dimensionPatterns = ['id', 'name', 'category', 'type', 'group', 'segment', 'year', 'quarter', 'month'];
            return dimensionPatterns.some(pattern => columnName.toLowerCase().includes(pattern.toLowerCase()));
        };

        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full border-collapse font-inter text-sm">
                        <thead>
                            <tr>
                                {sortedColumns.map((columnName, index) => {
                                    const isFirstColumn = index === 0;
                                    const isDimension = isDimensionColumn(index, columnName);
                                    const formattedHeader = formatColumnHeader(columnName);
                                    
                                    // Multi-part header handling
                                    const isMultiPart = formattedHeader.includes(':') || formattedHeader.includes('-');
                                    let [mainLabel, subLabel] = ['', ''];
                                    
                                    if (isMultiPart) {
                                        const parts = formattedHeader.includes(':') ? 
                                            formattedHeader.split(':') : 
                                            formattedHeader.split('-');
                                            
                                        mainLabel = parts[0].trim();
                                        subLabel = parts.slice(1).join('-').trim();
                                    }
                                    
                                    return (
                                        <th key={columnName} 
                                            className={`
                                                px-3 py-2.5 
                                                font-medium 
                                                text-xs 
                                                tracking-wide 
                                                whitespace-nowrap 
                                                border-b-2 
                                                ${isDimension 
                                                    ? 'text-left bg-slate-50 border-slate-200 text-slate-700' 
                                                    : 'text-right bg-indigo-50/40 border-indigo-200 text-indigo-900'}
                                                ${isFirstColumn ? 'sticky left-0 z-10' : ''}
                                            `}
                                        >
                                            {isMultiPart ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{mainLabel}</span>
                                                    <span className="text-[10px] opacity-75 mt-0.5">{subLabel}</span>
                                                </div>
                                            ) : (
                                                <span>{formattedHeader}</span>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {data.map((row, rowIndex) => {
                                // Calculate row depth based on recurring values in dimension columns
                                let depth = 0;
                                if (rowIndex > 0) {
                                    // Look at dimension columns only
                                    for (let i = 0; i < Math.min(sortedColumns.length, rowFields?.length || 0); i++) {
                                        if (row[sortedColumns[i]] === data[rowIndex-1][sortedColumns[i]]) {
                                            depth++;
                                        } else {
                                            break;
                                        }
                                    }
                                }
                                
                                return (
                                    <tr 
                                        key={rowIndex} 
                                        className={`
                                            hover:bg-blue-50/30 
                                            transition-colors 
                                            duration-150
                                            ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                                            ${depth > 0 ? 'border-t-0' : ''}
                                        `}
                                    >
                                        {sortedColumns.map((columnName, colIndex) => {
                                            const value = row[columnName];
                                            const isFirstColumn = colIndex === 0;
                                            const isDimension = isDimensionColumn(colIndex, columnName);
                                            const isNull = value === null || value === undefined;
                                            const isNumber = typeof value === 'number';
                                            const isCurrency = isNumber && isCurrencyColumn(columnName);
                                            const isPercent = isNumber && isPercentColumn(columnName);
                                            
                                            // Hide repeated values based on depth - only for dimension columns
                                            const isRepeated = depth > 0 && colIndex < depth && isDimension;
                                            
                                            // Background color for dimension columns
                                            const bgColor = rowIndex % 2 === 0 
                                                ? (isDimension ? 'bg-white' : '') 
                                                : (isDimension ? 'bg-slate-50/30' : '');
                                            
                                            // Format cell content based on data type
                                            let cellContent;
                                            if (isNull || isRepeated) {
                                                cellContent = <span className="text-slate-300">—</span>;
                                            } else if (isCurrency) {
                                                const valueNum = Number(value);
                                                const absValue = Math.abs(valueNum);
                                                
                                                // Format with K/M/B suffixes for large numbers
                                                let formattedValue = '';
                                                if (absValue >= 1e9) {
                                                    formattedValue = `$${(valueNum / 1e9).toFixed(1)}B`;
                                                } else if (absValue >= 1e6) {
                                                    formattedValue = `$${(valueNum / 1e6).toFixed(1)}M`;
                                                } else if (absValue >= 1e3) {
                                                    formattedValue = `$${(valueNum / 1e3).toFixed(1)}K`;
                                                } else {
                                                    formattedValue = new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0
                                                    }).format(valueNum);
                                                }
                                                
                                                const textColor = valueNum < 0 ? 'text-red-600' : 'text-emerald-700';
                                                cellContent = <span className={textColor}>{formattedValue}</span>;
                                            } else if (isPercent) {
                                                const valueNum = Number(value);
                                                const textColor = valueNum < 0 ? 'text-red-600' : 
                                                                 valueNum > 0 ? 'text-emerald-700' : '';
                                                
                                                cellContent = <span className={textColor}>
                                                    {valueNum.toFixed(1)}%
                                                </span>;
                                            } else if (isNumber) {
                                                // For decimal values, show 1 decimal place
                                                const valueNum = Number(value);
                                                const absValue = Math.abs(valueNum);
                                                
                                                let formattedValue = '';
                                                if (absValue >= 1e9) {
                                                    formattedValue = `${(valueNum / 1e9).toFixed(1)}B`;
                                                } else if (absValue >= 1e6) {
                                                    formattedValue = `${(valueNum / 1e6).toFixed(1)}M`;
                                                } else if (absValue >= 1e3) {
                                                    formattedValue = `${(valueNum / 1e3).toFixed(1)}K`;
                                                } else {
                                                    // Number value is small, show as is
                                                    formattedValue = valueNum.toLocaleString();
                                                }
                                                
                                                cellContent = formattedValue;
                                            } else {
                                                cellContent = value;
                                            }

                                            return (
                                                <td 
                                                    key={columnName} 
                                                    className={`
                                                        px-3 py-2 
                                                        text-xs
                                                        whitespace-nowrap 
                                                        ${isDimension ? 'text-left' : 'text-right'} 
                                                        ${isDimension && isFirstColumn ? 'font-medium text-slate-800' : ''} 
                                                        ${isDimension && !isFirstColumn ? 'text-slate-600' : ''}
                                                        ${isNumber && !isDimension ? 'font-medium text-slate-900' : ''}
                                                        ${isNull || isRepeated ? 'text-slate-300' : ''} 
                                                        ${isFirstColumn ? `sticky left-0 z-10 ${bgColor}` : ''}
                                                    `}
                                                >
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer with data summary */}
                <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
                    <div>
                        Showing {data.length} rows
                    </div>
                    <div className="flex items-center">
                        <PivotTableIcon className="h-3 w-3 mr-1 text-indigo-400" />
                        <span>Pivot View</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 rounded-md">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-8 bg-indigo-200 rounded-full mb-2"></div>
                        <div className="text-xs text-slate-500">Loading data...</div>
                    </div>
                </div>
            )}

            {!hasData && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400">
                    <PivotTableIcon className="h-10 w-10 mb-3 text-slate-300" />
                    <div className="text-sm mb-1">No data to display</div>
                    <div className="text-xs text-slate-400">
                        Apply filters or configure your pivot table to see data
                    </div>
                </div>
            )}

            {hasData && renderPivotTable()}
        </div>
    );
} 