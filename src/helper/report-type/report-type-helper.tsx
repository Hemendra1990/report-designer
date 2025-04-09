import { ReportType } from "@/components/model/report-type";

export const defaultReportType = {
    id: '',
    type: '',
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