import { GroupingState, SortingState } from "@tanstack/react-table";
import { Field, FormulaColumn } from "./Field";
import { Filter } from "./Filter";

export interface FetchDataOptions {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    grouping: GroupingState;
    selectedColumns: (Field | FormulaColumn)[];
    filters: Filter[];
  }
  
export interface ServerResponse {
    data: any[];
    pageCount: number;
    totalRows: number;
  }