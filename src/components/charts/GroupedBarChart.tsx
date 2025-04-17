'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Jan', group1: 400, group2: 300 },
  { name: 'Feb', group1: 300, group2: 400 },
  { name: 'Mar', group1: 600, group2: 500 },
  { name: 'Apr', group1: 800, group2: 700 },
  { name: 'May', group1: 500, group2: 600 },
  { name: 'Jun', group1: 700, group2: 800 },
];

export function GroupedBarChart({ data, config }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="group1" fill="#3b82f6" name="Group 1" />
        <Bar dataKey="group2" fill="#60a5fa" name="Group 2" />
      </BarChart>
    </ResponsiveContainer>
  );
} 