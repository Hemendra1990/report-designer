import { ReportType, ReportTypeConfig, ReportTypeLayout } from "@/components/model/report-type";
import { iColumnMetaData, iTableMetaData } from "@/components/model/table-metadata";
import { RelatedObject, RelationshipType } from "@/components/report-type/define-relationship-form";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { useAllTableMetadata } from "@/hooks/metadata-hook";

export const defaultReportType = {
    id: '',
    typeGroup: '',
    label: '',
    name: '',
    description: '',
    primaryTableId: '',
    primaryTable: '',
    primaryTableDisplayName: ''
};

export const useReportTypeInitialValues = (reportType: ReportType | undefined): ReportType => {
    if (reportType) {
        return reportType;
    } else {
        return defaultReportType;
    }
}

export const generateLayoutColumn = (table: string, tableId: string, columns: iColumnMetaData[]): ReportTypeLayout[] => {
    return columns.map((column: iColumnMetaData) => {
        return {
            id: column.id,
            columnName: column.columnName,
            columnDisplayName: column.headerName,
            columnType: column.dataType,
            tableName: table,
            tableId: tableId,
            active: true,
        }
    });
}

export const useReportTypeConfigGeneration = () => {
    const { reportType, setReportType } = useReportTypeFormContext();
    const { data: allTableMetaData} = useAllTableMetadata();

    const reportTypeConfigGeneration = (tableName: string, relationshipType: RelationshipType, parentTableName: string, relatedTableInformationMap: Record<string, iTableMetaData[]>, relatedObjects: RelatedObject[] ) => {
        let selectedTableMetadata: iTableMetaData | undefined = relatedTableInformationMap[parentTableName]?.find(e => e.tableName == tableName);
        if (selectedTableMetadata) {
            let relatedColumn = selectedTableMetadata.columns.find(col => col.referenceAPI == reportType.primaryTable)
            let parentTable = allTableMetaData?.find((table) => table.tableName == parentTableName);
            
            let reportTypeConfig: ReportTypeConfig = {
                "joinType": relationshipType,
                "primaryTableId": parentTable?.id || '',
                "primaryTableName": parentTableName,
                "primaryTableDisplayName": parentTable?.displayName || '',
                "fromColumn": "id", // TODO: for crm it will be always id. verify once
                "joinTableId": selectedTableMetadata.id,
                "joinTableName": tableName,
                "joinTableDisplayName": selectedTableMetadata.displayName,
                "referColumn": relatedColumn?.columnName || '',
                "sortOrder": 0,
            }
            setReportType((prev) => {
                return {
                    ...prev,
                    objectTree: JSON.stringify(relatedObjects),
                    configList: [...(prev.configList ?? []), reportTypeConfig],
                    layoutList: [...(prev.layoutList ?? []), ...generateLayoutColumn(tableName, selectedTableMetadata.id, selectedTableMetadata.columns)]
                }
            })
        }
    }

    const handleObjectRemove = (tableName: string) => {
        // While removing a entity from object tree, remove the corresponding report type config and layout
        setReportType((prev) => {
            return {
                ...prev,
                configList: prev.configList?.filter((config) => config.joinTableName != tableName),
                layoutList: prev.layoutList?.filter((layout) => layout.tableName != tableName)
            }
        })
    }

    return { reportTypeConfigGeneration, handleObjectRemove }; 
}