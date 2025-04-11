import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic API service class
export class ApiService<T> {
  protected api: AxiosInstance;
  protected baseUrl: string;

  constructor(endpoint: string) {
    this.baseUrl = `/${endpoint}`;
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all items
  async getAll(): Promise<T[]> {
    const response: AxiosResponse<T[]> = await this.api.get<T[]>(`${this.baseUrl}`);
    return response.data;
  }

  // Get item by ID
  async getById(id: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get<T>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new item
  async create(data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post<T>(`${this.baseUrl}`, data);
    return response.data;
  }

  // Update item
  async update(id: string, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put<T>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete item
  async delete(id: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/${id}`);
  }

  // Custom request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    // Ensure the URL is properly constructed with the baseUrl
    const url = config.url?.startsWith('/') 
      ? `${this.baseUrl}${config.url}` 
      : `${this.baseUrl}/${config.url}`;
    
    const response: AxiosResponse<T> = await this.api.request({
      ...config,
      url
    });
    return response.data;
  }
}

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here (e.g., show toast notifications)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 