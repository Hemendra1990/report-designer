import { Report } from "@/components/model/report";
import { httpRDClient } from "../http-rd-client";

const BASE_URL = `/api/report`;

export const getAllReports = () => {
    return httpRDClient.get(`${BASE_URL}`);
}

export const getReportById = (id: string) => {
    return httpRDClient.get(`${BASE_URL}/${id}`);
}

export const createReport = (report: Report) => {
    return httpRDClient.post(`${BASE_URL}`, report);
}

export const updateReport = (report: Report) => {
    return httpRDClient.put(`${BASE_URL}/${report.id}`, report);
}


export const deleteReportById = (reportId:string) => {
    return httpRDClient.delete(`${BASE_URL}/${reportId}`);
}