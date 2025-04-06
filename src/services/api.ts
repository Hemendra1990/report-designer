import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic API service class
export class ApiService<T> {
  protected api: AxiosInstance;
  protected baseUrl: string;

  constructor(endpoint: string) {
    this.baseUrl = `/api/${endpoint}`;
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all items
  async getAll(): Promise<T[]> {
    const response: AxiosResponse<T[]> = await this.api.get<T[]>('');
    return response.data;
  }

  // Get item by ID
  async getById(id: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get<T>(`/${id}`);
    return response.data;
  }

  // Create new item
  async create(data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post<T>('', data);
    return response.data;
  }

  // Update item
  async update(id: string, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put<T>(`/${id}`, data);
    return response.data;
  }

  // Delete item
  async delete(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  // Custom request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.request(config);
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