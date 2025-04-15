'use client';

import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { ScatterChart } from './charts/ScatterChart';
import { GroupedBarChart } from './charts/GroupedBarChart';
import { StackedBarChart } from './charts/StackedBarChart';
import { FunnelChart } from './charts/FunnelChart';
import { DoughnutChart } from './charts/DoughnutChart';
import { GaugeChart } from './charts/GaugeChart';
import { MetricChart } from './charts/MetricChart';
import { DataTable } from './charts/DataTable';
import { 
  ChartConfig, 
  CartesianChartConfig,
  PieChartConfig,
  FunnelChartConfig,
  ScatterChartConfig,
  GaugeChartConfig,
  MetricChartConfig,
  DataTableConfig
} from '@/types/dashboard';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface ChartPreviewProps {
  type: 'bar' | 'line' | 'pie' | 'grouped-bar' | 'stacked-bar' | 'funnel' | 'scatter' | 'gauge' | 'metric' | 'table' | 'doughnut';
  data?: ChartData;
  width?: number;
  height?: number;
  config?: ChartConfig;
}

export function ChartPreview({ type, data, width = 400, height = 300, config }: ChartPreviewProps) {
  // Create sample data if no data is provided
  const sampleData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55]
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86, 27]
      }
    ]
  };

  // Use provided data or fallback to sample data
  const chartData = data || sampleData;

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Get appropriate config based on chart type
  const getTypedConfig = () => {
    if (!config) return undefined;
    
    switch (type) {
      case 'bar':
      case 'line':
      case 'grouped-bar':
      case 'stacked-bar':
        return config as CartesianChartConfig;
      case 'pie':
      case 'doughnut':
        return config as PieChartConfig;
      case 'funnel':
        return config as FunnelChartConfig;
      case 'scatter':
        return config as ScatterChartConfig;
      case 'gauge':
        return config as GaugeChartConfig;
      case 'metric':
        return config as MetricChartConfig;
      case 'table':
        return config as DataTableConfig;
      default:
        return undefined;
    }
  };

  const renderChart = () => {
    const typedConfig = getTypedConfig();
    
    switch (type) {
      case 'bar':
        return <BarChart data={chartData} config={typedConfig as CartesianChartConfig} />;
      case 'line':
        return <LineChart data={chartData} config={typedConfig as CartesianChartConfig} />;
      case 'pie':
        return <PieChart data={chartData} config={typedConfig as PieChartConfig} />;
      case 'doughnut':
        return <DoughnutChart data={chartData} config={typedConfig as PieChartConfig} />;
      case 'scatter':
        return <ScatterChart data={chartData} config={typedConfig as ScatterChartConfig} />;
      case 'grouped-bar':
        return <GroupedBarChart data={chartData} config={typedConfig as CartesianChartConfig} />;
      case 'stacked-bar':
        return <StackedBarChart data={chartData} config={typedConfig as CartesianChartConfig} />;
      case 'funnel':
        return <FunnelChart data={chartData} config={typedConfig as FunnelChartConfig} />;
      case 'gauge':
        return <GaugeChart data={chartData} config={typedConfig as GaugeChartConfig} />;
      case 'metric':
        return <MetricChart data={chartData} config={typedConfig as MetricChartConfig} />;
      case 'table':
        return <DataTable data={chartData} config={typedConfig as DataTableConfig} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Chart type not implemented yet</p>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      {renderChart()}
    </div>
  );
} 