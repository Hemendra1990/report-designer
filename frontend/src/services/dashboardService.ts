import api from './api';
import { Report } from './reportService';

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  report: Report;
  isPublic: boolean;
  publishUrl: string;
  layout: string;
  theme: string;
  isPublished: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllDashboards = async (): Promise<Dashboard[]> => {
  const response = await api.get('/dashboards');
  return response.data;
};

export const getPublicDashboards = async (): Promise<Dashboard[]> => {
  const response = await api.get('/dashboards/public');
  return response.data;
};

export const getPublishedDashboards = async (): Promise<Dashboard[]> => {
  const response = await api.get('/dashboards/published');
  return response.data;
};

export const getDashboardsByReport = async (reportId: string): Promise<Dashboard[]> => {
  const response = await api.get(`/dashboards/report/${reportId}`);
  return response.data;
};

export const getActiveDashboardsByReport = async (reportId: string): Promise<Dashboard[]> => {
  const response = await api.get(`/dashboards/report/${reportId}/active`);
  return response.data;
};

export const getDashboardByPublishUrl = async (publishUrl: string): Promise<Dashboard> => {
  const response = await api.get(`/dashboards/publish-url/${publishUrl}`);
  return response.data;
};

export const getDashboardById = async (id: string): Promise<Dashboard> => {
  const response = await api.get(`/dashboards/${id}`);
  return response.data;
};

export const createDashboard = async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> => {
  const response = await api.post('/dashboards', dashboard);
  return response.data;
};

export const updateDashboard = async (id: string, dashboard: Partial<Dashboard>): Promise<Dashboard> => {
  const response = await api.put(`/dashboards/${id}`, dashboard);
  return response.data;
};

export const deleteDashboard = async (id: string): Promise<void> => {
  await api.delete(`/dashboards/${id}`);
};

export const publishDashboard = async (id: string): Promise<Dashboard> => {
  const response = await api.post(`/dashboards/${id}/publish`);
  return response.data;
};

export const unpublishDashboard = async (id: string): Promise<Dashboard> => {
  const response = await api.post(`/dashboards/${id}/unpublish`);
  return response.data;
}; 