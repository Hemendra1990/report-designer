'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, FileDown } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface DataTableProps {
  data: ChartData;
}

export function DataTable({ data }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Transform chart data into table data
  const transformData = () => {
    const headers = ['Item', ...data.datasets.map(ds => ds.label)];
    
    const rows = data.labels.map((label, idx) => {
      const row: Record<string, string | number> = { Item: label };
      
      data.datasets.forEach((dataset, datasetIdx) => {
        row[dataset.label] = dataset.data[idx] || 0;
      });
      
      return row;
    });
    
    return { headers, rows };
  };
  
  const { headers, rows } = transformData();
  
  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Get sorted and filtered rows
  const getSortedAndFilteredRows = () => {
    // Filter rows by search term
    let filteredRows = rows;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filteredRows = rows.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(term)
        );
      });
    }
    
    // Sort rows if sort config exists
    if (sortConfig) {
      return [...filteredRows].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }
    
    return filteredRows;
  };
  
  const sortedAndFilteredRows = getSortedAndFilteredRows();
  
  // Format cell value
  const formatCellValue = (value: string | number) => {
    if (typeof value === 'number') {
      // Format number with commas and 2 decimal places if needed
      return Number(value.toFixed(2)).toLocaleString();
    }
    return value;
  };
  
  return (
    <div className="w-full h-full overflow-auto bg-white rounded-md">
      {/* Table controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-1.5 pr-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
        </div>
        <button 
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 text-gray-700">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  onClick={() => handleSort(header)}
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortConfig?.key === header && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredRows.length > 0 ? (
              sortedAndFilteredRows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`border-t border-gray-200 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                >
                  {headers.map((header, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-2.5 ${
                        colIndex === 0 ? 'font-medium text-gray-900' : 'text-gray-700'
                      } ${
                        typeof row[header] === 'number' ? 'text-right' : ''
                      }`}
                    >
                      {formatCellValue(row[header])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={headers.length} 
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer with pagination if needed */}
      {sortedAndFilteredRows.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {sortedAndFilteredRows.length} of {rows.length} entries
          </div>
        </div>
      )}
    </div>
  );
} 