'use client';

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  FunnelChart as RechartsFunnelChart, 
  Funnel, 
  LabelList, 
  Tooltip,
  Cell
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface FunnelChartProps {
  data: ChartData;
}

export function FunnelChart({ data }: FunnelChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Transform data into Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));
  
  // Generate colors with gradient effect
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-700">
            Value: <span className="font-medium">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsFunnelChart
          width={500}
          height={300}
        >
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            data={chartData}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-in-out"
            nameKey="name"
            onClick={(data: any, index: number) => setActiveIndex(index)}
          >
            <LabelList 
              position="right" 
              fill="#555" 
              stroke="none" 
              dataKey="name" 
              fontSize={12}
            />
            <LabelList 
              position="right" 
              fill="#333"
              stroke="none" 
              dataKey="value" 
              fontSize={12}
              formatter={(value: number) => value.toLocaleString()}
              offset={60}
            />
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={activeIndex === index ? 1 : 0.8}
                stroke="#fff"
                strokeWidth={activeIndex === index ? 2 : 1}
              />
            ))}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
} 