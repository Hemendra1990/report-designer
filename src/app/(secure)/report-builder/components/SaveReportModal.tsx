import React, { useEffect, useState } from 'react';

interface SaveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reportName: string) => void;
  reportName: string;
  generatedSql: string;
}

export default function SaveReportModal({
  isOpen,
  onClose,
  onSave,
  reportName: initialReportName,
  generatedSql
}: SaveReportModalProps) {
  const [reportName, setReportName] = useState(initialReportName);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (initialReportName) {
      setReportName(initialReportName);
    }
  }, [initialReportName])

  if (!isOpen) return null;

  const handleSave = () => {
    if (reportName.trim()) {
      onSave(reportName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Save Report</h2>
        
        <div className="mb-4">
          <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
            Report Name
          </label>
          <input
            type="text"
            id="reportName"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter report name"
          />
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showSql ? 'Hide' : 'Show'} Generated SQL
            <svg 
              className={`ml-1 h-4 w-4 transform ${showSql ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSql && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md overflow-auto max-h-[300px]">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{generatedSql}</pre>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!reportName.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
} 