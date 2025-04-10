export interface ReportType {
    id?: string;
    typeGroup: string;
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

    schema?: string;
    objectTree?: string;
}

export interface ReportTypeConfig {
    id?: string;
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
    letter?: string;
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