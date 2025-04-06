"use client";

import { useState, useEffect } from 'react';
import { useReportType } from '@/contexts/ReportTypeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllTables, getAvailableSchemas } from '@/services/databaseService';

interface TableInfo {
  tableName: string;
  schema: string;
  columns: ColumnInfo[];
}

interface ColumnInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function SelectPrimaryObject() {
  const { state, dispatch } = useReportType();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState(state.reportType.primaryObject.name || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(state.reportType.primaryObject.fields || []);
  const [availableTables, setAvailableTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    loadSchemas();
  }, []);

  useEffect(() => {
    loadTables();
  }, [selectedSchema, pagination.currentPage, pageSize]);

  async function loadSchemas() {
    try {
      const availableSchemas = await getAvailableSchemas();
      setSchemas(availableSchemas);
      if (availableSchemas.length > 0) {
        setSelectedSchema(availableSchemas[0]);
      }
    } catch (err) {
      console.error('Error loading schemas:', err);
    }
  }

  async function loadTables() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllTables(pagination.currentPage, pageSize, selectedSchema);
      setAvailableTables(response.items);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems
      });
    } catch (err) {
      setError('Failed to load database tables. Please try again later.');
      console.error('Error loading tables:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTables = availableTables.filter(table =>
    table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.schema.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleObjectChange = (tableName: string) => {
    const selectedTable = availableTables.find(table => table.tableName === tableName);
    if (!selectedTable) return;

    setSelectedObject(tableName);
    setSelectedFields([]);
    dispatch({
      type: 'SET_PRIMARY_OBJECT',
      payload: {
        name: tableName,
        fields: [],
      },
    });
  };

  const handleFieldToggle = (field: string) => {
    const newFields = selectedFields.includes(field)
      ? selectedFields.filter(f => f !== field)
      : [...selectedFields, field];
    
    setSelectedFields(newFields);
    dispatch({
      type: 'SET_PRIMARY_OBJECT',
      payload: {
        name: selectedObject,
        fields: newFields,
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const selectedTableData = availableTables.find(table => table.tableName === selectedObject);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Primary Object</h2>
        <p className="text-muted-foreground mb-4">
          Choose the main table for your report and select the fields you want to include.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Schema</Label>
            <Select value={selectedSchema} onValueChange={setSelectedSchema}>
              <SelectTrigger>
                <SelectValue placeholder="Select a schema" />
              </SelectTrigger>
              <SelectContent>
                {schemas.map((schema) => (
                  <SelectItem key={schema} value={schema}>
                    {schema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Items per page</Label>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} items
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Search Tables</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label>Primary Table</Label>
          <Select value={selectedObject} onValueChange={handleObjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="p-2 text-center text-muted-foreground">
                  Loading tables...
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  No tables found
                </div>
              ) : (
                filteredTables.map((table) => (
                  <SelectItem key={`${table.schema}.${table.tableName}`} value={table.tableName}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span>{table.schema}.{table.tableName}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} tables
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedTableData && (
          <div>
            <Label>Select Fields</Label>
            <div className="mt-2 space-y-2">
              {selectedTableData.columns.map((column) => (
                <Button
                  key={column.name}
                  variant={selectedFields.includes(column.name) ? "default" : "outline"}
                  className="mr-2 mb-2"
                  onClick={() => handleFieldToggle(column.name)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.name}</span>
                    <span className="text-xs text-muted-foreground">({column.dataType})</span>
                    {column.primaryKey && (
                      <span className="text-xs bg-primary/20 text-primary px-1 rounded">PK</span>
                    )}
                    {column.foreignKey && (
                      <span className="text-xs bg-primary/20 text-primary px-1 rounded">FK</span>
                    )}
                  </div>
                  {selectedFields.includes(column.name) && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 