"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the state structure
interface ReportTypeState {
  step: number;
  reportType: {
    templateType: string;
    name: string;
    description: string;
    primaryObject: {
      name: string;
      fields: string[];
    };
    relationships: Array<{
      fromObject: string;
      toObject: string;
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    }>;
    filters: Array<{
      field: string;
      fieldType: 'text' | 'number' | 'date' | 'boolean' | 'list';
      operator: string;
      defaultValue?: string;
      isRequired: boolean;
    }>;
  };
  isSubmitting: boolean;
  error: string | null;
}

// Define action types
type Action =
  | { type: 'SET_TEMPLATE_TYPE'; payload: string }
  | { type: 'SET_REPORT_DETAILS'; payload: { name: string; description: string } }
  | { type: 'SET_PRIMARY_OBJECT'; payload: { name: string; fields: string[] } }
  | { type: 'ADD_RELATIONSHIP'; payload: { fromObject: string; toObject: string; type: 'one-to-one' | 'one-to-many' | 'many-to-many' } }
  | { type: 'REMOVE_RELATIONSHIP'; payload: number }
  | { type: 'ADD_FILTER'; payload: { field: string; fieldType: 'text' | 'number' | 'date' | 'boolean' | 'list'; operator: string; defaultValue?: string; isRequired: boolean } }
  | { type: 'REMOVE_FILTER'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: ReportTypeState = {
  step: 1,
  reportType: {
    templateType: '',
    name: '',
    description: '',
    primaryObject: {
      name: '',
      fields: [],
    },
    relationships: [],
    filters: [],
  },
  isSubmitting: false,
  error: null,
};

// Create context
const ReportTypeContext = createContext<{
  state: ReportTypeState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Reducer function
function reportTypeReducer(state: ReportTypeState, action: Action): ReportTypeState {
  switch (action.type) {
    case 'SET_TEMPLATE_TYPE':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          templateType: action.payload,
        },
      };
    case 'SET_REPORT_DETAILS':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          name: action.payload.name,
          description: action.payload.description,
        },
      };
    case 'SET_PRIMARY_OBJECT':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          primaryObject: action.payload,
        },
      };
    case 'ADD_RELATIONSHIP':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          relationships: [...state.reportType.relationships, action.payload],
        },
      };
    case 'REMOVE_RELATIONSHIP':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          relationships: state.reportType.relationships.filter((_, index) => index !== action.payload),
        },
      };
    case 'ADD_FILTER':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          filters: [...state.reportType.filters, action.payload],
        },
      };
    case 'REMOVE_FILTER':
      return {
        ...state,
        reportType: {
          ...state.reportType,
          filters: state.reportType.filters.filter((_, index) => index !== action.payload),
        },
      };
    case 'NEXT_STEP':
      return {
        ...state,
        step: state.step + 1,
      };
    case 'PREVIOUS_STEP':
      return {
        ...state,
        step: Math.max(1, state.step - 1),
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Provider component
export function ReportTypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportTypeReducer, initialState);

  return (
    <ReportTypeContext.Provider value={{ state, dispatch }}>
      {children}
    </ReportTypeContext.Provider>
  );
}

// Custom hook for using the context
export function useReportType() {
  const context = useContext(ReportTypeContext);
  if (context === undefined) {
    throw new Error('useReportType must be used within a ReportTypeProvider');
  }
  return context;
}

// API functions
export async function createReportType(reportType: ReportTypeState['reportType']) {
  try {
    const response = await fetch('/api/report-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportType),
    });

    if (!response.ok) {
      throw new Error('Failed to create report type');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
} 