"use client";

import { useState, useEffect } from 'react';
import { useReportType } from '@/contexts/ReportTypeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ReportTypeDetails() {
  const { state, dispatch } = useReportType();
  const [name, setName] = useState(state.reportType.name);
  const [description, setDescription] = useState(state.reportType.description);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: 'SET_REPORT_DETAILS',
        payload: { name, description },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [name, description, dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Report Type Details</h2>
        <p className="text-muted-foreground mb-4">
          Provide a name and description for your report type.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter report type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter report type description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-medium mb-2">Selected Template</h3>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">{state.reportType.templateType}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getTemplateDescription(state.reportType.templateType)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTemplateDescription(templateType: string): string {
  switch (templateType) {
    case 'tabular':
      return 'Simple list of records with optional grouping. Best for creating a straightforward list of records.';
    case 'summary':
      return 'Grouped report records with subtotals and grand totals. Perfect for analyzing data across different categories.';
    case 'matrix':
      return 'Show data in rows and columns with grand summaries. Ideal for comparing related data points in a grid layout.';
    case 'joined':
      return 'Combine data from multiple related objects. Great for creating reports that span across different data entities.';
    default:
      return '';
  }
} 