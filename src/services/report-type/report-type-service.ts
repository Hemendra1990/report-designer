import { httpClient } from "../http-service";

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/report-type`;

export const getAllReportTypes = () => {
    return httpClient.get(`${BASE_URL}`);
}

export const getReportTypeById = (reportTypeId: string) => {
    return httpClient.get(`${BASE_URL}/${reportTypeId}`);
}

export const createReportType = (reportType: any) => {
    return httpClient.post(`${BASE_URL}`, reportType);
}