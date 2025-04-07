import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type Data = any;
export const axiosInstance = axios.create();
export const httpClient = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(url, config);
  },

  post<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(url, data, config);
  },

  put<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(url, config);
  },

  patch<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.patch<T>(url, data, config);
  },
};