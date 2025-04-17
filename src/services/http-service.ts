import { getCookie } from "@/helper/cookie-helper";
import { GlobalKeys } from "@/types/constants/global-keys";
import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

type Data = any;
export const axiosInstance = axios.create();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const IS_PROD = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const getBaseURL = ()=> {
  const isProd = IS_PROD;
  const baseUrl = BASE_URL;

  if(isProd === 'prod') {
      const host = window.location.origin
      return `${host}${baseUrl}`
  }  
  return baseUrl;
}

export const httpClient = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(`${url}`, config);
  },

  post<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(`${url}`, data, config);
  },

  put<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(`${url}`, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(`${url}`, config);
  },

  patch<T = any>(url: string, data?: Data, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.patch<T>(`${url}`, data, config);
  },
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getCookie(GlobalKeys.AUTH_COOKIE_NAME);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});