import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Field } from '../model/Field';
import { Filter } from '../model/Filter';
import { buildSqlQuery } from '../util/SqlQueryBuilder';

interface SqlGeneratorProps {
  reportType: string;
  reportName: string;
  onSqlGenerated?: (sql: string, reportName: string) => void;
}

export interface SqlGeneratorHandle {
  generateSql: () => string;
  setReportConfiguration: (config: {
    columns: Field[],
    groupBy: string[],
    filters: Filter[],
    filterLogic: 'and' | 'or' | 'custom',
    customFormula: string
  }) => void;
}

/**
 * Component that generates SQL query from report configuration.
 * This is a simplified version that works independently of the main report builder.
 */
const SqlGenerator = forwardRef<SqlGeneratorHandle, SqlGeneratorProps>(({
  reportType,
  reportName,
  onSqlGenerated
}, ref) => {
  const [selectedColumns, setSelectedColumns] = useState<Field[]>([]);
  const [groupByFields, setGroupByFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterLogic, setFilterLogic] = useState<'and' | 'or' | 'custom'>('and');
  const [customFilterFormula, setCustomFilterFormula] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [showSql, setShowSql] = useState(false);

  // Function to generate the SQL query
  const generateSql = () => {
    try {
      // Generate SQL query
      const sql = buildSqlQuery({
        reportType: reportType.toLowerCase().replace(/\s+/g, '_'),
        selectedColumns,
        groupByFields,
        filters,
        filterLogic,
        customFilterFormula
      });
      
      setGeneratedSql(sql);
      setShowSql(true);
      
      // Call the callback if provided
      if (onSqlGenerated) {
        onSqlGenerated(sql, reportName);
      }
      
      return sql;
    } catch (error) {
      console.error('Error generating SQL query:', error);
      return '';
    }
  };

  // This method can be called from a parent component
  useImperativeHandle(ref, () => ({
    generateSql,
    setReportConfiguration: (config: {
      columns: Field[],
      groupBy: string[],
      filters: Filter[],
      filterLogic: 'and' | 'or' | 'custom',
      customFormula: string
    }) => {
      setSelectedColumns(config.columns);
      setGroupByFields(config.groupBy);
      setFilters(config.filters);
      setFilterLogic(config.filterLogic);
      setCustomFilterFormula(config.customFormula);
    }
  }));

  return (
    <div>
      {showSql && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Generated SQL Query</h3>
            <button 
              onClick={() => setShowSql(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <pre className="text-sm overflow-auto p-2 bg-white border border-gray-300 rounded">{generatedSql}</pre>
        </div>
      )}
    </div>
  );
});

// Display name for debugging
SqlGenerator.displayName = 'SqlGenerator';

export default SqlGenerator; 