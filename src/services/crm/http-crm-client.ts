import { AxiosRequestConfig } from "axios";
import { httpClient } from "../http-service";

const BASE_URL = 'crm';

export const httpCrmClient = {
    get<T = any>(url: string, config?: AxiosRequestConfig) {
        return httpClient.get<T>(`${BASE_URL}${url}`, config);
    },
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.post<T>(`${BASE_URL}${url}`, data, config);
    },
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.put<T>(`${BASE_URL}${url}`, data, config);
    },
    delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return httpClient.delete<T>(`${BASE_URL}${url}`, config);
    },
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.patch<T>(`${BASE_URL}${url}`, data, config);
    },
}