import api from './api';

export interface ReportType {
  id: string;
  name: string;
  description: string;
  queryTemplate: string;
  parametersSchema: string;
  isPublic: boolean;
  dataSource: string;
  visualizationOptions: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllReportTypes = async (): Promise<ReportType[]> => {
  const response = await api.get('/report-types');
  return response.data;
};

export const getActiveReportTypes = async (): Promise<ReportType[]> => {
  const response = await api.get('/report-types/active');
  return response.data;
};

export const getPublicReportTypes = async (): Promise<ReportType[]> => {
  const response = await api.get('/report-types/public');
  return response.data;
};

export const getReportTypeById = async (id: string): Promise<ReportType> => {
  const response = await api.get(`/report-types/${id}`);
  return response.data;
};

export const getReportTypeByName = async (name: string): Promise<ReportType> => {
  const response = await api.get(`/report-types/name/${name}`);
  return response.data;
};

export const createReportType = async (reportType: Omit<ReportType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportType> => {
  const response = await api.post('/report-types', reportType);
  return response.data;
};

export const updateReportType = async (id: string, reportType: Partial<ReportType>): Promise<ReportType> => {
  const response = await api.put(`/report-types/${id}`, reportType);
  return response.data;
};

export const deleteReportType = async (id: string): Promise<void> => {
  await api.delete(`/report-types/${id}`);
}; 