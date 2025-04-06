'use client';

import { useState, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Rnd } from 'react-rnd';

type ChartType = 'table' | 'bar' | 'groupedBar' | 'stackedBar' | 'line' | 'pie' | 'funnel' | 'scatter' | 'gauge' | 'metric';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'text' | 'image';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  reportId?: string;
  chartType?: ChartType;
  yAxisFields?: string[];
  xAxisField?: string;
  displayUnits?: string;
  content?: string;
  imageUrl?: string;
}

interface Report {
  id: string;
  name: string;
  createdBy: string;
  folder: string;
}

export default function DashboardDesigner({ params }: { params: { id: string } }) {
  const [dashboardName, setDashboardName] = useState('HemendraTest');
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [yAxisFields, setYAxisFields] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState<string>('');
  const [displayUnits, setDisplayUnits] = useState<string>('');
  const [activeTab, setActiveTab] = useState('To Do List');
  
  const widgetMenuRef = useRef<HTMLDivElement>(null);
  const reportSelectorRef = useRef<HTMLDivElement>(null);
  const widgetConfigRef = useRef<HTMLDivElement>(null);

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

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sample fields for chart configuration
  const availableFields = [
    'Account Name',
    'Billing City',
    'Billing State',
    'Annual Revenue',
    'Industry',
    'Record Count'
  ];

  const handleAddWidget = (type: 'chart' | 'text' | 'image') => {
    setShowWidgetMenu(false);
    
    if (type === 'chart') {
      setShowReportSelector(true);
    } else {
      // For text and image widgets, add directly
      const newWidget: DashboardWidget = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title: type === 'text' ? 'Text Widget' : 'Image Widget',
        position: { x: 20, y: 20 },
        size: { width: 300, height: 200 },
        content: type === 'text' ? 'Enter your text here' : '',
        imageUrl: type === 'image' ? '/placeholder-image.jpg' : ''
      };
      
      setWidgets([...widgets, newWidget]);
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportSelector(false);
    setShowWidgetConfig(true);
  };

  const handleSaveWidget = () => {
    if (selectedReport) {
      const newWidget: DashboardWidget = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'chart',
        title: selectedReport.name,
        position: { x: 20, y: 20 },
        size: { width: 400, height: 300 },
        reportId: selectedReport.id,
        chartType,
        yAxisFields,
        xAxisField,
        displayUnits
      };
      
      setWidgets([...widgets, newWidget]);
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Check size={16} className="mr-1" />
              Done
            </button>
          </div>
        </div>
      </div>
      
      {/* Dashboard Canvas */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border min-h-[600px] relative">
          {widgets.map((widget) => (
            <Rnd
              key={widget.id}
              default={{
                x: widget.position.x,
                y: widget.position.y,
                width: widget.size.width,
                height: widget.size.height,
              }}
              minWidth={200}
              minHeight={150}
              bounds="parent"
            >
              <div className="bg-white rounded-lg shadow-sm border h-full overflow-hidden">
                <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-medium text-sm">{widget.title}</h3>
                  <button className="text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="p-4 h-full">
                  {widget.type === 'chart' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <BarChart3 size={40} className="mb-2" />
                      <p className="text-center">We can't draw this chart because there is no data</p>
                    </div>
                  )}
                  
                  {widget.type === 'text' && (
                    <div className="h-full">
                      <textarea
                        value={widget.content}
                        className="w-full h-full border-none focus:outline-none resize-none"
                        placeholder="Enter your text here"
                      />
                    </div>
                  )}
                  
                  {widget.type === 'image' && (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon size={40} className="text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </Rnd>
          ))}
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
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl relative" ref={widgetConfigRef}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Add Widget</h2>
                <button
                  onClick={() => setShowWidgetConfig(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="font-medium">{selectedReport.name}</span>
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
                
                <div className="mt-4">
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
              </div>
            </div>
            
            <div className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Display As</h3>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[
                  { type: 'table' as ChartType, icon: '≡', label: 'Table' },
                  { type: 'bar' as ChartType, icon: '▌', label: 'Bar' },
                  { type: 'groupedBar' as ChartType, icon: '▌▌', label: 'Grouped Bar' },
                  { type: 'stackedBar' as ChartType, icon: '▌', label: 'Stacked Bar' },
                  { type: 'line' as ChartType, icon: '📈', label: 'Line' }
                ].map((chart) => (
                  <button
                    key={chart.type}
                    onClick={() => setChartType(chart.type)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded border ${
                      chartType === chart.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-base mb-0.5">{chart.icon}</span>
                    <span className="text-xs">{chart.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[
                  { type: 'pie' as ChartType, icon: '◓', label: 'Pie' },
                  { type: 'funnel' as ChartType, icon: '▼', label: 'Funnel' },
                  { type: 'scatter' as ChartType, icon: ':::', label: 'Scatter' },
                  { type: 'gauge' as ChartType, icon: '◐', label: 'Gauge' },
                  { type: 'metric' as ChartType, icon: '123', label: 'Metric' }
                ].map((chart) => (
                  <button
                    key={chart.type}
                    onClick={() => setChartType(chart.type)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded border ${
                      chartType === chart.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-base mb-0.5">{chart.icon}</span>
                    <span className="text-xs">{chart.label}</span>
                  </button>
                ))}
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 mb-3">Y-Axis</h3>
              <div className="space-y-2 mb-6">
                {yAxisFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between p-2 border rounded"
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
              
              <h3 className="text-sm font-medium text-gray-500 mb-3">X-Axis</h3>
              <div className="mb-6">
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
              
              <h3 className="text-sm font-medium text-gray-500 mb-3">Display Units</h3>
              <div>
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
            
            <div className="p-6 border-t flex justify-end gap-2">
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