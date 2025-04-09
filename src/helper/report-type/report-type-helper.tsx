import { ReportType } from "@/components/model/report-type";

export const useReportTypeInitialValues = (reportType: ReportType | undefined): ReportType => {
    if (reportType) {
        return reportType;
    } else {
        return {
            id: '',
            label: '',
            name: '',
            description: '',
            primaryTableId: '',
            primaryTable: '',
            primaryTableDisplayName: ''

        };
    }
}