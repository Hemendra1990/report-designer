'use client';

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Text, Label } from 'recharts';
import { CartesianChartConfig } from '@/types/dashboard';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface BarChartProps {
  data: ChartData;
  config?: CartesianChartConfig;
}

export function BarChart({ data, config }: BarChartProps) {
  // Transform data into Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    ...data.datasets.reduce((acc, dataset) => ({
      ...acc,
      [dataset.label]: dataset.data[index]
    }), {})
  }));

  // Generate random colors for bars if not specified in config
  const getBarColors = (index: number) => {
    const defaultColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'
    ];
    return defaultColors[index % defaultColors.length];
  };

  // Apply responsive container config or use defaults
  const responsiveConfig = config?.responsive || {};
  const tooltipConfig = config?.tooltip || {};
  const legendConfig = config?.legend || {};
  const margin = config?.margin || { top: 20, right: 30, left: 20, bottom: 10 };
  const xAxisConfig = config?.xAxis || {};
  const yAxisConfig = config?.yAxis || {};
  const gridConfig = config?.grid || { horizontal: true, vertical: false };
  
  // Animation settings
  const animationDuration = config?.animationDuration ?? 800;
  const animationEasing = config?.animationEasing || 'ease-out';
  const isAnimationActive = config?.isAnimationActive ?? true;

  // Bar customization
  const barSize = config?.barSize;
  const barGap = config?.barGap;
  const barCategoryGap = config?.barCategoryGap;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer 
        width={responsiveConfig.width || '100%'} 
        height={responsiveConfig.height || '100%'}
        aspect={responsiveConfig.aspect}
        minWidth={responsiveConfig.minWidth}
        minHeight={responsiveConfig.minHeight}
        maxHeight={responsiveConfig.maxHeight}
        debounce={responsiveConfig.debounce}
      >
        <RechartsBarChart
          data={chartData}
          margin={margin}
          barSize={barSize}
          barGap={barGap}
          barCategoryGap={barCategoryGap}
          className="focus:outline-none"
          {...(isAnimationActive ? {
            animationDuration,
            animationEasing
          } : {})}
        >
          {/* Grid Configuration */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={gridConfig.horizontal}
            vertical={gridConfig.vertical}
            stroke={gridConfig.stroke || '#E5E7EB'}
            strokeWidth={gridConfig.strokeWidth}
          />
          
          {/* X-Axis Configuration */}
          <XAxis 
            dataKey="name" 
            axisLine={xAxisConfig.axisLine || { stroke: '#D1D5DB' }}
            tickLine={xAxisConfig.tickLine}
            tick={xAxisConfig.tick || { fill: '#6B7280', fontSize: 12 }}
            domain={xAxisConfig.domain || ['auto', 'auto']}
            padding={xAxisConfig.padding}
            allowDataOverflow={xAxisConfig.allowDataOverflow}
            allowDecimals={xAxisConfig.allowDecimals}
            hide={xAxisConfig.hide}
            tickCount={xAxisConfig.tickCount}
            minTickGap={xAxisConfig.minTickGap}
            interval={xAxisConfig.interval}
            reversed={xAxisConfig.reversed}
          >
            {xAxisConfig.label && (
              <Label 
                value={typeof xAxisConfig.label === 'string' || typeof xAxisConfig.label === 'number' 
                  ? xAxisConfig.label 
                  : xAxisConfig.label.value}
                position="insideBottom"
                offset={-5}
                style={{ textAnchor: 'middle', fontSize: 12, fill: '#6B7280' }}
                {...(typeof xAxisConfig.label !== 'string' && typeof xAxisConfig.label !== 'number' 
                  ? xAxisConfig.label 
                  : {})}
              />
            )}
          </XAxis>
          
          {/* Y-Axis Configuration */}
          <YAxis 
            axisLine={yAxisConfig.axisLine || { stroke: '#D1D5DB' }}
            tickLine={yAxisConfig.tickLine}
            tick={yAxisConfig.tick || { fill: '#6B7280', fontSize: 12 }}
            domain={yAxisConfig.domain || ['auto', 'auto']}
            padding={yAxisConfig.padding}
            allowDataOverflow={yAxisConfig.allowDataOverflow}
            allowDecimals={yAxisConfig.allowDecimals}
            hide={yAxisConfig.hide}
            tickCount={yAxisConfig.tickCount}
            minTickGap={yAxisConfig.minTickGap}
            interval={yAxisConfig.interval}
            reversed={yAxisConfig.reversed}
          >
            {yAxisConfig.label && (
              <Label 
                value={typeof yAxisConfig.label === 'string' || typeof yAxisConfig.label === 'number' 
                  ? yAxisConfig.label 
                  : yAxisConfig.label.value}
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle', fontSize: 12, fill: '#6B7280' }}
                {...(typeof yAxisConfig.label !== 'string' && typeof yAxisConfig.label !== 'number' 
                  ? yAxisConfig.label 
                  : {})}
              />
            )}
          </YAxis>
          
          {/* Tooltip Configuration */}
          <Tooltip 
            cursor={tooltipConfig.cursor || { fill: 'rgba(237, 242, 247, 0.8)' }}
            contentStyle={tooltipConfig.contentStyle || { 
              backgroundColor: 'white', 
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            formatter={tooltipConfig.formatter}
            labelFormatter={tooltipConfig.labelFormatter}
            position={tooltipConfig.position}
            offset={tooltipConfig.offset}
            allowEscapeViewBox={tooltipConfig.allowEscapeViewBox}
            active={tooltipConfig.active}
            isAnimationActive={tooltipConfig.isAnimationActive}
            animationDuration={tooltipConfig.animationDuration}
            animationEasing={tooltipConfig.animationEasing}
          />
          
          {/* Legend Configuration */}
          <Legend
            align={legendConfig.align || 'center'}
            verticalAlign={legendConfig.verticalAlign || 'bottom'}
            layout={legendConfig.layout || 'horizontal'}
            iconSize={legendConfig.iconSize || 10}
            iconType={legendConfig.iconType || 'square'}
            wrapperStyle={legendConfig.wrapperStyle || { paddingTop: 20 }}
            formatter={legendConfig.formatter}
            onClick={legendConfig.onClick}
            onMouseEnter={legendConfig.onMouseEnter}
            onMouseLeave={legendConfig.onMouseLeave}
          />
          
          {/* Dataset Bars */}
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={getBarColors(index)}
              isAnimationActive={isAnimationActive}
              animationDuration={animationDuration}
              animationEasing={animationEasing}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 