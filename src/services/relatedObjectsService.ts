import { ApiService } from './api';

interface TableColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  referencedTable: string | null;
  referencedColumn: string | null;
}

interface TableMetadata {
  schema: string;
  tableName: string;
  columns: TableColumn[];
}

class RelatedObjectsService extends ApiService<TableMetadata> {
  constructor() {
    super('metadata');
  }

  async getRelatedObjects(schema: string, tableName: string): Promise<TableMetadata[]> {
    return this.request<TableMetadata[]>({
      method: 'GET',
      url: `tables/${schema}/${tableName}/related`,
    });
  }

  async searchRelatedObjects(query?: string, schema?: string): Promise<TableMetadata[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (schema) params.append('schema', schema);
    
    return this.request<TableMetadata[]>({
      method: 'GET',
      url: `tables/search?${params.toString()}`,
    });
  }
}

export const relatedObjectsService = new RelatedObjectsService(); 