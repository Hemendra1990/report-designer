// API types for the backend service

/**
 * Report type as returned from the API
 */
export interface ApiReportType {
  id: string;
  label: string;
  name: string;
  description: string;
  usedTables: string[];
  fieldCount: number;
}

/**
 * Field as returned from the API
 */
export interface ApiReportField {
  id: string;
  columnName: string;
  columnDisplayName: string;
  columnType: string;
  tableName: string;
  tableId: string;
  active: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Pagination metadata for list responses
 */
export interface ApiPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Response wrapper for paginated data
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: ApiPagination;
}

/**
 * Response wrapper for single item data
 */
export interface ApiResponse<T> {
  data: T;
} 