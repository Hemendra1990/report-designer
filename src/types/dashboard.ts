export type ChartType = 'bar' | 'line' | 'pie' | 'grouped-bar' | 'stacked-bar' | 'funnel' | 'scatter' | 'gauge' | 'metric' | 'table';

export interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'text' | 'image';
  title: string;
  layout: Layout;
  reportId?: string;
  chartType?: ChartType;
  yAxisFields?: string[];
  xAxisField?: string;
  displayUnits?: string;
  content?: string;
  imageUrl?: string;
}

export interface DashboardData {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layouts: { [key: string]: Layout[] };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
} 