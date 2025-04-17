'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ChartPreview } from '@/components/ChartPreview';
import { DashboardWidget as WidgetType, ChartData, ChartType } from '@/types/dashboard';
import { fetchChartData } from '@/services/chartService';

interface WidgetProps {
  widget: WidgetType;
  onRemove: (id: string) => void;
  isPreview?: boolean;
  onContentChange?: (widgetId: string, content: string) => void;
}

export const DashboardWidget = ({ widget, onRemove, isPreview = false, onContentChange }: WidgetProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState(widget.content || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load chart data
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

  // Initialize text content from widget
  useEffect(() => {
    setTextContent(widget.content || '');
  }, [widget.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPreview) {
      const newContent = e.target.value;
      setTextContent(newContent);
      onContentChange?.(widget.id, newContent);
    }
  };

  return (
    <div className="h-full w-full widget-drag-handle">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full w-full overflow-hidden relative hover:shadow-md transition-shadow duration-200">
        {!isPreview && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widget.id);
              }}
              className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
              aria-label="Remove widget"
            >
              <X size={14} />
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
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading chart data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-red-50 text-red-500">
                    <X size={24} />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              ) : chartData ? (
                <div className="w-full h-full">
                  <ChartPreview 
                    type={widget.chartType || 'bar' as any} 
                    data={chartData}
                    width={dimensions.width}
                    height={dimensions.height}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-md">No data available</p>
                </div>
              )}
            </>
          )}
          
          {widget.type === 'text' && (
            <textarea
              value={textContent}
              onChange={handleTextChange}
              readOnly={isPreview}
              className="w-full h-full border-none focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none bg-transparent rounded-md p-2"
              placeholder="Enter your text here"
            />
          )}
          
          {widget.type === 'image' && (
            <div className="flex flex-col items-center justify-center h-full w-full gap-2 bg-gray-50 rounded-md">
              <ImageIcon size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500">Image placeholder</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 