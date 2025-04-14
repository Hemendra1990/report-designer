import { ReportType } from "./report-type";

export interface Report {
    id?: string;
    name: string;
    label: string;
    description?: string;
    reportType: {id: string};
    sqlQuery: string;
    columns: ReportColumn[];
    groups: ReportGroup[];
    filters: ReportFilter[];
}

export interface ReportColumn {
    id?: string;
    report?: Report;
    name?: string;
    type?: string;
    category?: string;
    icon?: string;
    isFormula?: boolean;
    formula?: string;
    isSummaryFormula?: boolean;
    alias?: string;
    description?: string;
    tableName?: string;
    tableId?: string;
    columnName?: string;
    columnDisplayName?: string;
    columnType?: string;
    duckDBColumnName?: string;
    duckDBColumnDisplayName?: string;
}

export interface ReportGroup {
    id?: string;
    report?: Report;
    tableName?: string;
    columnName?: string;
    duckDBColumnName?: string;
    displayName?: string;
    sortOrder?: number;
    sortDirection?: string;
    summaryFormula?: string;
}

export interface ReportFilter {
    id?: string;
    report?: Report;
    tableName?: string;
    columnName?: string;
    duckDBColumnName?: string;
    operator?: string;
    value?: string;
    sortOrder?: number;
    logicalOperator?: string;
    customFormula?: string;
}