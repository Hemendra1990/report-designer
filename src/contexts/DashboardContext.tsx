'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardData, DashboardWidget, Layout, ChartType, ChartConfig } from '@/types/dashboard';
import { Report } from '@/types/report';
import { fetchChartData } from '@/services/chartService';

interface DashboardContextType {
  dashboardData: DashboardData;
  currentBreakpoint: string;
  isPreviewMode: boolean;
  showWidgetMenu: boolean;
  showReportSelector: boolean;
  showWidgetConfig: boolean;
  selectedReport: Report | null;
  searchTerm: string;
  chartType: ChartType;
  yAxisFields: string[];
  xAxisField: string;
  displayUnits: string;
  availableFields: string[];
  activeTab: string;
  
  // Actions
  setDashboardData: (data: DashboardData) => void;
  setCurrentBreakpoint: (breakpoint: string) => void;
  togglePreviewMode: () => void;
  toggleWidgetMenu: () => void;
  toggleReportSelector: (show: boolean) => void;
  toggleWidgetConfig: (show: boolean) => void;
  setSelectedReport: (report: Report | null) => void;
  setSearchTerm: (term: string) => void;
  setChartType: (type: ChartType) => void;
  toggleYAxisField: (field: string) => void;
  setXAxisField: (field: string) => void;
  setDisplayUnits: (units: string) => void;
  setActiveTab: (tab: string) => void;
  
  // Dashboard operations
  handleLayoutChange: (layout: Layout[]) => void;
  handleRemoveWidget: (id: string) => void;
  handleAddWidget: (type: 'chart' | 'text' | 'image') => void;
  handleSaveWidget: (chartConfig?: ChartConfig) => void;
  handleSelectReport: (report: Report) => void;
  handleWidgetContentChange: (widgetId: string, content: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialDashboardId: string;
}

// Sample fields for chart configuration
const defaultAvailableFields = [
  'Account Name',
  'Billing City',
  'Billing State',
  'Annual Revenue',
  'Industry',
  'Record Count'
];

export function DashboardProvider({ children, initialDashboardId }: DashboardProviderProps) {
  const isNew = initialDashboardId === 'new';
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    id: initialDashboardId,
    name: 'New Dashboard',
    widgets: [],
    layouts: {
      lg: [],
      md: [],
      sm: []
    }
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [yAxisFields, setYAxisFields] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState<string>('');
  const [displayUnits, setDisplayUnits] = useState<string>('');
  const [activeTab, setActiveTab] = useState('data-chart');
  
  // Load dashboard data from localStorage on mount
  useEffect(() => {
    if (!isNew) {
      const savedData = localStorage.getItem(`dashboard_${initialDashboardId}`);
      if (savedData) {
        setDashboardData(JSON.parse(savedData));
      }
    }
  }, [initialDashboardId, isNew]);

  // Save dashboard data to localStorage when it changes
  useEffect(() => {
    if (!isNew) {
      localStorage.setItem(`dashboard_${initialDashboardId}`, JSON.stringify(dashboardData));
    }
  }, [dashboardData, initialDashboardId, isNew]);

  const handleLayoutChange = (layout: Layout[]) => {
    setDashboardData(prev => {
      const currentSmLayout = prev.layouts?.sm || [];
      const updatedSmLayout = layout.map(newItem => {
        const existingItem = currentSmLayout.find(oldItem => oldItem.i === newItem.i);
        return { ...(existingItem || {}), ...newItem };
      });

      const updatedLayouts = { ...prev.layouts };
      Object.keys(updatedLayouts).forEach(bp => {
        updatedLayouts[bp] = updatedSmLayout.map(l => ({ ...l }));
      });

      return {
        ...prev,
        layouts: updatedLayouts,
        widgets: prev.widgets.map(widget => {
          const newLayoutItem = layout.find(l => l.i === widget.id);
          if (newLayoutItem) {
            return {
              ...widget,
              layout: { ...widget.layout, ...newLayoutItem }
            };
          }
          return widget;
        })
      };
    });
  };

  const handleRemoveWidget = (id: string) => {
    setDashboardData(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id),
      layouts: Object.keys(prev.layouts).reduce((acc, breakpoint) => ({
        ...acc,
        [breakpoint]: prev.layouts[breakpoint].filter(l => l.i !== id)
      }), {} as { [key: string]: Layout[] })
    }));
  };

  const handleAddWidget = (type: 'chart' | 'text' | 'image') => {
    setShowWidgetMenu(false);

    if (type === 'chart') {
      setShowReportSelector(true);
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      const newLayout = {
        i: id,
        x: (dashboardData.widgets.length * 4) % 12,
        y: 0,
        w: 4,
        h: 3,
        minW: 2,
        minH: 2
      };

      const newWidget: DashboardWidget = {
        id,
        type,
        title: type === 'text' ? 'Text Widget' : 'Image Widget',
        layout: newLayout,
        content: type === 'text' ? 'Enter your text here' : '',
        imageUrl: type === 'image' ? '/placeholder-image.jpg' : ''
      };

      setDashboardData(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        layouts: {
          lg: [...(prev.layouts.lg || []), newLayout],
          md: [...(prev.layouts.md || []), { ...newLayout, w: 3 }],
          sm: [...(prev.layouts.sm || []), { ...newLayout, w: 2 }]
        }
      }));
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportSelector(false);
    setShowWidgetConfig(true);
  };

  const handleSaveWidget = (chartConfig?: ChartConfig) => {
    if (selectedReport) {
      const id = Math.random().toString(36).substr(2, 9);
      const newLayout = {
        i: id,
        x: (dashboardData.widgets.length * 4) % 12,
        y: 0,
        w: 4,
        h: 4,
        minW: 2,
        minH: 2
      };

      const newWidget: DashboardWidget = {
        id,
        type: 'chart',
        title: selectedReport.name,
        layout: newLayout,
        reportId: selectedReport.id,
        chartType: chartType,
        yAxisFields,
        xAxisField,
        displayUnits,
        config: chartConfig
      };

      setDashboardData(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        layouts: {
          lg: [...(prev.layouts.lg || []), newLayout],
          md: [...(prev.layouts.md || []), { ...newLayout, w: 3 }],
          sm: [...(prev.layouts.sm || []), { ...newLayout, w: 2 }]
        }
      }));

      setShowWidgetConfig(false);
      setSelectedReport(null);
      setChartType('bar');
      setYAxisFields([]);
      setXAxisField('');
      setDisplayUnits('');
    }
  };

  const toggleYAxisField = (field: string) => {
    setYAxisFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
  };

  const handleWidgetContentChange = (widgetId: string, content: string) => {
    setDashboardData(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, content } : widget
      )
    }));
  };

  const togglePreviewMode = () => setIsPreviewMode(prev => !prev);
  const toggleWidgetMenu = () => setShowWidgetMenu(prev => !prev);
  const toggleReportSelector = (show: boolean) => setShowReportSelector(show);
  const toggleWidgetConfig = (show: boolean) => setShowWidgetConfig(show);

  const value = {
    dashboardData,
    currentBreakpoint,
    isPreviewMode,
    showWidgetMenu,
    showReportSelector,
    showWidgetConfig,
    selectedReport,
    searchTerm,
    chartType,
    yAxisFields,
    xAxisField,
    displayUnits,
    availableFields: defaultAvailableFields,
    activeTab,
    
    setDashboardData,
    setCurrentBreakpoint,
    togglePreviewMode,
    toggleWidgetMenu,
    toggleReportSelector,
    toggleWidgetConfig,
    setSelectedReport,
    setSearchTerm,
    setChartType,
    toggleYAxisField,
    setXAxisField,
    setDisplayUnits,
    setActiveTab,
    
    handleLayoutChange,
    handleRemoveWidget,
    handleAddWidget,
    handleSaveWidget,
    handleSelectReport,
    handleWidgetContentChange
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 