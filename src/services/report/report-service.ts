import { ReportType, ReportTypeLayout } from "@/components/model/report-type";
import { httpClient } from "../http-service";
import { Report } from "@/components/model/report";

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/report`;

export const getAllReports = () => {
    return httpClient.get(`${BASE_URL}`);
}

export const getReportById = (id: string) => {
    return httpClient.get(`${BASE_URL}/${id}`);
}

export const createReport = (report: Report) => {
    return httpClient.post(`${BASE_URL}`, report);
}

export const updateReport = (report: Report) => {
    return httpClient.put(`${BASE_URL}/${report.id}`, report);
}


export const deleteReportById = (reportId:string) => {
    return httpClient.delete(`${BASE_URL}/${reportId}`);
}