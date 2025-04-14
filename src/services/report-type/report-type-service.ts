import { ReportType, ReportTypeLayout } from "@/components/model/report-type";
import { httpClient } from "../http-service";

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/report-type`;

export const getAllReportTypes = () => {
    return httpClient.get(`${BASE_URL}`);
}

export const getReportTypeById = (reportTypeId: string) => {
    return httpClient.get(`${BASE_URL}/${reportTypeId}`);
}

export const deleteReportTypeById = (reportTypeId: string) => {
    return httpClient.delete(`${BASE_URL}/${reportTypeId}`);
}

export const createReportType = (reportType: ReportType) => {
    return httpClient.post(`${BASE_URL}`, reportType);
}

export const updateReportTypeLayoutStatus = (reportType: ReportTypeLayout[],reportTypeId:string) => {
    return httpClient.put(`${BASE_URL}/layout/update-status/${reportTypeId}`, reportType);
}

export const layoutColumnListByReportId = (reportTypeId: string) =>{
    return httpClient.get(`${BASE_URL}/${reportTypeId}/fields`);
}

export const activeLayoutColumnListByReportId = (reportTypeId: string) =>{
    return httpClient.get(`${BASE_URL}/${reportTypeId}/active/fields`);
}

export const getAllReportTypeSummary = () =>{
    return httpClient.get(`${BASE_URL}/reportSummary`);
}
