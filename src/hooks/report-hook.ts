import { QueryKeys } from "@/components/enum/query-keys";
import { Report } from "@/components/model/report";
import { createReport, getAllReports, getReportById } from "@/services/report/report-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useReportById = (reportId: string) => {
    const reportById = () => {
        return getReportById(reportId).then((res) => res?.data?.data);
    };

    const reportResponse = useQuery<Report>({
        queryKey: [QueryKeys.GET_REPORT_BY_ID, reportId],
        queryFn: reportById,
        enabled: !!reportId,
    });

    return { reportResponse };
};

export const useInvalidateReportById = () => {
    const queryClient = useQueryClient();
    const invalidateReportById = (reportId: string) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_REPORT_BY_ID, reportId] });
    }
    return { invalidateReportById };
}

export const useAllReport = () => {
    const allReport = () => {
        return getAllReports().then((res) => res?.data?.data);
    };

    const allReportResponse = useQuery<Report[]>({
        queryKey: [QueryKeys.GET_ALL_REPORT],
        queryFn: allReport,
    });
    return { allReportResponse };
};

export const useInvalidateAllReport = () => {
    const queryClient = useQueryClient();
    const invalidateAllReportTypes = () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ALL_REPORT_TYPES] });
    }
    return { invalidateAllReportTypes };
}

export const useCreatereport = () => {
    return useMutation({
        mutationFn: ({ payload, onSuccess, onError }: { payload: Report, onSuccess?: (data: any) => void, onError?: (err: AxiosError) => void }) => {
            return createReport(payload);
        },
        onSuccess: (data, variables) => {
            if (variables?.onSuccess) {
                variables.onSuccess(data);
            }
        },
        onError: (err: AxiosError, variables) => {
            if (variables?.onError) {
                variables.onError(err);
            }
        },
    });
};