interface ColumnInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

interface TableInfo {
  tableName: string;
  schema: string;
  columns: ColumnInfo[];
}

interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// Cache for table metadata
let tablesCache: TableInfo[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return !!(tablesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION);
}

export async function getAllTables(
  page: number = 1,
  pageSize: number = 20,
  schema?: string
): Promise<PaginatedResponse<TableInfo>> {
  try {

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Try to use cached data first
    if (isCacheValid() && tablesCache) {
      let filteredTables = tablesCache;
      if (schema) {
        filteredTables = tablesCache.filter(table => table.schema === schema);
      }

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedTables = filteredTables.slice(start, end);

      return {
        items: paginatedTables,
        totalItems: filteredTables.length,
        totalPages: Math.ceil(filteredTables.length / pageSize),
        currentPage: page
      };
    }

    // Fetch fresh data if cache is invalid
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
      ...(schema && { schema })
    });

    const response = await fetch(`${baseUrl}/metadata/tables?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const data = await response.json();
    
    // Update cache
    tablesCache = data.items;
    cacheTimestamp = Date.now();

    return data;
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
}

export async function getTableColumns(schema: string, tableName: string): Promise<ColumnInfo[]> {
  try {
    // Check cache first
    if (isCacheValid() && tablesCache) {
      const cachedTable = tablesCache.find(
        table => table.schema === schema && table.tableName === tableName
      );
      if (cachedTable) {
        return cachedTable.columns;
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metadata/tables/${schema}/${tableName}/columns`);
    if (!response.ok) {
      throw new Error('Failed to fetch columns');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching columns:', error);
    throw error;
  }
}

export function clearCache(): void {
  tablesCache = null;
  cacheTimestamp = null;
}

export async function getAvailableSchemas(): Promise<string[]> {
  try {
    if (isCacheValid() && tablesCache) {
      return Array.from(new Set(tablesCache.map(table => table.schema)));
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metadata/schemas`);
    if (!response.ok) {
      throw new Error('Failed to fetch schemas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching schemas:', error);
    throw error;
  }
}

export interface TableMetadata {
  tableName: string;
  displayName: string;
  schema: string;
  columns: ColumnMetadata[];
}

export interface ColumnMetadata {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  referencedTable: string | null;
  referencedColumn: string | null;
}

export async function getMetadataTables(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<TableMetadata>> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString()
    });

    console.log(`${process.env.NEXT_PUBLIC_BASE_URL}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metadata/tables?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata tables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata tables:', error);
    throw error;
  }
}

export async function searchTables(query?: string, schema?: string): Promise<TableMetadata[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (schema) params.append('schema', schema);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metadata/tables/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search tables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching tables:', error);
    throw error;
  }
}

export async function getRelatedTables(schema: string, tableName: string): Promise<TableMetadata[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metadata/tables/${schema}/${tableName}/related`);
    if (!response.ok) {
      throw new Error('Failed to fetch related tables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching related tables:', error);
    throw error;
  }
} 