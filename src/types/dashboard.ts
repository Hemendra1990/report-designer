export type LayoutSize = 'sm' | 'md' | 'lg' | 'xl';

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'scatter';

export interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  size?: LayoutSize;
}

// Widget sizes for the dashboard grid
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

// Basic chart data structure
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Chart Customization Interfaces

export interface ResponsiveConfig {
  width: string | number;
  height: string | number;
  aspect?: number;
  minWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  debounce?: number;
}

export interface AxisTickConfig {
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  angle?: number;
}

export interface CartesianAxisConfig {
  label?: string;
  tick?: AxisTickConfig;
  axisLine?: { stroke: string };
  domain?: [number, number];
}

export interface GridConfig {
  horizontal?: boolean;
  vertical?: boolean;
  horizontalPoints?: number[];
  verticalPoints?: number[];
  stroke?: string;
  strokeWidth?: number;
}

// Allow GridConfig to be a boolean to toggle grid entirely
export type GridConfigType = GridConfig | boolean;

export interface MarginConfig {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface TooltipConfig {
  show?: boolean;
  cursor?: { fill: string } | boolean;
  contentStyle?: React.CSSProperties;
  formatter?: ((value: any, name?: any, props?: any) => React.ReactNode) | null;
  customFormatter?: (value: any, name: any, props: any) => React.ReactNode;
  labelFormatter?: (label: any) => React.ReactNode;
  isAnimationActive?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  offset?: number;
  position?: object;
  allowEscapeViewBox?: {
    x?: boolean;
    y?: boolean;
  };
  active?: boolean;
  wrapperStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
}

export interface LegendConfig {
  show?: boolean;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  position?: 'top' | 'bottom' | 'left' | 'right';
  layout?: 'horizontal' | 'vertical';
  iconSize?: number;
  iconType?: 'circle' | 'square' | 'rect' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
  formatter?: (value: any, entry: any) => React.ReactNode;
}

export interface LabelConfig {
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'insideTopLeft' | 'insideTopRight' | 'insideBottomLeft' | 'insideBottomRight';
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  angle?: number;
  formatter?: (value: any) => React.ReactNode;
  value?: string | number;
}

export interface CommonChartConfig {
  title?: string;
  description?: string;
  responsive?: ResponsiveConfig;
  margin?: MarginConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  isAnimationActive?: boolean;
  animationDuration?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  colors?: string[];
}

export interface CartesianChartConfig extends CommonChartConfig {
  xAxis?: CartesianAxisConfig;
  yAxis?: CartesianAxisConfig;
  grid?: GridConfigType;
  barSize?: number;
  barGap?: number;
  maxBarSize?: number;
  stackOffset?: 'none' | 'expand' | 'wiggle' | 'silhouette' | 'sign';
  syncId?: string;
  layout?: 'horizontal' | 'vertical';
  strokeWidth?: number;
  barCategoryGap?: number | string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  colors?: string[];
}

export interface PieChartConfig extends CommonChartConfig {
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  paddingAngle?: number;
  nameKey?: string;
  dataKey?: string;
  cx?: number | string;
  cy?: number | string;
  activeIndex?: number;
}

export interface RadarChartConfig extends CommonChartConfig {
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  nameKey?: string;
  dataKey?: string;
  cx?: number | string;
  cy?: number | string;
}

// Combined chart configuration
export interface ChartConfig {
  cartesian?: CartesianChartConfig;
  pie?: PieChartConfig;
  radar?: RadarChartConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'text' | 'image';
  title: string;
  layout: Layout;
  reportId?: string;
  chartType?: ChartType;
  yAxisFields?: string[];
  xAxisField?: string;
  displayUnits?: string;
  content?: string;
  imageUrl?: string;
  config?: ChartConfig;
}

export interface DashboardData {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layouts: { [key: string]: Layout[] };
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  isPublic?: boolean;
  teamId?: string;
}

// Dashboard layout data
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
}

// Dashboard data with multiple dashboards
export interface DashboardCollection {
  dashboards: Dashboard[];
  activeDashboard?: string;
} 