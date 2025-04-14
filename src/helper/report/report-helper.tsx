import { Report } from "@/components/model/report"
import { ReportType } from "@/components/model/report-type"

export const generateReportPayload = (reportName: string, reportType: ReportType, sqlQuery: string, columns, groups, filters): Report => {
    let updatedColumns = columns.map(column => {
        delete column.id;
        return column;
    })

    let updatedGroups = groups.map(group => {
        delete group.id;
        return group;
    })

    let updatedFilters = filters.map(filter => {
        delete filter.id;
        return filter;
    })

    let reportPayload: Report = {
        name: reportName,
        label: reportName,
        description: reportName,
        reportType: {
            id: reportType?.id,
        },
        sqlQuery: sqlQuery,
        columns: updatedColumns,
        groups: updatedGroups,
        filters: updatedFilters
    }
    return reportPayload;
}