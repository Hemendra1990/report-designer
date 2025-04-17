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
          /* More refined, professional grid background */
          background-color: #f9fafc; /* Very light blue-gray background */
          background-image: 
            linear-gradient(to right, rgba(210, 220, 240, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(210, 220, 240, 0.4) 1px, transparent 1px);
          background-size: 50px 50px;
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