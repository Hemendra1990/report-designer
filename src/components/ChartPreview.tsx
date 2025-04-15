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
}

export function ChartPreview({ type, data, width = 400, height = 300 }: ChartPreviewProps) {
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

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <BarChart data={chartData} />;
      case 'line':
        return <LineChart data={chartData} />;
      case 'pie':
        return <PieChart data={chartData} />;
      case 'doughnut':
        return <DoughnutChart data={chartData} />;
      case 'scatter':
        return <ScatterChart data={chartData} />;
      case 'grouped-bar':
        return <GroupedBarChart data={chartData} />;
      case 'stacked-bar':
        return <StackedBarChart data={chartData} />;
      case 'funnel':
        return <FunnelChart data={chartData} />;
      case 'gauge':
        return <GaugeChart data={chartData} />;
      case 'metric':
        return <MetricChart data={chartData} />;
      case 'table':
        return <DataTable data={chartData} />;
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