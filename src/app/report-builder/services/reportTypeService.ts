import { ReportTypeTemplate, RecentReportType } from "../model/ReportType";
import { ApiReportField } from "./api-types";
import ApiClient from "./api-client";

/**
 * Get all report types
 * @returns Promise<RecentReportType[]> - The list of report types
 */
export const getReportTypes = async (): Promise<RecentReportType[]> => {
  return ApiClient.get<RecentReportType[]>('/report-types');
};

/**
 * Get a report type by ID
 * @param id - The ID of the report type to get
 * @returns Promise<ReportTypeTemplate | null> - The report type template or null if not found
 */
export const getReportTypeById = async (id: string): Promise<ReportTypeTemplate | null> => {
  try {
    return await ApiClient.get<ReportTypeTemplate>(`/report-types/${id}`);
  } catch (error) {
    console.error(`Error fetching report type ${id}:`, error);
    return null;
  }
};

/**
 * Get fields for a report type
 * @param reportTypeId - The ID of the report type to get fields for
 * @returns Promise<ApiReportField[]> - The fields for the report type
 */
export const getReportTypeFields = async (reportTypeId: string): Promise<ApiReportField[]> => {
  return ApiClient.get<ApiReportField[]>(`/report-types/${reportTypeId}/fields`);
}; 