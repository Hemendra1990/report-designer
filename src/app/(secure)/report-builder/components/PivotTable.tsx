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
import { DataTableProps } from "../model/DataTableProps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, TableIcon } from "@/components/icons";
import { PivotTableIcon } from "@/components/icons/ReportIcons";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

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
        showRowCounts,
        showDetailRows,
        grouping,
        onGroupingChange,
        expandedRowGroups,
        setExpandedRowGroups,
        pageCount,
        totalRows,
        isLoading,
        pivotColumns = [],
        pivotValues = []
    } = props;

    // Process flattened pivot data if needed
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return data;

        // Check if the data is in a flattened pivot format
        // (single object with many columns as properties)
        const firstItem = data[0];
        const isFlattenedPivot = Object.keys(firstItem).length > 20; // Arbitrary threshold

        // If this is pre-calculated pivot data from the server, return it as is
        // We'll handle it in the renderFlattenedPivotView function
        if (isFlattenedPivot) {
            return data;
        }

        return data;
    }, [data]);

    // Special handling for flattened pivot data
    const processedColumns = useMemo(() => {
        if (!data || data.length === 0 || columns.length > 0) return columns;

        // For flattened pivot data, we don't need to create columns as we'll render
        // it directly in the renderFlattenedPivotView function
        const firstItem = data[0];
        const isFlattenedPivot = Object.keys(firstItem).length > 20;
        
        if (isFlattenedPivot) {
            return columns; // Use columns from props
        }

        return columns;
    }, [columns, data]);

    // Initialize the table with grouping support - using processed data and columns
    const table = useReactTable({
        data: processedData,
        columns: processedColumns.length > 0 ? processedColumns : columns,
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

    // Helper function to identify pivot-related columns
    const isPivotColumn = (columnId: string) => {
        // For DuckDB pivot columns, they typically look like this:
        // <aggregation_function>(<pivot_value>)
        // Example: SUM(New York), SUM(London)

        // First check exact pivotColumns match
        if (pivotColumns.includes(columnId)) return true;

        // Check if it's an aggregation function applied to a value
        if (/^(SUM|AVG|COUNT|MIN|MAX)\(.+\)$/i.test(columnId)) return true;

        // Check if it's a pivoted column with a specific value
        return pivotColumns.some(pc => {
            // Check various patterns - city names or other values might appear inside parentheses
            return columnId.includes(`(${pc})`) || // e.g., SUM(city)
                columnId.includes(`_${pc}`) ||  // e.g., field_city
                columnId.startsWith(`${pc}_`);  // e.g., city_value
        });
    };

    // Get the number of row header columns (non-pivot) and pivot columns
    const rowHeaderColumns = table.getHeaderGroups()[0].headers.filter(h => !isPivotColumn(h.id));

    const pivotDataColumns = table.getHeaderGroups()[0].headers.filter(h => isPivotColumn(h.id));

    // Function to extract the pivot value from a column ID
    const extractPivotValue = (columnId: string) => {
        // Try to match aggregation function pattern: SUM(New York)
        const funcMatch = columnId.match(/^([A-Z]+)\((.+)\)$/i);
        if (funcMatch) {
            // Return the value inside the parentheses (e.g., "New York" from "SUM(New York)")
            return funcMatch[2];
        }

        // Try other patterns
        for (const pc of pivotColumns) {
            if (columnId.startsWith(`${pc}_`)) {
                return columnId.substring(pc.length + 1);
            }
            if (columnId.includes(`_${pc}`)) {
                const parts = columnId.split(`_${pc}`);
                return pc; // Return the pivot column itself
            }
        }

        return columnId;
    };

    // Get pivot value display names for header
    const getPivotValueNames = () => {
        if (!pivotValues || pivotValues.length === 0) return '';

        return pivotValues.map(pv => {
            const col = columns.find(c => c.id === pv);
            return col ? (typeof col.header === 'string' ? col.header : pv) : pv;
        }).join(', ');
    };

    // Returns formatted values for the pivot columns with proper styling
    const formatPivotHeader = (header: any) => {
        if (!isPivotColumn(header.id)) return header.column.columnDef.header;

        const originalHeader = typeof header.column.columnDef.header === 'string'
            ? header.column.columnDef.header
            : header.id;

        // For columns like SUM(New York), show a better formatted header
        const funcMatch = originalHeader.match(/^([A-Z]+)\((.+)\)$/i);
        if (funcMatch) {
            const aggregation = funcMatch[1];
            const value = funcMatch[2];

            return (
                <div className="flex flex-col justify-center items-center">
                    <span className="font-medium text-emerald-700">{value}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full mt-1">
                        {aggregation}
                    </span>
                </div>
            );
        }

        // Get the pivot value part of the column ID if it's not a function pattern
        const pivotValue = extractPivotValue(originalHeader);

        // Default formatting for other patterns
        return (
            <div className="flex flex-col items-center">
                <span className="font-medium text-emerald-700">{pivotValue}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full mt-1">
                    {originalHeader.split('_')[0] || ''}
                </span>
            </div>
        );
    };

    // Function to determine cell styling based on pivot status and content
    const getCellClassName = (cell: any) => {
        const cellValue = cell.getValue();
        const isNumber = typeof cellValue === 'number' && !isNaN(cellValue);
        const isCurrency = cell.column.id.includes('amount') ||
            cell.column.id.includes('price') ||
            cell.column.id.includes('revenue') ||
            (cell.column.id.includes('annual') && cell.column.id.includes('revenue'));
        const isDate = cell.column.id.includes('date') || cell.column.id.includes('time');
        const isPivot = isPivotColumn(cell.column.id);

        // Build the className string based on conditions
        let className = "px-4 py-3 ";

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
            className += "bg-indigo-50/80 font-medium text-indigo-700 border-l border-indigo-300 ";
        } else if (cell.getIsAggregated()) {
            className += "bg-indigo-50/70 font-medium text-indigo-800 ";
        } else if (cell.getIsPlaceholder()) {
            className += "";
        } else if (isPivot) {
            // For non-empty pivot cells, use a more subtle styling
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                className += "bg-emerald-50/60 border-l border-emerald-100 ";

                // Additional styling for numeric pivot cells
                if (isNumber || isCurrency) {
                    className += "font-medium text-emerald-700 ";
                }
            } else {
                // For empty pivot cells, use a more subtle styling
                className += "bg-slate-50/30 border-l border-slate-100 ";
            }
        }

        return className.trim();
    };

    // Update the formatCellContent function to enhance cell formatting
    const formatCellContent = (cell: any, row: any) => {
        const cellValue = cell.getValue();
        const isNumber = typeof cellValue === 'number' && !isNaN(cellValue);
        const isCurrency = cell.column.id.includes('amount') ||
            cell.column.id.includes('price') ||
            cell.column.id.includes('revenue') ||
            (cell.column.id.includes('annual') && cell.column.id.includes('revenue'));
        const isPivot = isPivotColumn(cell.column.id);

        // If it's a group cell, render with appropriate indicators
        if (cell.getIsGrouped()) {
            return (
                <div className="flex items-center">
                    <button
                        onClick={row.getToggleExpandedHandler()}
                        className="mr-2 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                    >
                        {row.getIsExpanded() ? '▼' : '▶'}
                    </button>
                    <span className="font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                        {row.subRows.length}
                    </span>
                </div>
            );
        }

        // For pivot cells with numeric values, add special formatting
        if (isPivot && (isNumber || isCurrency)) {
            if (isCurrency && isNumber) {
                return (
                    <div className="font-medium text-emerald-700">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(cellValue)}
                    </div>
                );
            } else if (isNumber) {
                return (
                    <div className="font-medium text-emerald-700">
                        {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                        }).format(cellValue)}
                    </div>
                );
            }
        }

        // For aggregated cells
        if (cell.getIsAggregated()) {
            const formattedValue = flexRender(
                cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                cell.getContext()
            );

            // If it's a number, add extra formatting
            if (typeof formattedValue === 'number') {
                if (isCurrency) {
                    return (
                        <div className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(formattedValue)}
                        </div>
                    );
                } else {
                    return (
                        <div className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                            {new Intl.NumberFormat('en-US').format(formattedValue)}
                        </div>
                    );
                }
            }

            return formattedValue;
        }

        // For placeholder cells
        if (cell.getIsPlaceholder()) {
            return null;
        }

        // Default rendering
        return flexRender(cell.column.columnDef.cell, cell.getContext());
    };

    // Check if we have flattened pivot data
    const isFlattenedPivot = useMemo(() => {
        if (!data || data.length === 0) return false;
        const firstItem = data[0];
        return Object.keys(firstItem).length > 20; // Same arbitrary threshold
    }, [data]);

    // Extract pivot data rows
    const pivotRowsData = useMemo(() => {
        if (!isFlattenedPivot || !data || data.length === 0) {
            return [];
        }

        // Process all data rows, not just the first one
        return data.map(item => {
            // Find the identifier column (state/region/country)
            const identifierColumn = Object.entries(item)
                .find(([key, value]) =>
                    key.includes('state') ||
                    key.includes('country') ||
                    key.includes('region') ||
                    key.startsWith('accounts_')
                );

            const identifierKey = identifierColumn ? identifierColumn[0] : null;
            const identifierValue = identifierColumn ? identifierColumn[1] : null;

            // Get other columns and their values
            const valueEntries = Object.entries(item)
                .filter(([key]) => key !== identifierKey);

            // Create a structured row object
            return {
                identifier: { key: identifierKey, value: identifierValue },
                values: valueEntries.reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, any>)
            };
        });
    }, [isFlattenedPivot, data]);

    // Add a function to get column highlight classes
    const getHighlightedColumnClass = (columnId: string) => {
        const columnIndex = table.getHeaderGroups()[0].headers.findIndex(h => h.id === columnId);
        // More elegant color classes with better hover effects
        const colorClasses = [
            'hover:bg-indigo-50/60',
            'hover:bg-emerald-50/60',
            'hover:bg-amber-50/60',
            'hover:bg-rose-50/60',
            'hover:bg-sky-50/60',
        ];

        return colorClasses[columnIndex % colorClasses.length];
    };

    // Update the renderFlattenedPivotView function with fixed column widths
    const renderFlattenedPivotView = () => {
        if (!isFlattenedPivot || pivotRowsData.length === 0) return null;

        // Get all unique column names across all rows
        const allColumnNames = new Set<string>();
        pivotRowsData.forEach(row => {
            Object.keys(row.values).forEach(key => allColumnNames.add(key));
        });

        // Convert to array and sort
        const columnNames = Array.from(allColumnNames).sort();

        return (
            <div className="w-full h-full flex flex-col">
                {/* Header showing summary */}
                {/* <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-5 py-3 border-b border-indigo-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-700">Pivot Results:</span>
                            <span className="text-indigo-700 font-semibold">{pivotRowsData.length} rows</span>
                        </div>
                        <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shadow-sm">
                            {columnNames.length} columns
                        </div>
                    </div>
                </div> */}

                {/* Table view of all pivot data with fixed column widths */}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full border-collapse table-fixed">
                        <colgroup>
                            {/* Fixed width for identifier column */}
                            <col style={{ width: '220px' }} />
                            
                            {/* Fixed widths for all value columns */}
                            {columnNames.map((name, idx) => (
                                <col key={idx} style={{ width: '180px' }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/40">
                                {/* Show identifier column first */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-indigo-200 sticky left-0 z-10 bg-gradient-to-r from-slate-50 to-indigo-50/40 w-[220px]">
                                    {pivotRowsData[0].identifier.key ? 
                                        pivotRowsData[0].identifier.key.replace('accounts_', '').replace('_', ' ') : 
                                        'Identifier'}
                                </th>
                                
                                {/* Show all value columns */}
                                {columnNames.map((columnName, index) => (
                                    <th 
                                        key={columnName} 
                                        className={`px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-indigo-200 ${index % 2 === 0 ? 'bg-indigo-50/30' : 'bg-sky-50/20'} w-[180px]`}
                                    >
                                        {columnName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {pivotRowsData.map((row, rowIndex) => (
                                <tr 
                                    key={rowIndex} 
                                    className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-indigo-50/10'} hover:bg-indigo-50/30 transition-colors duration-150`}
                                >
                                    {/* Identifier column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700 sticky left-0 z-10 border-r border-slate-100 shadow-sm w-[220px]" style={{backgroundColor: rowIndex % 2 === 0 ? 'white' : 'rgba(238, 242, 255, 0.1)'}}>
                                        {row.identifier.value}
                                    </td>
                                    
                                    {/* Value columns */}
                                    {columnNames.map((columnName, colIndex) => {
                                        const value = row.values[columnName];
                                        const isNumber = typeof value === 'number';
                                        return (
                                            <td 
                                                key={columnName} 
                                                className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isNumber ? 'font-medium text-slate-700' : 'text-slate-600'} ${colIndex % 2 === 0 ? 'bg-opacity-40' : 'bg-opacity-20'} w-[180px]`}
                                            >
                                                {isNumber
                                                    ? new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0
                                                    }).format(value)
                                                    : value === null || value === undefined
                                                        ? <span className="text-slate-300">—</span>
                                                        : value
                                                }
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {pivotRowsData.length === 0 && (
                                <tr>
                                    <td colSpan={columnNames.length + 1} className="px-6 py-4 text-center text-sm text-slate-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Generate DuckDB-style PIVOT statement for display
    const getDuckDBPivotStatement = () => {
        if (!pivotColumns.length || !pivotValues.length) return null;

        const rowFields = rowHeaderColumns.map(header =>
            typeof header.column.columnDef.header === 'string'
                ? header.column.columnDef.header
                : header.id
        ).join(', ');

        const pivotField = pivotColumns.join(', ');
        const aggregations = pivotValues.map(pv => `sum(${pv})`).join(', ');

        return `PIVOT table_name\nON ${pivotField}\nUSING ${aggregations}\nGROUP BY ${rowFields};`;
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
                            <span className="text-slate-500 mr-2 font-medium">Rows:</span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {rowHeaderColumns.map((header, i) => (
                                    <span key={header.id} className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-xs border border-indigo-200">
                                        {typeof header.column.columnDef.header === 'string'
                                            ? header.column.columnDef.header
                                            : header.id}
                                    </span>
                                ))}
                                {rowHeaderColumns.length === 0 && (
                                    <span className="text-slate-400 italic">None selected</span>
                                )}
                            </div>
                        </div>

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

            {/* Render the special flattened pivot view if applicable */}
            {isFlattenedPivot ? (
                renderFlattenedPivotView()
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden rounded-t-md">
                    <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
                        <table className="min-w-full border-separate border-spacing-0 table-fixed">
                            <colgroup>
                                {table.getHeaderGroups()[0].headers.map((header, idx) => {
                                    const isPivot = isPivotColumn(header.id);
                                    // Adjust column width based on column type
                                    const colWidth = isPivot ? '180px' : '220px';
                                    return <col key={idx} style={{ width: colWidth }} />;
                                })}
                            </colgroup>
                            <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm">
                                <tr className="pivot-header-row">
                                    {/* Row fields section */}
                                    {rowHeaderColumns.length > 0 && (
                                        <th
                                            colSpan={rowHeaderColumns.length}
                                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-gradient-to-r from-slate-100 to-indigo-50"
                                        >
                                            <div className="flex items-center">
                                                <span className="h-2 w-2 bg-indigo-400 rounded-full mr-1.5"></span>
                                                Rows
                                            </div>
                                        </th>
                                    )}

                                    {/* Pivot data section - only show if we have pivot columns */}
                                    {pivotDataColumns.length > 0 && (
                                        <th
                                            colSpan={pivotDataColumns.length}
                                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 bg-emerald-500 rounded-full mr-1.5"></span>
                                                    <span className="mr-1">Pivot Data:</span>
                                                    <span className="text-emerald-700 font-medium">{getPivotValueNames()}</span>
                                                </div>
                                            </div>
                                        </th>
                                    )}
                                </tr>

                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header, idx) => {
                                            const isPivot = isPivotColumn(header.id);
                                            // Make the first header column sticky (usually a row identifier)
                                            const isFirstColumn = idx === 0 && !isPivot;
                                            const stickyClass = isFirstColumn ? 'sticky left-0 z-20' : '';
                                            const stickyBg = isFirstColumn ? 'bg-gradient-to-r from-indigo-50 to-white' : '';

                                            return (
                                                <th
                                                    key={header.id}
                                                    className={`px-4 py-3 text-left text-xs font-medium tracking-wide whitespace-nowrap border-b ${isPivot
                                                            ? 'bg-gradient-to-b from-emerald-50 to-white text-emerald-800 border-l border-l-emerald-100'
                                                            : 'bg-gradient-to-b from-indigo-50 to-white text-indigo-700 border-slate-200'
                                                        } ${isPivot ? 'w-[180px]' : 'w-[220px]'} ${stickyClass} ${stickyBg}`}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div className="flex items-center gap-2">
                                                            {header.column.getCanGroup() && !isPivot && (
                                                                <Button
                                                                    onClick={header.column.getToggleGroupingHandler()}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 rounded-full"
                                                                >
                                                                    {header.column.getIsGrouped() ?
                                                                        <TableIcon className="h-3.5 w-3.5 text-indigo-600" /> :
                                                                        <TableIcon className="h-3.5 w-3.5 text-slate-400" />
                                                                    }
                                                                </Button>
                                                            )}
                                                            <span className="truncate">
                                                                {isPivot
                                                                    ? formatPivotHeader(header)
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )
                                                                }
                                                            </span>
                                                            {header.column.getCanSort() && !isPivot && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                    className="ml-1 p-0 h-5 hover:bg-transparent"
                                                                >
                                                                    <span className={`${header.column.getIsSorted() ? 'text-indigo-600' : 'text-slate-400'}`}>
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
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
                                {table?.getRowModel()?.rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="py-16 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    <PivotTableIcon className="h-8 w-8 text-indigo-400" />
                                                </div>
                                                <p className="text-lg font-medium text-indigo-600 mt-3">No pivot data available</p>
                                                <p className="text-sm text-slate-400 max-w-md">
                                                    {pivotColumns.length === 0
                                                        ? "Add pivot columns and values in the Pivot section to see your data transformed"
                                                        : "Try selecting different pivot columns or values to see results"}
                                                </p>
                                                <div className="mt-4 flex flex-col items-center">
                                                    <div className="text-xs text-slate-500 mb-2">Example Pivot Query</div>
                                                    <code className="px-4 py-2 rounded bg-indigo-50 text-xs font-mono text-indigo-600 max-w-md border border-indigo-100">
                                                        {pivotColumns.length === 0
                                                            ? "PIVOT table_name\nON column_name\nUSING aggregation(value_column);"
                                                            : `PIVOT table_name\nON ${pivotColumns.join(', ')}\nUSING ${pivotValues.map(pv => `sum(${pv})`).join(', ')};`
                                                        }
                                                    </code>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    table?.getRowModel()?.rows.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/10'} hover:bg-indigo-50/30 transition-colors duration-200`}
                                        >
                                            {row.getVisibleCells().map((cell, cellIndex) => {
                                                const isPivot = isPivotColumn(cell.column.id);
                                                const cellValue = cell.getValue();
                                                const isEmptyPivotCell = isPivot && (cellValue === null || cellValue === undefined || cellValue === '');
                                                const highlightClass = getHighlightedColumnClass(cell.column.id);
                                                
                                                // Make the first cell in each row sticky
                                                const isFirstCell = cellIndex === 0 && !isPivot;
                                                const stickyClass = isFirstCell ? 'sticky left-0 z-10' : '';
                                                // Set background to match the row for sticky first column
                                                const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/10';
                                                const stickyCellBg = isFirstCell ? bgColor : '';

                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className={`${getCellClassName(cell)} ${isEmptyPivotCell ? 'bg-gray-50/80' : ''} ${highlightClass} ${stickyClass} ${stickyCellBg} ${isFirstCell ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]' : ''}`}
                                                    >
                                                        {isEmptyPivotCell ? (
                                                            <span className="text-gray-300 text-center block w-full">—</span>
                                                        ) : (
                                                            formatCellContent(cell, row)
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {table?.getRowModel()?.rows.length > 0 && (
                                <tfoot className="bg-gradient-to-b from-slate-50 to-indigo-50/30 text-slate-700 border-t border-slate-200">
                                    <tr>
                                        {table.getFooterGroups()[0].headers.map((header, idx) => {
                                            const isPivot = isPivotColumn(header.id);
                                            const highlightClass = getHighlightedColumnClass(header.id);
                                            const isFirstColumn = idx === 0 && !isPivot;
                                            const stickyClass = isFirstColumn ? 'sticky left-0 z-10 bg-gradient-to-b from-slate-50 to-indigo-50/30' : '';

                                            return (
                                                <td
                                                    key={header.id}
                                                    className={`px-4 py-3 text-xs font-medium ${isPivot ? 'text-right bg-emerald-50/30 text-emerald-700' : 'text-left'} ${highlightClass} ${stickyClass}`}
                                                >
                                                    {header.isPlaceholder ? null :
                                                        flexRender(
                                                            header.column.columnDef.footer,
                                                            header.getContext()
                                                        )
                                                    }
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}

            {/* Add pagination controls - ensure it's not part of the scrollable area */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/20">
                <div className="flex items-center">
                    <span className="text-xs text-slate-500">
                        {isFlattenedPivot ? (
                            <span className="text-indigo-600">
                                <span className="font-medium">Pivot view</span>: {pivotRowsData.length} rows
                            </span>
                        ) : table.getFilteredRowModel().rows.length > 0 ? (
                            <>
                                Showing{' '}
                                <span className="font-medium text-indigo-700">
                                    {pagination.pageIndex * pagination.pageSize + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium text-indigo-700">
                                    {Math.min(
                                        (pagination.pageIndex + 1) * pagination.pageSize,
                                        table.getFilteredRowModel().rows.length
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium text-indigo-700">
                                    {totalRows || table.getFilteredRowModel().rows.length}
                                </span>{' '}
                                results
                            </>
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
                    {!isFlattenedPivot && (
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
                                    disabled={!table.getCanPreviousPage() || table.getFilteredRowModel().rows.length === 0}
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
                                    disabled={!table.getCanPreviousPage() || table.getFilteredRowModel().rows.length === 0}
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
                                    disabled={!table.getCanNextPage() || table.getFilteredRowModel().rows.length === 0}
                                    className="h-8 bg-white border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRightIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }))}
                                    disabled={!table.getCanNextPage() || table.getFilteredRowModel().rows.length === 0 || pageCount <= 1}
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