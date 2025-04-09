import { QueryKeys } from "@/components/enum/query-keys";
import { ReportType } from "@/components/model/report-type";
import { getReportTypeById } from "@/services/report-type/report-type-service";
import { useQuery } from "@tanstack/react-query";

export const useReportTypeById = (reportTypeId: string) => {
    const reportTypeById = () => {
        return getReportTypeById(reportTypeId).then((res) => res?.data?.data);
    };

    const reportTypeResponse = useQuery<ReportType>({
        queryKey: [QueryKeys.GET_REPORT_TYPE_BY_ID, reportTypeId],
        enabled: !!reportTypeId,
        queryFn: reportTypeById,
    });

    return { reportTypeResponse };
};