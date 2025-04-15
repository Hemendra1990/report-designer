'use client';

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  Sector
} from 'recharts';
import { PieChartConfig } from '@/types/dashboard';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface DoughnutChartProps {
  data: ChartData;
  config?: PieChartConfig;
}

export function DoughnutChart({ data, config }: DoughnutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Transform data into Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));
  
  // Modern vibrant color palette
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  
  // Apply configuration options or use defaults
  const responsiveConfig = config?.responsive || {};
  const tooltipConfig = config?.tooltip || {};
  const legendConfig = config?.legend || {};
  const margin = config?.margin || { top: 10, right: 10, bottom: 10, left: 10 };
  
  // Animation settings
  const animationDuration = config?.animationDuration ?? 800;
  const animationEasing = config?.animationEasing || 'ease-out';
  const isAnimationActive = config?.isAnimationActive ?? true;
  
  // Pie chart specific settings
  const innerRadius = config?.innerRadius ?? 70;
  const outerRadius = config?.outerRadius ?? 90;
  const paddingAngle = config?.paddingAngle ?? 3;
  const startAngle = config?.startAngle ?? 0;
  const endAngle = config?.endAngle ?? 360;
  const cx = config?.cx ?? '50%';
  const cy = config?.cy ?? '50%';
  const dataKey = config?.dataKey ?? 'value';
  const nameKey = config?.nameKey ?? 'name';
  
  // Handle activeIndex from config if set
  const configActiveIndex = config?.activeIndex;
  const activeShape = config?.activeShape;
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (tooltipConfig.customContent) {
      if (typeof tooltipConfig.customContent === 'function') {
        return tooltipConfig.customContent({ active, payload });
      }
      return tooltipConfig.customContent;
    }
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-700 mt-1">
            Value: <span className="font-medium">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Active shape renderer for hover effect
  const defaultRenderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value 
    } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#333" fontSize={14}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 5} dy={8} textAnchor="middle" fill="#111" fontSize={16} fontWeight="bold">
          {value.toLocaleString()}
        </text>
        <text x={cx} y={cy + 25} dy={8} textAnchor="middle" fill="#666" fontSize={12}>
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    if (configActiveIndex === undefined) {
      setActiveIndex(index);
    }
  };

  const onPieLeave = () => {
    if (configActiveIndex === undefined) {
      setActiveIndex(null);
    }
  };

  // Determine the final active index
  const finalActiveIndex = configActiveIndex !== undefined
    ? configActiveIndex
    : activeIndex !== null ? activeIndex : undefined;

  // Determine the active shape renderer
  const finalActiveShape = activeShape || defaultRenderActiveShape;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer 
        width={responsiveConfig.width || '100%'}
        height={responsiveConfig.height || '100%'}
        aspect={responsiveConfig.aspect}
        minWidth={responsiveConfig.minWidth}
        minHeight={responsiveConfig.minHeight}
        maxHeight={responsiveConfig.maxHeight}
        debounce={responsiveConfig.debounce}
      >
        <PieChart margin={margin}>
          <Pie
            activeIndex={finalActiveIndex}
            activeShape={finalActiveShape}
            data={chartData}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey={dataKey}
            nameKey={nameKey}
            startAngle={startAngle}
            endAngle={endAngle}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={isAnimationActive ? animationDuration : 0}
            animationEasing={animationEasing}
            isAnimationActive={isAnimationActive}
            label={config?.label}
            labelLine={config?.labelLine}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            position={tooltipConfig.position}
            offset={tooltipConfig.offset}
            allowEscapeViewBox={tooltipConfig.allowEscapeViewBox}
            cursor={tooltipConfig.cursor}
            active={tooltipConfig.active}
            isAnimationActive={tooltipConfig.isAnimationActive ?? isAnimationActive}
            animationDuration={tooltipConfig.animationDuration ?? animationDuration}
            animationEasing={tooltipConfig.animationEasing ?? animationEasing}
            formatter={tooltipConfig.formatter}
            labelFormatter={tooltipConfig.labelFormatter}
            contentStyle={tooltipConfig.contentStyle}
            itemStyle={tooltipConfig.itemStyle}
            labelStyle={tooltipConfig.labelStyle}
            wrapperStyle={tooltipConfig.wrapperStyle}
          />
          <Legend 
            align={legendConfig.align || 'center'}
            verticalAlign={legendConfig.verticalAlign || 'bottom'}
            layout={legendConfig.layout || 'horizontal'}
            iconSize={legendConfig.iconSize || 10}
            iconType={legendConfig.iconType || 'circle'}
            wrapperStyle={legendConfig.wrapperStyle || { paddingTop: 20 }}
            formatter={legendConfig.formatter}
            onClick={legendConfig.onClick}
            onMouseEnter={legendConfig.onMouseEnter}
            onMouseLeave={legendConfig.onMouseLeave}
            content={legendConfig.content}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 