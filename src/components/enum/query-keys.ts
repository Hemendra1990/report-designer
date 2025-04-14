export enum QueryKeys {
    KEYCLOAK_RESPONSE = 'KEYCLOAK_RESPONSE',

    //Report Type
    GET_REPORT_TYPE_BY_ID = 'getReportTypeById',
    GET_ALL_REPORT_TYPES = 'getAllReportTypes',
    CREATE_REPORT_TYPE = 'createReportType',
    LAYOUT_COLUMN_LIST_BY_REPORT_ID='layoutColumnByReportId',
    ACTIVE_LAYOUT_COLUMN_LIST_BY_REPORT_ID='activeLayoutColumnByReportId',
    ALL_REPORTY_TYPE_SUMMARY = 'allReportTypeSummary',

    //Report
    GET_REPORT_BY_ID = 'getReportById',
    GET_ALL_REPORT = 'getAllReport',

}

export enum METADATA {
    ALL_COLUMNMETADATA_INFO = "getAllColumnMetaDataInfo",
    ALL_TABLE_METADATA = "allTableMetaData",
    ALL_RELATED_DATA = "allRelatedData"
}