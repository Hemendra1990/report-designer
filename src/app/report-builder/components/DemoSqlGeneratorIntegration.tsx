import React, { useRef, useState } from 'react';
import { Field } from '../model/Field';
import { Filter } from '../model/Filter';
import GenerateSqlButton from './GenerateSqlButton';
import SqlGenerator, { SqlGeneratorHandle } from './SqlGenerator';

/**
 * Demonstration component showing how to integrate SQL generation
 * into the existing report builder.
 */
export default function DemoSqlGeneratorIntegration() {
  // Example data from the report builder
  const [reportData, setReportData] = useState({
    reportType: 'accounts',
    reportName: 'Sample Accounts Report',
    selectedColumns: [
      { id: 'rating', name: 'Rating', type: 'picklist' as const },
      { id: 'account_owner', name: 'Account Owner', type: 'user' as const },
      { id: 'last_activity', name: 'Last Activity', type: 'datetime' as const }
    ] as Field[],
    groupByFields: ['rating'],
    filters: [
      {
        id: 'filter-1',
        field: { id: 'rating', name: 'Rating', type: 'picklist' as const },
        operator: 'is_not_empty',
        value: '',
        rangeStart: '',
        rangeEnd: '',
        selectedOptions: []
      }
    ] as Filter[],
    filterLogic: 'and' as const,
    customFilterFormula: ''
  });

  // Reference to the SQL generator component
  const sqlGeneratorRef = useRef<SqlGeneratorHandle>(null);

  // Handle saving the report
  const handleSaveReport = (sql: string, reportName: string) => {
    console.log(`Saving report '${reportName}' with SQL:`, sql);
    alert(`Report "${reportName}" saved with SQL query.`);
    
    // In a real application, this would make an API call to save the report
  };

  // Example of how to manually trigger SQL generation
  const handleGenerateSqlManually = () => {
    if (sqlGeneratorRef.current) {
      // Log the configuration being used for SQL generation
      console.log('Generating SQL with configuration:', {
        columns: reportData.selectedColumns,
        groupBy: reportData.groupByFields,
        filters: reportData.filters,
        filterLogic: reportData.filterLogic,
        customFormula: reportData.customFilterFormula
      });
      
      // Update configuration first
      sqlGeneratorRef.current.setReportConfiguration({
        columns: reportData.selectedColumns,
        groupBy: reportData.groupByFields,
        filters: reportData.filters,
        filterLogic: reportData.filterLogic,
        customFormula: reportData.customFilterFormula
      });
      
      // Generate SQL
      const sql = sqlGeneratorRef.current.generateSql();
      console.log('Generated SQL:', sql);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">SQL Generation Integration Demo</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Report Configuration</h3>
        <div className="bg-gray-50 p-4 rounded mb-4">
          <p><strong>Report Type:</strong> {reportData.reportType}</p>
          <p><strong>Report Name:</strong> {reportData.reportName}</p>
          <p><strong>Selected Columns:</strong> {reportData.selectedColumns.map(col => col.name).join(', ')}</p>
          <p><strong>Group By Fields:</strong> {reportData.groupByFields.join(', ') || 'None'}</p>
          <p><strong>Filters:</strong> {reportData.filters.length ? reportData.filters.map(f => `${f.field.name} ${f.operator}`).join(', ') : 'None'}</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Option 1: Using GenerateSqlButton</h3>
          <p className="mb-2">This button component handles everything from SQL generation to displaying the modal:</p>
          <GenerateSqlButton
            reportType={reportData.reportType}
            reportName={reportData.reportName}
            selectedColumns={reportData.selectedColumns}
            groupByFields={reportData.groupByFields}
            filters={reportData.filters}
            filterLogic={reportData.filterLogic}
            customFilterFormula={reportData.customFilterFormula}
            onSave={handleSaveReport}
            variant="primary"
          />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Option 2: Using SqlGenerator Component</h3>
          <p className="mb-2">This gives more control over when and how SQL is generated:</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleGenerateSqlManually}
          >
            Generate SQL Manually
          </button>
          
          {/* SQL Generator Component */}
          <SqlGenerator
            ref={sqlGeneratorRef}
            reportType={reportData.reportType}
            reportName={reportData.reportName}
            onSqlGenerated={(sql, name) => console.log(`SQL generated for ${name}:`, sql)}
          />
        </div>
      </div>
    </div>
  );
} 