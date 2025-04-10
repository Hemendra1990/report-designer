import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RecentReportType } from '../model/ReportType';
import { ApiReportField, getReportTypes, getReportTypeFields } from '../services/reportTypeService';

interface ReportTypesContextType {
  reportTypes: RecentReportType[];
  isLoading: boolean;
  error: Error | null;
  selectedReportTypeId: string | null;
  setSelectedReportTypeId: (id: string | null) => void;
  reportFields: ApiReportField[];
  isFieldsLoading: boolean;
  fieldsError: Error | null;
  categories: string[];
}

const ReportTypesContext = createContext<ReportTypesContextType | undefined>(undefined);

export const ReportTypesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedReportTypeId, setSelectedReportTypeId] = React.useState<string | null>(null);

  // Fetch report types
  const { 
    data: reportTypes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: getReportTypes,
  });

  // Fetch fields for the selected report type
  const {
    data: reportFields = [],
    isLoading: isFieldsLoading,
    error: fieldsError,
  } = useQuery({
    queryKey: ['reportFields', selectedReportTypeId],
    queryFn: () => selectedReportTypeId ? getReportTypeFields(selectedReportTypeId) : Promise.resolve([]),
    enabled: !!selectedReportTypeId, // Only run when a report type is selected
  });

  // Extract unique categories from report types
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(reportTypes.map(report => report.category)));
    return uniqueCategories;
  }, [reportTypes]);

  const value = {
    reportTypes,
    isLoading,
    error,
    selectedReportTypeId,
    setSelectedReportTypeId,
    reportFields,
    isFieldsLoading,
    fieldsError,
    categories,
  };

  return <ReportTypesContext.Provider value={value}>{children}</ReportTypesContext.Provider>;
};

export const useReportTypes = (): ReportTypesContextType => {
  const context = useContext(ReportTypesContext);
  if (context === undefined) {
    throw new Error('useReportTypes must be used within a ReportTypesProvider');
  }
  return context;
}; 