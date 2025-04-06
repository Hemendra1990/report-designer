import api from './api';
import { Dashboard } from './dashboardService';
import { Report } from './reportService';

export interface Widget {
  id: string;
  name: string;
  description: string;
  dashboard: Dashboard;
  report: Report;
  type: string;
  configuration: string;
  position: string;
  size: string;
  refreshInterval: string;
  autoRefresh: boolean;
  filters: string;
  style: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllWidgets = async (): Promise<Widget[]> => {
  const response = await api.get('/widgets');
  return response.data;
};

export const getWidgetsByDashboard = async (dashboardId: string): Promise<Widget[]> => {
  const response = await api.get(`/widgets/dashboard/${dashboardId}`);
  return response.data;
};

export const getActiveWidgetsByDashboard = async (dashboardId: string): Promise<Widget[]> => {
  const response = await api.get(`/widgets/dashboard/${dashboardId}/active`);
  return response.data;
};

export const getWidgetsByReport = async (reportId: string): Promise<Widget[]> => {
  const response = await api.get(`/widgets/report/${reportId}`);
  return response.data;
};

export const getActiveWidgetsByReport = async (reportId: string): Promise<Widget[]> => {
  const response = await api.get(`/widgets/report/${reportId}/active`);
  return response.data;
};

export const getWidgetsByType = async (type: string): Promise<Widget[]> => {
  const response = await api.get(`/widgets/type/${type}`);
  return response.data;
};

export const getWidgetById = async (id: string): Promise<Widget> => {
  const response = await api.get(`/widgets/${id}`);
  return response.data;
};

export const createWidget = async (widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget> => {
  const response = await api.post('/widgets', widget);
  return response.data;
};

export const updateWidget = async (id: string, widget: Partial<Widget>): Promise<Widget> => {
  const response = await api.put(`/widgets/${id}`, widget);
  return response.data;
};

export const deleteWidget = async (id: string): Promise<void> => {
  await api.delete(`/widgets/${id}`);
};

export const executeWidget = async (id: string): Promise<any[]> => {
  const response = await api.post(`/widgets/${id}/execute`);
  return response.data;
}; 