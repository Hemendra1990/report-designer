'use client';

import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { ScatterChart } from './charts/ScatterChart';
import { GroupedBarChart } from './charts/GroupedBarChart';
import { StackedBarChart } from './charts/StackedBarChart';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface ChartPreviewProps {
  type: 'bar' | 'line' | 'pie' | 'grouped-bar' | 'stacked-bar' | 'funnel' | 'scatter' | 'gauge' | 'metric' | 'table';
  data?: ChartData;
}

export function ChartPreview({ type, data }: ChartPreviewProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <BarChart data={data} />;
      case 'line':
        return <LineChart data={data} />;
      case 'pie':
        return <PieChart data={data} />;
      case 'scatter':
        return <ScatterChart data={data} />;
      case 'grouped-bar':
        return <GroupedBarChart data={data} />;
      case 'stacked-bar':
        return <StackedBarChart data={data} />;
      // Add more chart types as needed
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Chart type not implemented yet</p>
          </div>
        );
    }
  };

  // Render chart directly without any wrapper
  return renderChart();
} 