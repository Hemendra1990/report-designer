// crm-http-service.ts
import { AxiosRequestConfig } from "axios";
import { httpClient } from "../http-service";
import { getAuthToken } from "../AuthTokenHolder";

const withAuthHeader = (config: AxiosRequestConfig = {}): AxiosRequestConfig => {
  let token = localStorage.getItem('token') || '';
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'web-origin': window.location.href,
    },
  };
};

export const crmHttpService = {

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return httpClient.get<T>(`${process.env.NEXT_PUBLIC_CRM_URL}${url}`, withAuthHeader(config));
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return httpClient.post<T>(`${process.env.NEXT_PUBLIC_CRM_URL}${url}`, data, withAuthHeader(config));
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return httpClient.put<T>(`${process.env.NEXT_PUBLIC_CRM_URL}${url}`, data, withAuthHeader(config));
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return httpClient.delete<T>(`${process.env.NEXT_PUBLIC_CRM_URL}${url}`, withAuthHeader(config));
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return httpClient.patch<T>(`${process.env.NEXT_PUBLIC_CRM_URL}${url}`, data, withAuthHeader(config));
  },
};
