import React, { useState } from 'react';
import { Field } from '../model/Field';
import { Filter } from '../model/Filter';
import { buildSqlQuery } from '../util/SqlQueryBuilder';

interface SaveReportButtonProps {
  reportType: string;
  reportName: string;
  selectedColumns: Field[];
  groupByFields: string[];
  filters: Filter[];
  filterLogic: 'and' | 'or' | 'custom';
  customFilterFormula: string;
  onSave?: (sql: string, reportName: string) => void;
}

export default function SaveReportButton({
  reportType,
  reportName,
  selectedColumns,
  groupByFields,
  filters,
  filterLogic,
  customFilterFormula,
  onSave
}: SaveReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveClick = () => {
    setIsGenerating(true);
    
    try {
      // Generate SQL query using the utilities
      const generatedSql = buildSqlQuery({
          reportType,
          selectedColumns,
          groupByFields,
          filters,
          filterLogic,
          customFilterFormula
      });
      
      // Call the onSave callback with the generated SQL
      if (onSave) {
        onSave(generatedSql, reportName);
      }
      
      console.log('Generated SQL:', generatedSql);
    } catch (error) {
      console.error('Error generating SQL query:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      onClick={handleSaveClick}
      disabled={isGenerating || selectedColumns.length === 0}
    >
      {isGenerating ? 'Saving...' : 'Save Report'}
    </button>
  );
} 