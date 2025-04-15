import { Field } from "@/app/(secure)/report-builder/model/Field";
import { Filter } from "@/app/(secure)/report-builder/model/Filter";
import { Report, ReportFilter } from "@/components/model/report"
import { ReportType } from "@/components/model/report-type"
import { report } from "process";

export const generateReportPayload = (reportId: string, reportName: string, reportType: ReportType, sqlQuery: string, columns, groups, filters: Filter[]): Report => {
    let updatedColumns = columns.map(column => {
        delete column.id;
        return column;
    })

    let updatedGroups = groups.map(group => {
        delete group.id;
        return group;
    })

    let updatedFilters: ReportFilter[] = filters.map(filter => {
        let reportFilter: ReportFilter = {
            tableName: filter.field.tableName,
            columnName: filter.field.columnName,
            operator: filter.operator,
            value: filter.value,
        }
        return reportFilter;
    })

    let reportPayload: Report = {
        id: reportId,
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

export const generateFilterJson = (reportFilters: ReportFilter[], reportFields: Field[]): Filter[] => {
    return reportFilters.map(reportFilter => {
        let filter: Filter = {
            id: reportFilter.id,
            field: reportFields.find(field => field.tableName === reportFilter.tableName && field.columnName === reportFilter.columnName),
            operator: reportFilter.operator,
            value: reportFilter.value
        }
        return filter;
    })
}