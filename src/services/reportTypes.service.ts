import { faker } from '@faker-js/faker';
import { RecentReportType, ReportTypeTemplate } from '@/app/report-builder/model/ReportType';

// Types for API responses
export interface ReportTypesResponse {
  reportTypes: ReportTypeTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportCategoriesResponse {
  categories: string[];
}

export interface RecentReportsResponse {
  reports: RecentReportType[];
}

export interface ReportFieldsResponse {
  fields: Field[];
  totalFields: number;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  label: string;
  category: string;
  tableName?: string;
  isCustom?: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// API client configuration
const API_BASE_URL = '/api';
// Use process.env instead of import.meta.env for better compatibility
const MOCK_DELAY = process.env.NODE_ENV === 'development' ? 750 : 0;

// Helper to simulate API delay
const simulateApiDelay = async () => {
  if (MOCK_DELAY > 0) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  }
};

// Handle API responses and errors consistently
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'An unexpected error occurred',
      statusCode: response.status
    } as ApiError;
  }
  return await response.json() as T;
}

// Generate mock data with Faker
const generateMockReportTypes = (count = 20): ReportTypeTemplate[] => {
  const types = ['tabular', 'summary', 'matrix', 'joined'];
  const objects = ['Accounts', 'Contacts', 'Opportunities', 'Leads', 'Cases'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement([
      'Sales Overview', 
      'Customer Engagement', 
      'Pipeline Analysis',
      'Lead Conversion',
      'Performance Metrics',
      'Territory Analysis',
      'Campaign Effectiveness',
      'Service Metrics'
    ]) + ' ' + faker.number.int(100),
    description: faker.lorem.sentence(10),
    icon: faker.helpers.arrayElement(objects).charAt(0).toUpperCase(),
    color: faker.color.rgb(),
    type: faker.helpers.arrayElement(types)
  }));
};

const generateMockCategories = (): string[] => {
  return ['Analytics', 'Customer', 'Sales', 'Marketing', 'Service', 'Custom'];
};

const generateMockRecentReports = (count = 10): RecentReportType[] => {
  return Array.from({ length: count }, () => ({
    name: faker.helpers.arrayElement([
      'Sales Overview', 
      'Customer Engagement', 
      'Pipeline Analysis',
      'Lead Conversion'
    ]) + ' ' + faker.number.int(50),
    category: faker.helpers.arrayElement([
      'Analytics', 'Customer', 'Sales', 'Marketing', 'Service', 'Custom'
    ]),
    lastUsed: faker.date.recent().toISOString(),
    status: faker.helpers.arrayElement(['Active', 'Draft']),
    description: faker.lorem.sentence(8),
    type: faker.helpers.arrayElement(['tabular', 'summary', 'matrix', 'joined']),
    createdBy: faker.person.fullName(),
    fieldsCount: faker.number.int({ min: 5, max: 25 }),
    objects: [{
      name: faker.helpers.arrayElement([
        'Accounts', 'Contacts', 'Opportunities', 'Leads', 'Cases'
      ]),
      icon: 'A',
      color: faker.color.rgb(),
    }]
  }));
};

const generateMockFields = (count = 30): Field[] => {
  const fieldTypes = ['text', 'textarea', 'number', 'currency', 'percent', 'date', 
                     'datetime', 'picklist', 'multipicklist', 'reference', 'id', 
                     'checkbox', 'email', 'url', 'phone'];
  
  const fieldCategories = ['Standard Fields', 'Custom Fields', 'System Fields', 'Calculated Fields'];
  const tableNames = ['Accounts', 'Contacts', 'Opportunities', 'Leads', 'Cases', 'Users', 'Products'];
  
  return Array.from({ length: count }, () => {
    // Choose a table for this field
    const tableName = faker.helpers.arrayElement(tableNames);
    
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'name', 'email', 'phone', 'address', 'amount', 'created_date', 'status',
        'owner', 'last_activity', 'description', 'industry', 'revenue', 'employees'
      ]) + '_' + faker.word.sample(),
      type: faker.helpers.arrayElement(fieldTypes),
      label: faker.commerce.productName(),
      category: faker.helpers.arrayElement(fieldCategories),
      tableName: tableName,
      isCustom: faker.datatype.boolean(0.3)
    };
  });
};

// Service methods that would connect to the API
export const ReportTypesService = {
  // Get all report types with optional filtering
  getReportTypes: async (
    params: { search?: string; category?: string; page?: number; limit?: number } = {}
  ): Promise<ReportTypesResponse> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/report-types?${new URLSearchParams(params)}`);
      // return handleResponse<ReportTypesResponse>(response);
      
      // Mock implementation
      await simulateApiDelay();
      
      let reportTypes = generateMockReportTypes();
      
      // Apply filters
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        reportTypes = reportTypes.filter(
          rt => rt.name.toLowerCase().includes(searchLower) || 
                rt.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.category) {
        // In a real app, we'd filter by category
        // For mock data, we'll just reduce the result set
        reportTypes = reportTypes.slice(0, reportTypes.length / 2);
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.limit || 10;
      const start = (page - 1) * pageSize;
      const paginatedReportTypes = reportTypes.slice(start, start + pageSize);
      
      return {
        reportTypes: paginatedReportTypes,
        total: reportTypes.length,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching report types:', error);
      throw error;
    }
  },
  
  // Get report categories
  getReportCategories: async (): Promise<ReportCategoriesResponse> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/report-categories`);
      // return handleResponse<ReportCategoriesResponse>(response);
      
      // Mock implementation
      await simulateApiDelay();
      
      return {
        categories: generateMockCategories()
      };
    } catch (error) {
      console.error('Error fetching report categories:', error);
      throw error;
    }
  },
  
  // Get recent reports for the current user
  getRecentReports: async (
    params: { search?: string; category?: string; limit?: number } = {}
  ): Promise<RecentReportsResponse> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/recent-reports?${new URLSearchParams(params)}`);
      // return handleResponse<RecentReportsResponse>(response);
      
      // Mock implementation
      await simulateApiDelay();
      
      let reports = generateMockRecentReports();
      
      // Apply filters
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        reports = reports.filter(
          report => report.name.toLowerCase().includes(searchLower) || 
                    report.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.category) {
        reports = reports.filter(report => report.category === params.category);
      }
      
      // Apply limit
      if (params.limit) {
        reports = reports.slice(0, params.limit);
      }
      
      return {
        reports
      };
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  },
  
  // Get fields for a specific report type
  getReportTypeFields: async (
    reportTypeId: string,
    params: { search?: string; category?: string } = {}
  ): Promise<ReportFieldsResponse> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/report-types/${reportTypeId}/fields?${new URLSearchParams(params)}`);
      // return handleResponse<ReportFieldsResponse>(response);
      
      // Mock implementation
      await simulateApiDelay();
      
      let fields = generateMockFields();
      
      // Apply filters
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        fields = fields.filter(
          field => field.name.toLowerCase().includes(searchLower) || 
                   field.label.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.category) {
        fields = fields.filter(field => field.category === params.category);
      }
      
      return {
        fields,
        totalFields: fields.length
      };
    } catch (error) {
      console.error(`Error fetching fields for report type ${reportTypeId}:`, error);
      throw error;
    }
  },
  
  // Create a custom report type (used when user clicks "Create Custom Report")
  createCustomReportType: async (
    data: Partial<ReportTypeTemplate>
  ): Promise<ReportTypeTemplate> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/report-types/custom`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // });
      // return handleResponse<ReportTypeTemplate>(response);
      
      // Mock implementation
      await simulateApiDelay();
      
      // Simulate creating a new report type
      return {
        id: faker.string.uuid(),
        name: data.name || 'New Custom Report',
        description: data.description || 'Custom report created by user',
        icon: data.icon || 'C',
        color: data.color || '#3B82F6',
        type: data.type || 'tabular'
      };
    } catch (error) {
      console.error('Error creating custom report type:', error);
      throw error;
    }
  }
}; 