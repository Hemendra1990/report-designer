import { QueryKeys } from "@/components/enum/query-keys";
import { ReportType, ReportTypeLayout } from "@/components/model/report-type";
import { createReportType, deleteReportTypeById, getAllReportTypes, getReportTypeById, updateReportTypeLayoutStatus } from "@/services/report-type/report-type-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useInvalidateReportTypeById = () => {
    const queryClient = useQueryClient();
    const invalidateReportTypeById = () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_REPORT_TYPE_BY_ID] });
    }
    return { invalidateReportTypeById };
}

export const useAllReportTypes = () => {
    const allReportTypes = () => {
        return getAllReportTypes().then((res) => res?.data?.data);
    };

    const allReportTypeResponse = useQuery<ReportType[]>({
        queryKey: [QueryKeys.GET_ALL_REPORT_TYPES],
        queryFn: allReportTypes,
    });
    return { allReportTypeResponse };
};

export const useInvalidateAllReportTypes = () => {
    const queryClient = useQueryClient();
    const invalidateAllReportTypes = () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ALL_REPORT_TYPES] });
    }
    return { invalidateAllReportTypes };
}

export const useCreatereportType = () => {
    return useMutation({
        mutationFn: ({ payload }: { payload: ReportType }) => {
            return createReportType(payload);
        },
        onSuccess: () => {
        },
        onError: () => {
        },
    });
};

export const useUpdateReportTypeLayoutStatus = () => {
    return useMutation({
        mutationFn: ({ payload }: { payload: ReportTypeLayout[] }) => {
            return updateReportTypeLayoutStatus(payload);
        },
        onSuccess: () => {
        },
        onError: () => {
        },
    });
};

export const useDeleteReportType = () => {
    return useMutation({
        mutationFn: ({ reportTypeId }: { reportTypeId: string }) => {
            return deleteReportTypeById(reportTypeId);
        },
        onSuccess: () => {
        },
        onError: () => {
        },
    });
};