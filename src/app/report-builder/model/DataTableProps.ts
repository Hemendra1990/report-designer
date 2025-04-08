import { ColumnDef, ColumnFiltersState, GroupingState, OnChangeFn, SortingState, VisibilityState } from "@tanstack/react-table";

export interface DataTableProps<TData extends Record<string, any>> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    columnFilters: ColumnFiltersState;
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    columnVisibility: VisibilityState;
    setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    showRowCounts: boolean;
    showDetailRows: boolean;
    grouping: GroupingState;
    onGroupingChange: OnChangeFn<GroupingState>;
    expandedRowGroups: Record<string, boolean>;
    setExpandedRowGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    pageCount: number;
    totalRows: number;
    isLoading: boolean;
}