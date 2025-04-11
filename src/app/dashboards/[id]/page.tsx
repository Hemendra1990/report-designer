'use client';

import { useState, useRef, useEffect, use } from 'react';
import { 
  Plus, 
  Filter, 
  Save, 
  Undo, 
  Redo, 
  Settings, 
  Check, 
  X, 
  Search,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Type,
  Image as ImageIcon,
  ChevronDown,
  Pencil,
  Eye,
  Table2,
  BarChart2,
  BarChart4,
  TrendingUp,
  Gauge,
  Calculator,
  ScatterChart
} from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ChartPreview } from '@/components/ChartPreview';
import { DashboardGrid } from '@/components/DashboardGrid';
import { DashboardData, DashboardWidget, Layout } from '@/types/dashboard';

const ResponsiveGridLayout = WidthProvider(Responsive);

type ChartType = 'bar' | 'line' | 'pie' | 'grouped-bar' | 'stacked-bar' | 'funnel' | 'scatter' | 'gauge' | 'metric' | 'table';

// Add mock data interface
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

// Mock API function
const fetchChartData = async (reportId: string): Promise<ChartData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86, 27],
      }
    ]
  };
};

interface WidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  isPreview?: boolean;
}

function Widget({ widget, onRemove, isPreview = false }: WidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (widget.type === 'chart' && widget.reportId) {
      const loadChartData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await fetchChartData(widget.reportId!);
          setChartData(data);
        } catch (err) {
          setError('Failed to load chart data');
        } finally {
          setIsLoading(false);
        }
      };

      loadChartData();
    } else {
      setIsLoading(false);
    }
  }, [widget.reportId, widget.type]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div className="bg-white rounded-lg shadow-sm border h-full w-full overflow-hidden relative">
        {!isPreview && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onRemove(widget.id)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className="h-full w-full p-4 widget-drag-handle"
        >
          {widget.type === 'chart' && (
            <>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading chart data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-red-500">
                    <X size={24} />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : chartData ? (
                <div className="w-full h-full">
                  <ChartPreview 
                    type={widget.chartType || 'bar'} 
                    data={chartData}
                    width={dimensions.width}
                    height={dimensions.height}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">No data available</p>
                </div>
              )}
            </>
          )}
          
          {widget.type === 'text' && (
            <textarea
              value={widget.content}
              readOnly={isPreview}
              className="w-full h-full border-none focus:outline-none resize-none bg-transparent"
              placeholder="Enter your text here"
            />
          )}
          
          {widget.type === 'image' && (
            <div className="flex items-center justify-center h-full w-full">
              <ImageIcon size={40} className="text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Report {
  id: string;
  name: string;
  createdBy: string;
  folder: string;
}

// Sample reports data (would come from API in real implementation)
const reports: Report[] = [
  {
    id: '1',
    name: 'New Demo With SS Report',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  },
  {
    id: '2',
    name: 'Sales Performance',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  },
  {
    id: '3',
    name: 'Customer Analysis',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  }
];

// Sample fields for chart configuration
const availableFields = [
  'Account Name',
  'Billing City',
  'Billing State',
  'Annual Revenue',
  'Industry',
  'Record Count'
];

export default function DashboardDesigner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dashboardId = resolvedParams.id;
  const isNew = dashboardId === 'new';
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    id: dashboardId,
    name: 'HemendraTest',
    widgets: [],
    layouts: {
      lg: [],
      md: [],
      sm: []
    }
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [yAxisFields, setYAxisFields] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState<string>('');
  const [displayUnits, setDisplayUnits] = useState<string>('');
  const [activeTab, setActiveTab] = useState('To Do List');
  
  const widgetMenuRef = useRef<HTMLDivElement>(null);
  const reportSelectorRef = useRef<HTMLDivElement>(null);
  const widgetConfigRef = useRef<HTMLDivElement>(null);

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load dashboard data from localStorage on mount
  useEffect(() => {
    if (!isNew) {
    const savedData = localStorage.getItem(`dashboard_${dashboardId}`);
    if (savedData) {
      setDashboardData(JSON.parse(savedData));
    }}
  }, [dashboardId,isNew]);

  // Save dashboard data to localStorage when it changes
  useEffect(() => {
    if (!isNew) {
      localStorage.setItem(`dashboard_${dashboardId}`, JSON.stringify(dashboardData));
    }
  }, [dashboardData, dashboardId,isNew]);

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setDashboardData(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        ...layouts
      },
      widgets: prev.widgets.map(widget => {
        const newLayout = layout.find(l => l.i === widget.id);
        if (newLayout) {
          return {
            ...widget,
            layout: newLayout
          };
        }
        return widget;
      })
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
        x: (dashboardData.widgets.length * 4) % 12, // Position horizontally based on number of widgets
        y: 0, // Start from top
        w: 4, // Smaller initial width
        h: 3, // Smaller initial height
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

  const handleSaveWidget = () => {
    if (selectedReport) {
      const id = Math.random().toString(36).substr(2, 9);
      const newLayout = {
        i: id,
        x: (dashboardData.widgets.length * 4) % 12, // Position horizontally based on number of widgets
        y: 0, // Start from top
        w: 4, // Smaller initial width
        h: 4, // Reasonable height for charts
        minW: 2,
        minH: 2
      };

      const newWidget: DashboardWidget = {
        id,
        type: 'chart',
        title: selectedReport.name,
        layout: newLayout,
        reportId: selectedReport.id,
        chartType,
        yAxisFields,
        xAxisField,
        displayUnits
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

  const handleToggleYAxisField = (field: string) => {
    if (yAxisFields.includes(field)) {
      setYAxisFields(yAxisFields.filter(f => f !== field));
    } else {
      setYAxisFields([...yAxisFields, field]);
    }
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

  const handleWidgetContentChange = (widgetId: string, content: string) => {
    setDashboardData(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, content } : widget
      )
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="text"
              autoFocus
              value={dashboardData.name}
              onChange={(e) => setDashboardData(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              readOnly={isPreviewMode}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {!isPreviewMode && (
              <>
                <div className="relative" ref={widgetMenuRef}>
                  <button
                    onClick={() => setShowWidgetMenu(!showWidgetMenu)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-1" />
                    Widget
                  </button>
                  
                  {showWidgetMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10 border">
                      <div className="py-1">
                        <button
                          onClick={() => handleAddWidget('chart')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BarChart3 size={16} className="mr-2" />
                          Chart or Table
                        </button>
                        <button
                          onClick={() => handleAddWidget('text')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Type size={16} className="mr-2" />
                          Text
                        </button>
                        <button
                          onClick={() => handleAddWidget('image')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ImageIcon size={16} className="mr-2" />
                          Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  <Filter size={16} className="mr-1" />
                  Filter
                </button>
                
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Save size={20} />
                </button>
                
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Undo size={20} />
                </button>
                
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Redo size={20} />
                </button>
                
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Settings size={20} />
                </button>
              </>
            )}
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Eye size={16} className="mr-1" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>

            {!isPreviewMode && (
              <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Check size={16} className="mr-1" />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Dashboard Canvas */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className={`bg-white rounded-lg shadow-sm border min-h-[600px] relative ${isPreviewMode ? 'p-4' : 'p-4'}`}>
          <DashboardGrid 
            widgets={dashboardData.widgets}
            layouts={dashboardData.layouts}
            isPreviewMode={isPreviewMode}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={setCurrentBreakpoint}
            onRemoveWidget={handleRemoveWidget}
            onWidgetContentChange={handleWidgetContentChange}
          />
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-[1400px] mx-auto px-4">
          <button
            onClick={() => setActiveTab('To Do List')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'To Do List'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            To Do List
          </button>
        </div>
      </div>
      
      {/* Report Selector Modal */}
      {showReportSelector && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowReportSelector(false)} />
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl relative" ref={reportSelectorRef}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Select Report</h2>
                <button
                  onClick={() => setShowReportSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Private Reports</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="font-medium text-gray-900">{report.name}</div>
                    <div className="text-sm text-gray-500">Created by {report.createdBy}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Widget Configuration Modal */}
      {showWidgetConfig && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowWidgetConfig(false)} />
          <div className="bg-white rounded-lg w-full max-w-[1100px] shadow-xl relative" ref={widgetConfigRef}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Add Widget</h2>
            </div>
            
            <div className="flex">
              {/* Left Panel - Configuration */}
              <div className="w-1/2 border-r p-6">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm mb-2">Report</label>
                    <div className="flex items-center justify-between p-2 border rounded bg-white">
                      <span>{selectedReport.name}</span>
                      <button 
                        onClick={() => {
                          setShowWidgetConfig(false);
                          setShowReportSelector(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span>Use chart settings from report</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Display As</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { type: 'table' as ChartType, icon: Table2, label: 'Table' },
                        { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
                        { type: 'grouped-bar' as ChartType, icon: BarChart2, label: 'Grouped Bar' },
                        { type: 'stacked-bar' as ChartType, icon: BarChart4, label: 'Stacked Bar' },
                        { type: 'line' as ChartType, icon: LineChart, label: 'Line' },
                        { type: 'pie' as ChartType, icon: PieChart, label: 'Pie' },
                        { type: 'funnel' as ChartType, icon: TrendingUp, label: 'Funnel' },
                        { type: 'scatter' as ChartType, icon: ScatterChart, label: 'Scatter' },
                        { type: 'gauge' as ChartType, icon: Gauge, label: 'Gauge' },
                        { type: 'metric' as ChartType, icon: Calculator, label: 'Metric' }
                      ].map((chart) => {
                        const Icon = chart.icon; 
                        return (<button
                          key={chart.type}
                          onClick={() => setChartType(chart.type)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded border ${
                            chartType === chart.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }}`}
                        >
                          {/* <span className="text-base mb-0.5">{chart.icon}</span> */}
                          <Icon
                            size={18}
                            className={`mb-1 ${chartType === chart.type ? 'text-blue-500' : 'text-gray-600'
                              }`}
                          />
                          <span className="text-xs">{chart.label}</span>
                        </button>
)})}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Y-Axis</label>
                    <div className="space-y-2">
                      {yAxisFields.map((field) => (
                        <div
                          key={field}
                          className="flex items-center justify-between p-2 border rounded bg-white"
                        >
                          <span className="text-sm">{field}</span>
                          <button 
                            onClick={() => setYAxisFields(yAxisFields.filter(f => f !== field))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const field = availableFields.find(f => !yAxisFields.includes(f));
                          if (field) setYAxisFields([...yAxisFields, field]);
                        }}
                        className="flex items-center justify-center w-full p-2 border rounded text-gray-500 hover:bg-gray-50 text-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Field
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">X-Axis</label>
                    <select
                      value={xAxisField || 'Record Count'}
                      onChange={(e) => setXAxisField(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="Record Count">Record Count</option>
                      {availableFields.map((field) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Display Units</label>
                    <select
                      value={displayUnits || 'shortened'}
                      onChange={(e) => setDisplayUnits(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="shortened">Shortened Number</option>
                      <option value="currency">Currency</option>
                      <option value="percentage">Percentage</option>
                      <option value="decimal">Decimal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div className="w-1/2 p-6 bg-gray-50">
                <div className="mb-3">
                  <h3 className="text-sm">Preview</h3>
                </div>
                <div className="bg-white rounded p-6 flex flex-col items-center justify-center min-h-[400px]">
                  <h2 className="text-base mb-6">{selectedReport.name}</h2>
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <BarChart3 size={32} className="mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500">We can't draw this chart because there is no data.</p>
                  </div>
                  <div className="mt-6">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      View Report ({selectedReport.name})
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowWidgetConfig(false)}
                className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWidget}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 