import { ApiService } from './api';

export interface ReportType {
  id: string;
  name: string;
  description: string;
  queryTemplate: string;
  parametersSchema: Record<string, any>;
  visualizationOptions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

class ReportTypeService extends ApiService<ReportType> {
  constructor() {
    super('report-types');
  }

  async getReportTypes(): Promise<ReportType[]> {
    return this.getAll();
  }

  async getReportType(id: string): Promise<ReportType> {
    return this.getById(id);
  }

  async createReportType(data: Partial<ReportType>): Promise<ReportType> {
    return this.create(data);
  }

  async updateReportType(id: string, data: Partial<ReportType>): Promise<ReportType> {
    return this.update(id, data);
  }

  async deleteReportType(id: string): Promise<void> {
    return this.delete(id);
  }

  // Add any report type specific methods here
  async getActiveReportTypes(): Promise<ReportType[]> {
    return this.request<ReportType[]>({
      method: 'GET',
      url: '/report-types/active',
    });
  }

  async getPublicReportTypes(): Promise<ReportType[]> {
    return this.request<ReportType[]>({
      method: 'GET',
      url: '/report-types/public',
    });
  }
}

export const reportTypeService = new ReportTypeService(); 