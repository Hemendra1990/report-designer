import React, { Dispatch, SetStateAction } from 'react';
import { DataTable } from './DataTable';
import Link from 'next/link';
import {
  ColumnDef,
  ColumnFiltersState,
  GroupingState,
  SortingState,
  VisibilityState,
  OnChangeFn
} from "@tanstack/react-table";
import {
  ExpandIcon,
  FileIcon,
  ListIcon,
  TableIcon,
  ArrowRightIcon,
  CollapseIcon
} from "@/components/icons";

interface PreviewPanelProps {
  rowData: any[];
  columns: ColumnDef<any>[];
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: Dispatch<SetStateAction<VisibilityState>>;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
  showRowCounts: boolean;
  toggleRowCounts: () => void;
  showDetailRows: boolean;
  toggleDetailRows: () => void;
  grouping: GroupingState;
  onGroupingChange: OnChangeFn<GroupingState>;
  expandedRowGroups: Record<string, boolean>;
  setExpandedRowGroups: Dispatch<SetStateAction<Record<string, boolean>>>;
  pageCount: number;
  totalRows: number;
  isLoading: boolean;
  autoUpdatePreview: boolean;
  setAutoUpdatePreview: Dispatch<SetStateAction<boolean>>;
  onExpandView: () => void;
  isExpanded?: boolean;
  // Pivot-related properties
  isPivotTable?: boolean;
  pivotColumns?: string[];
  pivotValues?: string[];
}

const getColumnKey = (column: { id: string; meta?: { duckDBColumnName?: string; columnName?: string; } }) => {
  const meta = column.meta || {};
  return meta.duckDBColumnName || meta.columnName || column.id;
};

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  rowData,
  columns,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  pagination,
  setPagination,
  showRowCounts,
  toggleRowCounts,
  showDetailRows,
  toggleDetailRows,
  grouping,
  onGroupingChange,
  expandedRowGroups,
  setExpandedRowGroups,
  pageCount,
  totalRows,
  isLoading,
  autoUpdatePreview,
  setAutoUpdatePreview,
  onExpandView,
  isExpanded = false,
  // Pivot-related properties
  isPivotTable,
  pivotColumns,
  pivotValues
}) => {
  return (
    <div className="flex-1 bg-accent/10 flex flex-col min-w-0" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="p-3 bg-background border-b border-border flex justify-between shrink-0">
        <div className="flex items-center">
          <button
            className="mr-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onExpandView}
            title={isExpanded ? "Collapse preview" : "Expand preview"}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <span className="text-sm font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              className={`p-1 rounded ${showRowCounts ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={toggleRowCounts}
              title="Toggle Row Counts"
            >
              <ListIcon />
            </button>
            <button
              className={`p-1 rounded ${showDetailRows ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={toggleDetailRows}
              title="Toggle Detail Rows"
            >
              <TableIcon />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Update Automatically</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoUpdatePreview}
                onChange={() => setAutoUpdatePreview(!autoUpdatePreview)}
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-muted-foreground after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>
        </div>
      </div>

      {rowData.length > 0 ? (
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="w-full h-full rounded-md overflow-hidden border border-border flex flex-col">
            <DataTable
              data={rowData}
              columns={columns}
              sorting={sorting}
              setSorting={setSorting}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              pagination={pagination}
              setPagination={setPagination}
              showRowCounts={showRowCounts}
              showDetailRows={showDetailRows}
              grouping={grouping}
              onGroupingChange={onGroupingChange}
              expandedRowGroups={expandedRowGroups}
              setExpandedRowGroups={setExpandedRowGroups}
              pageCount={pageCount}
              totalRows={totalRows}
              isLoading={isLoading}
              isPivotTable={isPivotTable}
              pivotColumns={pivotColumns || []}
              pivotValues={pivotValues || []}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="h-[500px] w-full flex items-center justify-center">
            <div className="max-w-md text-center">
              <FileIcon 
                className="mx-auto mb-4 text-gray-400"
                size={40}
              />

              <h3 className="text-lg font-medium mb-3 text-gray-700">No records returned in preview</h3>
              <p className="text-gray-500 mb-4">Try running the report or editing report filters.</p>

              <div className="space-y-2 text-left">
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <ArrowRightIcon />
                    Show All accounts.
                  </Link>
                </div>
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <ArrowRightIcon />
                    Set the Created Date filter to All Time.
                  </Link>
                </div>
                <div>
                  <Link href="#" className="text-blue-600 flex items-center gap-1 text-sm">
                    <ArrowRightIcon />
                    Edit other filters in the filter panel.
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel; 