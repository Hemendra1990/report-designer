'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Text,
  Label
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface GaugeChartProps {
  data: ChartData;
}

interface ViewBoxType {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  width?: number;
  height?: number;
}

// Custom text component to render the value
const ValueText = ({ x, y, value }: { x: number; y: number; value: number }) => {
  return (
    <g>
      <text
        x={x}
        y={y - 20}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-2xl font-bold"
        fill="#111827"
      >
        {value}%
      </text>
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm"
        fill="#6B7280"
      >
        Completion
      </text>
    </g>
  );
};

export function GaugeChart({ data }: GaugeChartProps) {
  // Use the first value from the dataset as the gauge value (0-100)
  const gaugeValue = Math.min(100, Math.max(0, data.datasets[0]?.data[0] || 0));
  
  // Calculate remaining percentage for the background
  const remaining = 100 - gaugeValue;
  
  // Create data for the gauge chart (actual value and remaining)
  const gaugeData = [
    { name: 'value', value: gaugeValue },
    { name: 'remaining', value: remaining }
  ];

  // Color settings based on value ranges
  const getColor = (value: number) => {
    if (value < 30) return '#EF4444'; // Red for low values
    if (value < 70) return '#F59E0B'; // Yellow/Orange for medium values
    return '#10B981'; // Green for high values
  };
  
  const color = getColor(gaugeValue);
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={0}
            dataKey="value"
            cornerRadius={gaugeValue === 100 ? 10 : 0} // Rounded corners if 100%
            animationDuration={1000}
            animationEasing="ease-out"
            isAnimationActive
          >
            <Cell 
              key="gauge-cell-value" 
              fill={color} 
              stroke="none"
            />
            <Cell 
              key="gauge-cell-remaining" 
              fill="#F3F4F6" // Light gray background
              stroke="none"
            />
            <Label
              content={({ viewBox }) => {
                if (!viewBox) return null;
                const { cx = 0, cy = 0 } = viewBox as ViewBoxType;
                return <ValueText x={cx} y={cy} value={gaugeValue} />;
              }}
              position="center"
            />
          </Pie>
          
          {/* Optional decorative elements: marks for ranges */}
          <Pie
            data={[
              { name: '0%', value: 5 },
              { name: '25%', value: 5 },
              { name: '50%', value: 5 },
              { name: '75%', value: 5 },
              { name: '100%', value: 5 },
            ]}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={110}
            outerRadius={113}
            paddingAngle={22.5}
            dataKey="value"
            isAnimationActive={false}
          >
            {[0, 25, 50, 75, 100].map((mark, index) => (
              <Cell 
                key={`mark-${index}`} 
                fill="#94A3B8" 
                stroke="none" 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend for the gauge values */}
      <div className="flex justify-between px-10 pb-2 -mt-4">
        <span className="text-xs text-gray-500">0%</span>
        <span className="text-xs text-gray-500">100%</span>
      </div>
    </div>
  );
} 