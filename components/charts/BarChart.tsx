'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Jan 2024', sales: 12500 },
  { name: 'Feb 2024', sales: 18900 },
  { name: 'Mar 2024', sales: 15700 },
  { name: 'Apr 2024', sales: 22400 },
  { name: 'May 2024', sales: 19800 },
  { name: 'Jun 2024', sales: 24600 },
];

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Bar dataKey="sales" fill="#3b82f6" name="Monthly Sales" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
} 