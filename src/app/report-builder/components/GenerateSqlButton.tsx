import React, { useState } from 'react';
import { Field } from '../model/Field';
import { Filter } from '../model/Filter';
import SaveReportModal from './SaveReportModal';
import { buildSqlQuery } from '../util/SqlQueryBuilder';

interface GenerateSqlButtonProps {
  reportType: string;
  reportName: string;
  selectedColumns: Field[];
  groupByFields: string[];
  filters: Filter[];
  filterLogic: 'and' | 'or' | 'custom';
  customFilterFormula: string;
  onSave?: (sql: string, reportName: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * A button that generates a SQL query based on the current report configuration
 * when clicked, and opens a modal to show the SQL and save the report.
 */
export default function GenerateSqlButton({
  reportType,
  reportName,
  selectedColumns,
  groupByFields,
  filters,
  filterLogic,
  customFilterFormula,
  onSave,
  className = '',
  variant = 'primary'
}: GenerateSqlButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedSql, setGeneratedSql] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Determine button style based on variant
  const getButtonClassName = () => {
    const baseClasses = 'px-4 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ';
    
    switch (variant) {
      case 'primary':
        return baseClasses + 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 ' + className;
      case 'secondary':
        return baseClasses + 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 ' + className;
      case 'outline':
        return baseClasses + 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 ' + className;
      default:
        return baseClasses + className;
    }
  };

  const handleClick = () => {
    setIsGenerating(true);
    
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
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating SQL query:', error);
      alert('An error occurred while generating the SQL query.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = (finalReportName: string) => {
    if (onSave) {
      onSave(generatedSql, finalReportName);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={getButtonClassName()}
        onClick={handleClick}
        disabled={isGenerating || selectedColumns.length === 0}
      >
        {isGenerating ? 'Generating...' : 'Save Report'}
      </button>
      
      <SaveReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        reportName={reportName}
        generatedSql={generatedSql}
      />
    </>
  );
} 