import {AxiosRequestConfig} from "axios";
import {httpClient} from "@/services/http-service";

export const rdHttpService = {
    get<T = any>(url: string, config?: AxiosRequestConfig) {
        return httpClient.get<T>(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}${url}`);
    },
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.post<T>(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}${url}`, data);
    },
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.put<T>(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}${url}`, data);
    },
    delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return httpClient.delete<T>(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}${url}`);
    },
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return httpClient.patch<T>(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}${url}`, data);
    },
};