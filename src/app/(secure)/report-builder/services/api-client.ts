// API client for making HTTP requests to the backend
import { faker } from '@faker-js/faker';

// Base API URL - will be replaced with real backend URL later
const API_BASE_URL = '/api';

// Helper to simulate network latency
const simulateNetworkLatency = async () => {
  const delay = faker.number.int({ min: 300, max: 1000 });
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate HTTP requests with fetch API
class ApiClient {
  // Generic request method
  private static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    // Simulate network delay
    await simulateNetworkLatency();

    // In a real app, this would be a fetch call to the backend
    // For now, we'll make it look like a real API call but use our fake data generator
    console.log(`${method} ${API_BASE_URL}${endpoint}`, data);

    // Simulate network errors occasionally (10% chance)
    if (faker.datatype.boolean({ probability: 0.1 })) {
      throw new Error(`Network error: Failed to ${method} ${endpoint}`);
    }

    // Return data from the mock implementation
    return await import('./mock-api').then(module => {
      return module.handleMockRequest(endpoint, method, data) as T;
    });
  }

  // GET request
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  // POST request
  static async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'POST', data);
  }

  // PUT request
  static async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

export default ApiClient; 