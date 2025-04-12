import React from 'react';
import { Label } from "@/components/ui/label";

interface SqlPreviewProps {
  sqlPreview: string;
}

const SqlPreview: React.FC<SqlPreviewProps> = ({ sqlPreview }) => {
  return (
    <div className="mt-3">
      <Label className="text-xs font-medium">SQL Translation (DuckDB)</Label>
      <div className="p-2 bg-gray-50 rounded-md border border-gray-200 text-xs font-mono overflow-x-auto text-gray-700 mt-1 h-20 overflow-y-auto">
        {sqlPreview || "No SQL preview available"}
      </div>
    </div>
  );
};

export default SqlPreview; 