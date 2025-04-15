'use client';

import { useRef } from 'react';
import { 
  X, 
  Plus, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table2, 
  BarChart2, 
  BarChart4, 
  TrendingUp, 
  ScatterChart, 
  Gauge, 
  Calculator 
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { ChartType } from '@/types/dashboard';
import { ChartPreview } from '@/components/ChartPreview';

interface ChartOption {
  type: ChartType;
  icon: React.ElementType;
  label: string;
}

// Chart type options for the configuration modal
const chartOptions: ChartOption[] = [
  { type: 'table', icon: Table2, label: 'Table' },
  { type: 'bar', icon: BarChart3, label: 'Bar' },
  { type: 'grouped-bar', icon: BarChart2, label: 'Grouped Bar' },
  { type: 'stacked-bar', icon: BarChart4, label: 'Stacked Bar' },
  { type: 'line', icon: LineChart, label: 'Line' },
  { type: 'pie', icon: PieChart, label: 'Pie' },
  { type: 'funnel', icon: TrendingUp, label: 'Funnel' },
  { type: 'scatter', icon: ScatterChart, label: 'Scatter' },
  { type: 'gauge', icon: Gauge, label: 'Gauge' },
  { type: 'metric', icon: Calculator, label: 'Metric' }
];

// Generate sample data for the chart preview
const generateSampleData = (type: ChartType) => {
  // Base sample data
  const sampleData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55]
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86, 27]
      }
    ]
  };

  // Customize data based on chart type
  switch (type) {
    case 'pie':
    case 'doughnut':
      return {
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
        datasets: [
          {
            label: 'Sales',
            data: [300, 250, 200, 150, 100]
          }
        ]
      };
    case 'funnel':
      return {
        labels: ['Visits', 'Cart', 'Checkout', 'Purchase', 'Repeat'],
        datasets: [
          {
            label: 'Conversion',
            data: [1000, 750, 500, 300, 150]
          }
        ]
      };
    case 'gauge':
    case 'metric':
      return {
        labels: ['Completion'],
        datasets: [
          {
            label: 'Task Completion',
            data: [75]
          }
        ]
      };
    case 'scatter':
      return {
        labels: ['Point A', 'Point B', 'Point C', 'Point D', 'Point E', 'Point F'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [12, 34, 56, 23, 45, 67, 34, 56, 78, 45, 67, 89]
          }
        ]
      };
    default:
      return sampleData;
  }
};

export const WidgetConfigModal = () => {
  const {
    showWidgetConfig,
    toggleWidgetConfig,
    selectedReport,
    chartType,
    setChartType,
    yAxisFields,
    toggleYAxisField,
    xAxisField,
    setXAxisField,
    displayUnits,
    setDisplayUnits,
    handleSaveWidget,
    toggleReportSelector,
    availableFields
  } = useDashboard();
  
  const widgetConfigRef = useRef<HTMLDivElement>(null);

  if (!showWidgetConfig || !selectedReport) return null;

  // Sample data for chart preview
  const previewData = generateSampleData(chartType);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/30" onClick={() => toggleWidgetConfig(false)} />
      <div className="bg-white rounded-lg w-full max-w-[1100px] shadow-xl relative" ref={widgetConfigRef}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Add Widget Config</h2>
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
                      toggleWidgetConfig(false);
                      toggleReportSelector(true);
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
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </label>
              </div>

              <div>
                <label className="block text-sm mb-2">Display As</label>
                <div className="grid grid-cols-5 gap-2">
                  {chartOptions.map((chart) => {
                    const Icon = chart.icon;
                    return (
                      <button
                        key={chart.type}
                        onClick={() => setChartType(chart.type)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded border ${
                          chartType === chart.type 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`mb-1 ${
                            chartType === chart.type 
                              ? 'text-blue-500' 
                              : 'text-gray-600'
                          }`}
                        />
                        <span className="text-xs">{chart.label}</span>
                      </button>
                    );
                  })}
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
                        onClick={() => toggleYAxisField(field)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const field = availableFields.find(f => !yAxisFields.includes(f));
                      if (field) toggleYAxisField(field);
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
              <h3 className="text-sm font-medium">Preview</h3>
            </div>
            <div className="bg-white rounded p-6 flex flex-col min-h-[400px] border shadow-sm">
              <h2 className="text-base font-medium mb-4 text-center text-gray-700">{selectedReport.name}</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-[300px]">
                  <ChartPreview type={chartType} data={previewData} />
                </div>
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  View Report ({selectedReport.name})
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={() => toggleWidgetConfig(false)}
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
  );
}; 