'use client';

import { ReportType } from "@/components/model/report-type";
import { defaultReportType, useReportTypeInitialValues } from "@/helper/report-type/report-type-helper";
import { useReportTypeById } from "@/hooks/report-type-hook";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface ReportTypeFormContextType {
    reportTypeId: string;
    setReportTypeId: Dispatch<SetStateAction<string>>;
    reportType: ReportType;
    setReportType: Dispatch<SetStateAction<ReportType>>;
    isReportTypeLoading: boolean;
}

const ReportTypeFormContext = createContext<ReportTypeFormContextType | null>(null);

export const useReportTypeFormContext = (): ReportTypeFormContextType => {
    const context = useContext(ReportTypeFormContext);
    if (!context) {
        return {
            reportType: defaultReportType,
            reportTypeId: '',
            setReportType: () => { },
            setReportTypeId: () => { },
            isReportTypeLoading: false
        };
    }
    return context;
}

export const ReportTypeFormProvider = ({ children }: { children: React.ReactNode }) => {

    const [reportTypeId, setReportTypeId] = useState<string>('');
    const { reportTypeResponse } = useReportTypeById(reportTypeId);
    const initialValues = useReportTypeInitialValues(reportTypeResponse?.data);
    const [reportType, setReportType] = useState<ReportType>(initialValues);

    useEffect(() => {
        if (initialValues) {
            setReportType(initialValues);
        }
    }, [initialValues])

    return (
        <ReportTypeFormContext.Provider
            value={
                {
                    reportTypeId,
                    setReportTypeId,
                    reportType,
                    setReportType,
                    isReportTypeLoading: reportTypeResponse.isLoading || reportTypeResponse.isFetching
                }
            }
        >
            {children}
        </ReportTypeFormContext.Provider>
    );
}