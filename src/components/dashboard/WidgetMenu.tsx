'use client';

import { BarChart3, Type, Image as ImageIcon } from 'lucide-react';

interface WidgetMenuProps {
  onAddWidget: (type: 'chart' | 'text' | 'image') => void;
}

export const WidgetMenu = ({ onAddWidget }: WidgetMenuProps) => {
  return (
    <div className="absolute left-0 mt-1 bg-white rounded-md shadow-md border border-gray-200 w-48 z-20">
      <div className="py-1">
        <button
          onClick={() => onAddWidget('chart')}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center mr-3 bg-blue-100 text-blue-600 rounded-md">
            <BarChart3 size={16} />
          </div>
          <span>Chart or Table</span>
        </button>
        <button
          onClick={() => onAddWidget('text')}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center mr-3 bg-green-100 text-green-600 rounded-md">
            <Type size={16} />
          </div>
          <span>Text</span>
        </button>
        <button
          onClick={() => onAddWidget('image')}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center mr-3 bg-purple-100 text-purple-600 rounded-md">
            <ImageIcon size={16} />
          </div>
          <span>Image</span>
        </button>
      </div>
    </div>
  );
}; 