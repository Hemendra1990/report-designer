import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { 
  ReportTypesService, 
  ReportTypesResponse, 
  ReportCategoriesResponse, 
  RecentReportsResponse,
  ReportFieldsResponse,
  ApiError,
  Field as ApiField
} from '@/services/reportTypes.service';
import { ReportTypeTemplate } from '@/app/report-builder/model/ReportType';
import { useMemo } from 'react';

// Extended Field interface to include additional properties for report builder
interface Field extends ApiField {
  columnName?: string;
  columnDisplayName?: string;
  columnType?: string;
  tableName?: string;
  tableId?: string;
  active?: boolean;
  isFormula?: boolean;
  isSummaryFormula?: boolean;
}

// Query keys for React Query
export const reportQueryKeys = {
  all: ['reports'] as const,
  types: () => [...reportQueryKeys.all, 'types'] as const,
  typesList: (filters: any) => [...reportQueryKeys.types(), { filters }] as const,
  categories: () => [...reportQueryKeys.all, 'categories'] as const,
  recent: () => [...reportQueryKeys.all, 'recent'] as const,
  recentList: (filters: any) => [...reportQueryKeys.recent(), { filters }] as const,
  fields: () => [...reportQueryKeys.all, 'fields'] as const,
  reportFields: (reportTypeId: string) => [...reportQueryKeys.fields(), reportTypeId] as const,
  reportFieldsList: (reportTypeId: string, filters: any) => 
    [...reportQueryKeys.reportFields(reportTypeId), { filters }] as const,
};

// Hook for fetching report types with filtering & pagination
export function useReportTypes(
  params: { search?: string; category?: string; page?: number; limit?: number } = {},
  options?: Omit<UseQueryOptions<ReportTypesResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = useMemo(() => reportQueryKeys.typesList(params), [params]);

  return useQuery<ReportTypesResponse, ApiError>({
    queryKey,
    queryFn: () => ReportTypesService.getReportTypes(params),
    ...options
  });
}

// Hook for fetching report categories
export function useReportCategories(
  options?: Omit<UseQueryOptions<ReportCategoriesResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = useMemo(() => reportQueryKeys.categories(), []);

  return useQuery<ReportCategoriesResponse, ApiError>({
    queryKey,
    queryFn: () => ReportTypesService.getReportCategories(),
    ...options
  });
}

// Hook for fetching recent reports with optional filtering
export function useRecentReports(
  params: { search?: string; category?: string; limit?: number } = {},
  options?: Omit<UseQueryOptions<RecentReportsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = useMemo(() => reportQueryKeys.recentList(params), [params]);

  return useQuery<RecentReportsResponse, ApiError>({
    queryKey,
    queryFn: () => ReportTypesService.getRecentReports(params),
    ...options
  });
}

// Hook for fetching fields for a specific report type
export function useReportTypeFields(
  reportTypeId: string,
  params: { search?: string; category?: string } = {},
  options?: Omit<UseQueryOptions<ReportFieldsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = useMemo(
    () => reportQueryKeys.reportFieldsList(reportTypeId, params), 
    [reportTypeId, params]
  );

  return useQuery<ReportFieldsResponse, ApiError>({
    queryKey,
    queryFn: () => ReportTypesService.getReportTypeFields(reportTypeId, params),
    // Don't fetch if no reportTypeId is provided
    enabled: !!reportTypeId && (options?.enabled !== false),
    ...options
  });
}

// Hook for creating a custom report type
export function useCreateCustomReportType(
  options?: Omit<
    UseMutationOptions<ReportTypeTemplate, ApiError, Partial<ReportTypeTemplate>>, 
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  
  return useMutation<ReportTypeTemplate, ApiError, Partial<ReportTypeTemplate>>({
    mutationFn: (data) => ReportTypesService.createCustomReportType(data),
    onSuccess: () => {
      // Invalidate report types list to reflect the new report type
      queryClient.invalidateQueries({ queryKey: reportQueryKeys.types() });
    },
    ...options
  });
}

// Helper hook for client-side filtering of fields
export function useFilteredFields(
  fields: Field[],
  searchTerm: string = ''
): Record<string, Field[]> {
  if (!fields || !fields.length) return {};
  
  const filtered = searchTerm 
    ? fields.filter(field => {
        const label = field.label || field.columnDisplayName || '';
        const name = field.name || field.columnName || '';
        const searchLower = searchTerm.toLowerCase();
        return label.toLowerCase().includes(searchLower) || 
               name.toLowerCase().includes(searchLower);
      })
    : fields;
    
  // Group by tableName, falling back to category if tableName is not present
  return filtered.reduce((acc, field) => {
    // Determine the grouping key - prefer tableName, fall back to category, then "Other"
    const groupKey = field.tableName || field.category || 'Other Fields';
    
    // Initialize the array for this group if it doesn't exist
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    
    // Handle special case for formula fields
    if (field.isFormula) {
      const formulaKey = 'Formula Fields';
      if (!acc[formulaKey]) {
        acc[formulaKey] = [];
      }
      acc[formulaKey].push(field);
    } else {
      // Add the field to its group
      acc[groupKey].push(field);
    }
    
    return acc;
  }, {} as Record<string, Field[]>);
} 