import { GroupingState, SortingState } from "@tanstack/react-table";
import { AccountData } from "./AccountData";
import { Filter } from "./Filter";

export interface FetchDataOptions {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    grouping: GroupingState;
    selectedColumns: { id: string; name: string; type: string }[];
    filters: Filter[];
  }
  
export interface ServerResponse {
    data: AccountData[];
    pageCount: number;
    totalRows: number;
  }