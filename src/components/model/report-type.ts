export interface ReportType {
    id: string;
    label: string;
    name: string;
    description: string;
    primaryTableId: string;
    primaryTable: string;
    primaryTableDisplayName: string;
    cteQuery?: string;
    usedTables?: string[];
    configList?: ReportTypeConfig[];
    layoutList?: ReportTypeLayout[];
}

export interface ReportTypeConfig {
    id: string;
    joinType: string;

    primaryTableId: string;
    primaryTableName: string;
    primaryTableDisplayName: any;

    fromColumn: string;
    joinTableId: string;
    joinTableName: string;
    joinTableDisplayName: string;
    referColumn: string;
    sortOrder: number;
}

export interface ReportTypeLayout {
    id: string;
    columnName: string;
    columnDisplayName: string;
    columnType: string;
    tableName: string;
    tableId: string;
    active: boolean;
}