import { ReportType, ReportTypeLayout } from "@/components/model/report-type";
import { httpClient } from "../../http-service";
import { httpRDClient } from "../http-rd-client";

const BASE_URL = `/api/report-type`;

export const getAllReportTypes = () => {
    return httpRDClient.get(`${BASE_URL}`);
}

export const getReportTypeById = (reportTypeId: string) => {
    return httpRDClient.get(`${BASE_URL}/${reportTypeId}`);
}

export const deleteReportTypeById = (reportTypeId: string) => {
    return httpRDClient.delete(`${BASE_URL}/${reportTypeId}`);
}

export const createReportType = (reportType: ReportType) => {
    return httpRDClient.post(`${BASE_URL}`, reportType);
}

export const updateReportTypeLayoutStatus = (reportType: ReportTypeLayout[],reportTypeId:string) => {
    return httpRDClient.put(`${BASE_URL}/layout/update-status/${reportTypeId}`, reportType);
}

export const layoutColumnListByReportId = (reportTypeId: string) =>{
    return httpRDClient.get(`${BASE_URL}/${reportTypeId}/fields`);
}

export const activeLayoutColumnListByReportId = (reportTypeId: string) =>{
    return httpRDClient.get(`${BASE_URL}/${reportTypeId}/active/fields`);
}

export const getAllReportTypeSummary = () =>{
    return httpRDClient.get(`${BASE_URL}/reportSummary`);
}
