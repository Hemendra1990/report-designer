'use client';

import React from 'react';
import { Responsive, WidthProvider, Layout as RGLLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DashboardWidget as WidgetType, Layout } from '@/types/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetType[];
  layouts: { [key: string]: Layout[] };
  isPreviewMode: boolean;
  onLayoutChange: (layout: Layout[], layouts: { [key: string]: Layout[] }) => void;
  onBreakpointChange: (breakpoint: string) => void;
  onRemoveWidget: (id: string) => void;
  onWidgetContentChange?: (widgetId: string, content: string) => void;
}

export const DashboardGrid = ({
  widgets,
  layouts,
  isPreviewMode,
  onLayoutChange,
  onBreakpointChange,
  onRemoveWidget,
  onWidgetContentChange
}: DashboardGridProps) => {
  // Grid layout configuration - same for both preview and edit modes
  const gridProps = {
    className: "layout",
    layouts,
    breakpoints: { lg: 2560, md: 1920, sm: 1280, xs: 768, xxs: 480 },
    cols: { lg: 48, md: 36, sm: 24, xs: 12, xxs: 6 },
    rowHeight: 30,
    margin: [10, 10] as [number, number],
    containerPadding: [0, 0] as [number, number],
    onLayoutChange,
    onBreakpointChange,
    isDraggable: !isPreviewMode,
    isResizable: !isPreviewMode,
    useCSSTransforms: false,
    compactType: null,
    preventCollision: false,
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
        }
        .react-grid-item {
          transition: none;
          cursor: ${isPreviewMode ? 'default' : 'move'};
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
          <ResponsiveGridLayout {...gridProps}>
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
          </ResponsiveGridLayout>
        </div>
      </div>
    </>
  );
};