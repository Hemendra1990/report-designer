import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ChartPreview } from '@/components/ChartPreview';
import { DashboardWidget, ChartData } from '@/types/dashboard';

interface WidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  isPreview?: boolean;
}

export function Widget({ widget, onRemove, isPreview = false }: WidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Mock data loading for charts
  useEffect(() => {
    if (widget.type === 'chart' && widget.reportId) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        // Mock data
        const mockData: ChartData = {
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
        setChartData(mockData);
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [widget.reportId, widget.type]);

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 32, height: height - 32 }); // Account for padding
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full widget-drag-handle">
      <div className="bg-white rounded-lg shadow-sm border h-full w-full overflow-hidden relative">
        {!isPreview && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widget.id);
              }}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className="h-full w-full p-4"
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