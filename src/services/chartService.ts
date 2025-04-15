'use client';

import { ChartData } from '@/types/dashboard';

// Mock reports data (would come from API in real implementation)
export const reports = [
  {
    id: '1',
    name: 'New Demo With SS Report',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  },
  {
    id: '2',
    name: 'Sales Performance',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  },
  {
    id: '3',
    name: 'Customer Analysis',
    createdBy: 'Hemendra Sethi',
    folder: 'Private Reports'
  }
];

// Mock API function to fetch chart data
export const fetchChartData = async (reportId: string): Promise<ChartData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86, 27],
      }
    ]
  };
}; 