'use client';

import { useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { reports } from '@/services/chartService';
import { Report } from '@/types/report';

export const ReportSelector = () => {
  const {
    showReportSelector,
    toggleReportSelector,
    searchTerm,
    setSearchTerm,
    handleSelectReport
  } = useDashboard();
  const reportSelectorRef = useRef<HTMLDivElement>(null);

  // Filter reports based on search term
  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!showReportSelector) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/30" onClick={() => toggleReportSelector(false)} />
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl relative" ref={reportSelectorRef}>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Select Report</h2>
            <button
              onClick={() => toggleReportSelector(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Private Reports</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredReports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleSelectReport(report)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="font-medium text-gray-900">{report.name}</div>
                <div className="text-sm text-gray-500">Created by {report.createdBy}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 