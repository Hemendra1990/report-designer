import { Field } from "./Field";

// Filter state interface
export interface FilterState {
    value: string;
    setValue: (value: string) => void;
    rangeStart: string;
    setRangeStart: (value: string) => void;
    rangeEnd: string;
    setRangeEnd: (value: string) => void;
    selectedOptions: string[];
    setSelectedOptions: (options: string[]) => void;
  }
  
  // Add this interface for filter state
export interface Filter {
    id: string;
    field: Field;
    operator: string;
    value: string;
    rangeStart?: string;
    rangeEnd?: string;
    selectedOptions?: string[];
  }