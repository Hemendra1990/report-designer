import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

// Fallback for the Skeleton component in case the UI library doesn't have it
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

interface GroupDetailViewProps {
  groupValue: string;
  groupField: string;
  groupLabel: string;
  fetchDetailData: (groupField: string, groupValue: string, page: number, pageSize: number) => Promise<{
    data: any[];
    totalCount: number;
  }>;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  groupValue,
  groupField,
  groupLabel,
  fetchDetailData
}) => {
  // State for the detailed records
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Load data when component mounts or pagination changes
  useEffect(() => {
    loadDetailData();
  }, [groupValue, groupField, page, pageSize]);
  
  const loadDetailData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchDetailData(groupField, groupValue, page, pageSize);
      
      setRecords(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / pageSize));
      
    } catch (err) {
      setError('Failed to load detail data');
      console.error('Error loading group details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate columns from the first record, if available
  const getColumnsFromData = () => {
    if (records.length === 0) return [];
    return Object.keys(records[0]).map(key => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }));
  };
  
  const columns = getColumnsFromData();
  
  // Handle pagination
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Loading state
  if (loading && records.length === 0) {
    return (
      <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">
            {groupLabel}: {groupValue}
          </h3>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="px-4 py-2 bg-white border border-red-200 rounded-md">
        <div className="text-red-500">{error}</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadDetailData}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">
          {groupLabel}: {groupValue}
        </h3>
        <span className="text-xs text-slate-500">
          {totalCount} records
        </span>
      </div>
      
      {/* Detail records table */}
      <div className="overflow-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-200">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
            <tr>
              {columns.map(column => (
                <th 
                  key={column.id}
                  className="px-4 py-2 text-left text-xs font-medium tracking-wide whitespace-nowrap border-b border-slate-200"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-4 text-center text-slate-500"
                >
                  No records found
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr 
                  key={index}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40 transition-colors duration-150`}
                >
                  {columns.map(column => (
                    <td 
                      key={`${index}-${column.id}`}
                      className="px-4 py-2 text-sm"
                    >
                      {formatCellValue(record[column.id])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1); // Reset to first page when changing page size
              }}
            >
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="5 per page" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">First page</span>
                <ChevronLeftIcon className="h-3 w-3 mr-1" />
                <ChevronLeftIcon className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Previous page</span>
                <ChevronLeftIcon className="h-3 w-3" />
              </Button>
              <span className="flex items-center text-xs px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Next page</span>
                <ChevronRightIcon className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={page === totalPages}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Last page</span>
                <ChevronRightIcon className="h-3 w-3 mr-1" />
                <ChevronRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format cell values
const formatCellValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">(Empty)</span>;
  }
  
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
}; 