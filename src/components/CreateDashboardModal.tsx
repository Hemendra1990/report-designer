'use client';

import { useState } from 'react';
import { BarChart3, LineChart, PieChart, BarChart2, BarChart4, TrendingUp, ScatterChart, Gauge, Table2 } from 'lucide-react';
import { ChartPreview } from './ChartPreview';
import { ModalHeader, Button, SelectField } from './ui/common';

interface CreateDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; folder: string }) => void;
}

type ChartType = 'bar' | 'line' | 'pie' | 'grouped-bar' | 'stacked-bar' | 'funnel' | 'scatter' | 'gauge' | 'metric' | 'table';

const chartTypes = [
  { type: 'bar', icon: BarChart3, label: 'Bar' },
  { type: 'line', icon: LineChart, label: 'Line' },
  { type: 'pie', icon: PieChart, label: 'Pie' },
  { type: 'grouped-bar', icon: BarChart2, label: 'Grouped Bar' },
  { type: 'stacked-bar', icon: BarChart4, label: 'Stacked Bar' },
  { type: 'funnel', icon: TrendingUp, label: 'Funnel' },
  { type: 'scatter', icon: ScatterChart, label: 'Scatter' },
  { type: 'gauge', icon: Gauge, label: 'Gauge' },
  { type: 'table', icon: Table2, label: 'Table' },
] as const;

export default function CreateDashboardModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateDashboardModalProps) {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: '', description: '', folder: '' }); // Update with actual form data
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[1100px] h-[80vh] flex">
        {/* Left Panel - Configuration */}
        <div className="w-[400px] border-r">
          <ModalHeader title="Add Widget" onClose={onClose} />

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <h3 className="font-medium mb-2">Display As</h3>
              <div className="grid grid-cols-3 gap-2">
                {chartTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedChartType(type)}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      selectedChartType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className={selectedChartType === type ? 'text-blue-500' : 'text-gray-600'} />
                    <span className="text-sm mt-1">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <SelectField
              label="Y-Axis Field"
              required
            >
              <option>Select field</option>
            </SelectField>

            <SelectField
              label="X-Axis Field"
            >
              <option>Select field</option>
            </SelectField>

            <SelectField
              label="Display Units"
            >
              <option>Auto</option>
              <option>Thousands</option>
              <option>Millions</option>
              <option>Billions</option>
            </SelectField>

            <div className="mb-4">
              <label className="block mb-1">
                Y-Axis Field <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select field</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1">X-Axis Field</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select field</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block mb-1">Display Units</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Auto</option>
                <option>Thousands</option>
                <option>Millions</option>
                <option>Billions</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 p-6 bg-gray-50">
          <ChartPreview type={selectedChartType} />
        </div>
      </div>
    </div>
  );
} 