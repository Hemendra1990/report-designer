'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartConfig } from '@/types/dashboard';

// Define fallback data
const fallbackData = [
  { name: 'Electronics', value: 850000 },
  { name: 'Clothing', value: 620000 },
  { name: 'Home & Garden', value: 480000 },
  { name: 'Sports', value: 350000 },
];

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#4f46e5', '#818cf8', '#a5b4fc'];

// Define the props type more explicitly
interface PieChartProps {
  data?: {
    labels?: string[];
    datasets?: {
      label?: string;
      data?: number[];
    }[];
  };
  config?: ChartConfig;
}

export function PieChart({ data, config }: PieChartProps) {
  // Transform data from ChartPreview format to PieChart format
  // Only if both data and its required properties exist
  const transformedData = 
    data?.labels && 
    data.datasets?.[0]?.data ? 
      data.labels.map((label, index) => ({
        name: label,
        value: data.datasets[0].data[index] || 0
      })) 
      : fallbackData;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          label={(entry) => `${entry.name}`}
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
} 