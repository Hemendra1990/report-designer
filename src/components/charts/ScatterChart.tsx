'use client';

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface ScatterChartProps {
  data: ChartData;
  config: any
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-700 mt-1">
          X: <span className="font-medium">{payload[0].value}</span>
        </p>
        <p className="text-sm text-gray-700">
          Y: <span className="font-medium">{payload[1].value}</span>
        </p>
        {payload[2] && (
          <p className="text-sm text-gray-700">
            Z: <span className="font-medium">{payload[2].value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function ScatterChart({ data, config }: ScatterChartProps) {
  // Transform the data for the scatter chart
  // We'll use pairs of values from each dataset
  const transformData = () => {
    // Each label represents a point, and we use adjacent pairs in datasets for x,y values
    return data.labels.map((label, i) => {
      // Get values from datasets (using pairs for x,y coordinates)
      const values = data.datasets.map(dataset => {
        const xValue = dataset.data[i * 2] || 0;
        const yValue = dataset.data[i * 2 + 1] || 0;
        return { xValue, yValue };
      });
      
      // Return a point for each label
      return {
        name: label,
        x: values[0]?.xValue || 0,
        y: values[0]?.yValue || 0,
        z: values[1]?.xValue || 50 // Optional Z value for point size
      };
    });
  };

  const scatterData = transformData();

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="X-Axis" 
            domain={['auto', 'auto']}
            tick={{ fill: '#6B7280' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Y-Axis"
            domain={['auto', 'auto']}
            tick={{ fill: '#6B7280' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <ZAxis 
            type="number" 
            dataKey="z" 
            range={[40, 160]} 
            domain={['auto', 'auto']} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter 
            name={data.datasets[0]?.label || "Data Points"} 
            data={scatterData} 
            fill={COLORS[0]}
            shape="circle"
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
} 