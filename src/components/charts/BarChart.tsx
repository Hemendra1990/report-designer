'use client';

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface BarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
}

export function BarChart({ data, width, height }: BarChartProps) {
  // Transform data into Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    ...data.datasets.reduce((acc, dataset) => ({
      ...acc,
      [dataset.label]: dataset.data[index]
    }), {})
  }));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={`hsl(${index * 360 / data.datasets.length}, 70%, 50%)`}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 