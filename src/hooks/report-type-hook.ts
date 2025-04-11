import { QueryKeys } from "@/components/enum/query-keys";
import { ReportType, ReportTypeLayout, ReportTypeSummary } from "@/components/model/report-type";
import { createReportType, deleteReportTypeById, getAllReportTypes, getAllReportTypeSummary, getReportTypeById, layoutColumnListByReportId, updateReportTypeLayoutStatus } from "@/services/report-type/report-type-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { on } from "process";
import { use } from "react";

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

export const useInvalidateReportTypeById = () => { // TODO
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
    const {invalidateAllReportTypes} = useInvalidateAllReportTypes();
    const {invalidateReportTypeById} = useInvalidateReportTypeById();
    return useMutation({
        mutationFn: ({ payload, onSuccess, onError }: { payload: ReportType, onSuccess?: (data: any) => void, onError?: (err: AxiosError) => void }) => {
            return createReportType(payload);
        },
        onSuccess: (data, variables) => {
            if (variables?.onSuccess) {
                variables.onSuccess(data);
            }
            // invalidateReportTypeById(data?.id)
            invalidateAllReportTypes();
        },
        onError: (err: AxiosError, variables) => {
            if (variables?.onError) {
                variables.onError(err);
            }
        },
    });
};

export const useUpdateReportTypeLayoutStatus = () => {
    return useMutation({
        mutationFn: ({ payload }: { payload: ReportType }) => {
            return updateReportTypeLayoutStatus(payload?.layoutList || [],payload?.id as string);
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


export const useLayoutColumnListByReportId = (reportTypeId: string) => {
    const layoutColumnByReportId = () => {
        return layoutColumnListByReportId(reportTypeId).then((res) => res?.data?.data);
    };

    const layoutColumnByReportIdResponse = useQuery({
        queryKey: [QueryKeys.LAYOUT_COLUMN_LIST_BY_REPORT_ID, reportTypeId],
        enabled: !!reportTypeId,
        queryFn: layoutColumnByReportId,
    });

    return { layoutColumnByReportIdResponse };
};

export const useInvalidateLayoutColumnByReportid= () => {
    const queryClient = useQueryClient();
    const invalidateLayoutColumnByReportId = () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.LAYOUT_COLUMN_LIST_BY_REPORT_ID] });
    }
    return { invalidateLayoutColumnByReportId };
}

export const useAllReportTypeSummary = () => {
    const allReportTypeSummary = () => {
        return getAllReportTypeSummary().then((res) => res?.data?.data);
    };
    const allReportTypeSummaryResponse = useQuery<ReportTypeSummary[]>({
        queryKey: [QueryKeys.ALL_REPORTY_TYPE_SUMMARY],
        queryFn: allReportTypeSummary,
    });
    return { allReportTypeSummaryResponse };
};

export const useInvalidateAllReportTypeSummary = () => {
    const queryClient = useQueryClient();
    const invalidateAllReportTypeSummary = () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.ALL_REPORTY_TYPE_SUMMARY] });
    }
    return { invalidateAllReportTypeSummary };
}