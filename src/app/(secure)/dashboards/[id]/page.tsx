'use client';

import { use, useState } from 'react';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { ReportSelector } from '@/components/dashboard/ReportSelector';
import WidgetConfigModal from '@/components/dashboard/WidgetConfigModal';
import { useDashboard } from '@/contexts/DashboardContext';
import Todo from '@/components/Todo';

// Main content component of the dashboard
function DashboardContent() {
  const { 
    dashboardData, 
    handleLayoutChange, 
    handleRemoveWidget, 
    isPreviewMode, 
    setCurrentBreakpoint,
    handleWidgetContentChange
  } = useDashboard();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'todo'>('dashboard');

  return (
    <>
      <DashboardHeader />

      {/* Content Container */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {activeTab === 'dashboard' ? (
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
        ) : (
          <div className="min-h-[600px]">
            <Todo dashboardId={dashboardData.id} />
          </div>
        )}
      </div>

      {/* Dashboard Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={activeTab === 'dashboard'}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'todo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={activeTab === 'todo'}
          >
            To Do List
          </button>
        </div>
      </div>

      {/* Modals */}
      <ReportSelector />
      <WidgetConfigModal />
    </>
  );
}

// Page component that wraps the dashboard content with the provider
export default function DashboardDesigner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dashboardId = resolvedParams.id;

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardProvider initialDashboardId={dashboardId}>
        <DashboardContent />
      </DashboardProvider>
    </main>
  );
} 