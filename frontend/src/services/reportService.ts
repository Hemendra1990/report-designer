import api from './api';
import { ReportType } from './reportTypeService';

export interface Report {
  id: string;
  name: string;
  description: string;
  reportType: ReportType;
  parameters: string;
  query: string;
  visualizationConfig: string;
  isPublic: boolean;
  dataSource: string;
  refreshInterval: string;
  autoRefresh: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllReports = async (): Promise<Report[]> => {
  const response = await api.get('/reports');
  return response.data;
};

export const getPublicReports = async (): Promise<Report[]> => {
  const response = await api.get('/reports/public');
  return response.data;
};

export const getReportsByType = async (reportTypeId: string): Promise<Report[]> => {
  const response = await api.get(`/reports/type/${reportTypeId}`);
  return response.data;
};

export const getActiveReportsByType = async (reportTypeId: string): Promise<Report[]> => {
  const response = await api.get(`/reports/type/${reportTypeId}/active`);
  return response.data;
};

export const getReportsByDataSource = async (dataSource: string): Promise<Report[]> => {
  const response = await api.get(`/reports/datasource/${dataSource}`);
  return response.data;
};

export const getReportById = async (id: string): Promise<Report> => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const createReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> => {
  const response = await api.post('/reports', report);
  return response.data;
};

export const updateReport = async (id: string, report: Partial<Report>): Promise<Report> => {
  const response = await api.put(`/reports/${id}`, report);
  return response.data;
};

export const deleteReport = async (id: string): Promise<void> => {
  await api.delete(`/reports/${id}`);
};

export const executeReport = async (id: string): Promise<any[]> => {
  const response = await api.post(`/reports/${id}/execute`);
  return response.data;
}; 