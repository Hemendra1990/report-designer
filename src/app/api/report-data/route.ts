import { NextResponse } from 'next/server';
import type { SortingState, GroupingState } from '@tanstack/react-table';

// Import your sample data
const sampleData = [
  {
    id: 1,
    account_name: "Acme Corporation",
    account_owner: "John Doe",
    billing_state: "CA",
    type: "Customer",
    rating: "Hot",
    last_activity: "2024-03-15",
    annual_revenue: 1000000,
    phone: "123-456-7890"
  },
  {
    id: 2,
    account_name: "Umbrella Corporation",
    account_owner: "Jane Smith",
    billing_state: "NY",
    type: "Customer",
    rating: "Warm",
    last_activity: "2024-03-14",
    annual_revenue: 2000000,
    phone: "234-567-8901"
  },
  {
    id: 3,
    account_name: "Abstergo Industries",
    account_owner: "Bob Wilson",
    billing_state: "TX",
    type: "Customer",
    rating: "Cold",
    last_activity: "2024-03-13",
    annual_revenue: 3000000,
    phone: "345-678-9012"
  },
  {
    id: 4,
    account_name: "Wayne Enterprises",
    account_owner: "Bruce Wayne",
    billing_state: "NY",
    type: "Partner",
    rating: "Hot",
    last_activity: "2024-03-12",
    annual_revenue: 5000000,
    phone: "456-789-0123"
  },
  {
    id: 5,
    account_name: "Stark Industries",
    account_owner: "Tony Stark",
    billing_state: "CA",
    type: "Partner",
    rating: "Hot",
    last_activity: "2024-03-11",
    annual_revenue: 4000000,
    phone: "567-890-1234"
  },
  {
    id: 6,
    account_name: "Oscorp",
    account_owner: "Norman Osborn",
    billing_state: "CA",
    type: "Customer",
    rating: "Warm",
    last_activity: "2024-03-10",
    annual_revenue: 1500000,
    phone: "678-901-2345"
  }
];

interface Filter {
  id: string;
  field: {
    id: string;
    name: string;
    type: string;
  };
  operator: string;
  value: string;
  rangeStart?: string;
  rangeEnd?: string;
  selectedOptions?: string[];
}

function applyFilters(data: any[], filters: Filter[]) {
  return data.filter(item => {
    return filters.every(filter => {
      const value = item[filter.field.id];
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
        case 'greater_than':
          return Number(value) > Number(filter.value);
        case 'less_than':
          return Number(value) < Number(filter.value);
        case 'between':
          return Number(value) >= Number(filter.rangeStart) && Number(value) <= Number(filter.rangeEnd);
        default:
          return true;
      }
    });
  });
}

function applySorting(data: any[], sorting: SortingState) {
  if (!sorting.length) return data;

  return [...data].sort((a, b) => {
    for (const sort of sorting) {
      const desc = sort.desc ? -1 : 1;
      const aVal = a[sort.id];
      const bVal = b[sort.id];

      if (aVal < bVal) return -1 * desc;
      if (aVal > bVal) return 1 * desc;
    }
    return 0;
  });
}

function applyGrouping(data: any[], grouping: GroupingState) {
  if (!grouping.length) return data;

  const groups = new Map();
  data.forEach(item => {
    let currentGroup = groups;
    grouping.forEach(groupField => {
      const groupValue = item[groupField];
      if (!currentGroup.has(groupValue)) {
        currentGroup.set(groupValue, new Map());
      }
      currentGroup = currentGroup.get(groupValue);
    });
    if (!currentGroup.has('items')) {
      currentGroup.set('items', []);
    }
    currentGroup.get('items').push(item);
  });

  return data; // For now, return ungrouped data as grouping is handled client-side
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, pageSize, sorting, grouping, columns, filters } = body;

    // Apply filters, sorting, and grouping
    let filteredData = applyFilters(sampleData, filters);
    let sortedData = applySorting(filteredData, sorting);
    let groupedData = applyGrouping(sortedData, grouping);

    // Calculate pagination
    const totalRows = groupedData.length;
    const pageCount = Math.ceil(totalRows / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = groupedData.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      pageCount,
      totalRows
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 