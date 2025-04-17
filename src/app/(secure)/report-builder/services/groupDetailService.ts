// Service to fetch group detail records by group value
import { buildSqlQuery } from "@/app/(secure)/report-builder/util/SqlQueryBuilder";
import { executeQueryOnDuckDB } from "@/services/rd/http-rd-service";

export async function fetchGroupDetailRecords(
  groupField: string,
  groupValue: string, 
  page: number = 1, 
  pageSize: number = 5,
  baseQuery?: string, // Not used directly anymore
  cteQuery?: string,   // Still needed for the query execution
  // Add these new parameters to match the main page's buildSqlQuery usage
  reportContext?: {
    selectedReportType: any,
    selectedColumns: any[],
    filters: any[],
    filterLogic: 'and' | 'or' | 'custom',
    groupByFields: string[],
    isPivotActive: boolean,
    pivotColumnIds: string[],
    pivotValues: string[],
    selectedAggregations: Record<string, string>
  },
  // Additional parameter to handle nested grouping
  // For multi-level grouping, we need to know all parent group values
  parentGroupValues?: Record<string, string>
) {
  try {
    console.log('Group detail fetch initiated for:', { 
      groupField, 
      groupValue, 
      page, 
      pageSize,
      parentGroupValues 
    });
    
    if (reportContext) {
      // Create a special filter for this group field value
      const groupFilter = {
        id: `group-filter-${Date.now()}`,
        field: { 
          id: groupField,
          name: groupField,
          type: 'string',
          duckDBColumnName: groupField,
          columnName: groupField
        },
        operator: 'equals',
        value: groupValue
      };
      
      // Start with the current filters
      let filtersWithGroup = [...(reportContext.filters || []), groupFilter];
      
      // If we have parent group values, add filters for each of them
      if (parentGroupValues && Object.keys(parentGroupValues).length > 0) {
        console.log('Adding filters for parent groups:', parentGroupValues);
        
        // For each parent group, add a filter
        Object.entries(parentGroupValues).forEach(([parentField, parentValue]) => {
          // Skip if this is the current group field (already filtered above)
          if (parentField === groupField) return;
          
          filtersWithGroup.push({
            id: `parent-group-filter-${parentField}-${Date.now()}`,
            field: { 
              id: parentField,
              name: parentField,
              type: 'string',
              duckDBColumnName: parentField,
              columnName: parentField
            },
            operator: 'equals',
            value: parentValue
          });
        });
      }
      
      // Log the complete set of filters for debugging
      console.log('Complete filter set for nested group query:', 
        filtersWithGroup.map(filter => ({
          field: filter.field.id || filter.field.columnName || filter.field.duckDBColumnName,
          operator: filter.operator,
          value: filter.value
        }))
      );
      
      // Use the same query building approach as the main page
      const sqlQuery = buildSqlQuery({
        selectedReportType: reportContext.selectedReportType,
        reportType: reportContext.selectedReportType?.name || "",
        selectedColumns: reportContext.selectedColumns,
        // Don't include grouping for detail records - we're getting individual rows
        groupByFields: [], 
        filters: filtersWithGroup,
        filterLogic: reportContext.filterLogic,
        customFilterFormula: "",
        isPivotActive: false, // Always false for detail views
        pivotColumnIds: [],
        pivotValues: [],
        selectedAggregations: {},
        cteQuery: cteQuery
      });
      
      // Remove newlines from the SQL query
      const cleanSqlQuery = sqlQuery.replace(/\n/g, ' ');
      console.log('Group detail SQL Query:', cleanSqlQuery);
      
      // Add pagination to the query
      const paginatedQuery = `${cleanSqlQuery} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
      
      // Create a count query to get total records
      const countQuerySQL = sqlQuery
        .replace(/SELECT.*?FROM/i, 'SELECT COUNT(*) as total FROM')
        .replace(/\s+ORDER BY.*?(LIMIT|$)/i, '')
        .replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?/i, '');
      
      console.log('Count query for group details:', countQuerySQL);
      
      // Execute both queries in parallel
      const [dataResult, countResult] = await Promise.all([
        executeQueryOnDuckDB({ 
          sql: cteQuery 
            ? `${cteQuery} ${paginatedQuery}` 
            : paginatedQuery 
        }),
        executeQueryOnDuckDB({ 
          sql: cteQuery 
            ? `${cteQuery} ${countQuerySQL}`
            : countQuerySQL
        })
      ]);
      
      // Extract and return the results
      return {
        data: dataResult?.data || [],
        totalCount: countResult?.data?.[0]?.total || 0
      };
    } else {
      // If we don't have the report context, fall back to a simple query
      console.warn('No report context provided for group detail fetch, using fallback query');
      
      // Add support for parent group values in the fallback query too
      let whereClause = `${groupField} = '${groupValue}'`;
      
      if (parentGroupValues && Object.keys(parentGroupValues).length > 0) {
        Object.entries(parentGroupValues).forEach(([parentField, parentValue]) => {
          // Skip if this is the current group field (already filtered above)
          if (parentField === groupField) return;
          whereClause += ` AND ${parentField} = '${parentValue}'`;
        });
      }
      
      const dataQuery = `
        SELECT *
        FROM accounts
        WHERE ${whereClause}
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM accounts
        WHERE ${whereClause}
      `;
      
      console.log('Fallback query for group details:', dataQuery);
      
      // Execute both queries against your DuckDB instance
      const [dataResult, countResult] = await Promise.all([
        executeQueryOnDuckDB({ sql: dataQuery }),
        executeQueryOnDuckDB({ sql: countQuery })
      ]);
      
      return {
        data: dataResult?.data || [],
        totalCount: countResult?.data?.[0]?.total || 0
      };
    }
  } catch (error) {
    console.error('Error fetching group details:', error);
    throw error;
  }
} 