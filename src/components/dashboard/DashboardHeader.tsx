'use client';

import { 
  Plus, 
  Filter, 
  Save, 
  Undo, 
  Redo, 
  Settings, 
  Eye, 
  Check,
  ChevronDown
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { WidgetMenu } from '@/components/dashboard/WidgetMenu';
import { useState, useRef, useEffect } from 'react';

export const DashboardHeader = () => {
  const { 
    dashboardData, 
    setDashboardData, 
    isPreviewMode, 
    togglePreviewMode, 
    showWidgetMenu, 
    toggleWidgetMenu,
    handleAddWidget
  } = useDashboard();
  
  const [showMore, setShowMore] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="border-b border-gray-200 shadow-sm sticky top-0 z-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Dashboard Title */}
          <div className="flex items-center">
            <input
              type="text"
              value={dashboardData.name}
              onChange={(e) => setDashboardData({...dashboardData, name: e.target.value})}
              className="text-gray-900 font-semibold px-1 py-1 focus:outline-none focus:border-b-2 focus:border-blue-600 w-64 bg-transparent"
              readOnly={isPreviewMode}
              placeholder="Dashboard Name"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isPreviewMode && (
              <>
                {/* Widget Dropdown Button */}
                <div className="relative mr-1">
                  <button
                    onClick={toggleWidgetMenu}
                    className="flex items-center h-9 px-4 bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" />
                    <span className="font-medium">Widget</span>
                  </button>
                  {showWidgetMenu && <WidgetMenu onAddWidget={handleAddWidget} />}
                </div>

                {/* Filter Button */}
                <button className="h-9 px-4 border border-gray-300 text-gray-700 rounded-md transition-colors flex items-center hover:bg-gray-50">
                  <Filter size={16} className="mr-2" />
                  <span className="font-medium">Filter</span>
                </button>

                {/* Action Buttons Group */}
                <div className="hidden md:flex items-center ml-3 border-l border-gray-200 pl-3 space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                    <Save size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                    <Undo size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                    <Redo size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                    <Settings size={18} />
                  </button>
                </div>
                
                {/* More Menu (Mobile) */}
                <div className="relative md:hidden">
                  <button 
                    onClick={() => setShowMore(!showMore)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                  
                  {showMore && (
                    <div 
                      ref={moreMenuRef}
                      className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 w-32 overflow-hidden z-50"
                    >
                      <button 
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Save size={14} className="mr-2 text-gray-500" />
                        Save
                      </button>
                      <button 
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Undo size={14} className="mr-2 text-gray-500" />
                        Undo
                      </button>
                      <button 
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Redo size={14} className="mr-2 text-gray-500" />
                        Redo
                      </button>
                      <button 
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings size={14} className="mr-2 text-gray-500" />
                        Settings
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Preview & Done Buttons */}
            <div className="flex items-center ml-3 space-x-2">
              <button
                onClick={togglePreviewMode}
                className="flex items-center h-9 px-4 border border-gray-300 text-gray-700 rounded-md transition-colors hover:bg-gray-50"
              >
                <Eye size={16} className="mr-2" />
                <span className="font-medium">{isPreviewMode ? 'Edit' : 'Preview'}</span>
              </button>

              {!isPreviewMode && (
                <button className="flex items-center h-9 px-4 bg-green-600 text-white rounded-md transition-colors hover:bg-green-700">
                  <Check size={16} className="mr-2" />
                  <span className="font-medium">Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 