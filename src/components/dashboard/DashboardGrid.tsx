'use client';

import React from 'react';
import RGL, { WidthProvider, Layout as RGLLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DashboardWidget as WidgetType, Layout } from '@/types/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

const WrappedGridLayout = WidthProvider(RGL);

interface DashboardGridProps {
  widgets: WidgetType[];
  layouts: { [key: string]: Layout[] };
  isPreviewMode: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  onRemoveWidget: (id: string) => void;
  onWidgetContentChange?: (widgetId: string, content: string) => void;
}

export const DashboardGrid = ({
  widgets,
  layouts,
  isPreviewMode,
  onLayoutChange,
  onRemoveWidget,
  onWidgetContentChange
}: DashboardGridProps) => {
  const currentLayout = layouts.sm || [];

  const handleLayoutChange = (newLayout: Layout[]) => {
    onLayoutChange(newLayout);
  };

  const gridProps = {
    className: "layout",
    layout: currentLayout,
    cols: 24,
    rowHeight: 30,
    margin: [10, 10] as [number, number],
    containerPadding: [0, 0] as [number, number],
    onLayoutChange: handleLayoutChange,
    isDraggable: !isPreviewMode,
    isResizable: !isPreviewMode,
    useCSSTransforms: false,
    compactType: null as 'vertical' | 'horizontal' | null,
    preventCollision: true,
    resizeHandles: ['se'] as Array<'se'>,
    draggableHandle: ".widget-drag-handle",
    isBounded: false,
    maxRows: 1000,
    autoSize: true,
    verticalCompact: false,
    isDroppable: true,
    transformScale: 1,
    measureBeforeMount: false,
  };

  return (
    <>
      <style jsx global>{`
        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
          min-height: 100vh;
          /* Precisely match the grid background to React Grid Layout's actual grid */
          background-color: white;
          background-image: 
            /* Grid cell lines */
            linear-gradient(
              to right,
              rgba(210, 220, 240, 0.5) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(210, 220, 240, 0.5) 1px,
              transparent 1px
            );
          /* Exact size calculations based on React Grid Layout's positioning system */
          background-size: 
            /* Width of cell (100%/cols) + horizontal margin */
            calc(${100 / gridProps.cols}%),
            /* Height of cell (rowHeight) + vertical margin */
            calc(${gridProps.rowHeight}px + ${gridProps.margin[1]}px);
          /* Position the grid lines precisely */
          background-position: 0px 0px;
        }
        
        /* Add a subtle fill to grid cells with repeating pattern */
        .react-grid-layout::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            /* Cell fill pattern */
            linear-gradient(
              45deg,
              rgba(240, 245, 250, 0.5) 25%,
              transparent 25%,
              transparent 75%,
              rgba(240, 245, 250, 0.5) 75%
            );
          background-size: 
            calc(${100 / gridProps.cols}% - ${gridProps.margin[0]}px)
            calc(${gridProps.rowHeight}px);
          background-position: ${gridProps.margin[0] / 2}px ${gridProps.margin[1] / 2}px;
          pointer-events: none; /* Ensure clicks pass through to actual grid */
          z-index: 0;
        }
        
        .react-grid-item {
          transition: none;
          cursor: ${isPreviewMode ? 'default' : 'move'};
          box-shadow: ${isPreviewMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'};
          border-radius: 4px;
          background-color: white;
        }
        .react-grid-item.cssTransforms {
          transition: none;
        }
        .react-grid-item.resizing {
          z-index: 1;
          will-change: width, height;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
          will-change: transform;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
          padding: 0 3px 3px 0;
          display: ${isPreviewMode ? 'none' : 'block'};
        }
        .react-grid-item > .react-resizable-handle::after {
          content: "";
          position: absolute;
          right: 3px;
          bottom: 3px;
          width: 5px;
          height: 5px;
          border-right: 2px solid rgba(0, 0, 0, 0.4);
          border-bottom: 2px solid rgba(0, 0, 0, 0.4);
        }
        .react-resizable {
          position: relative;
        }
        .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          display: ${isPreviewMode ? 'none' : 'block'};
        }
        .react-resizable-handle-se {
          bottom: 0;
          right: 0;
          cursor: se-resize;
        }
        .react-grid-placeholder {
          background: #f0f0f0;
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 4px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
        }
      `}</style>
      <div className="min-h-screen w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[1280px]">
          <WrappedGridLayout {...gridProps}>
            {widgets.map((widget) => (
              <div key={widget.id} data-grid={widget.layout} className="group">
                <DashboardWidget 
                  widget={widget} 
                  onRemove={onRemoveWidget}
                  isPreview={isPreviewMode}
                  onContentChange={onWidgetContentChange}
                />
              </div>
            ))}
          </WrappedGridLayout>
        </div>
      </div>
    </>
  );
};