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
  { name: 'Jan 2024', product: 28000, service: 15000, subscription: 12000 },
  { name: 'Feb 2024', product: 32000, service: 18000, subscription: 13500 },
  { name: 'Mar 2024', product: 30000, service: 16500, subscription: 14000 },
  { name: 'Apr 2024', product: 35000, service: 19000, subscription: 15500 },
  { name: 'May 2024', product: 33000, service: 17500, subscription: 16000 },
  { name: 'Jun 2024', product: 38000, service: 20000, subscription: 17000 },
];

export function StackedBarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="product" stackId="a" fill="#3b82f6" name="Product Revenue" />
        <Bar dataKey="service" stackId="a" fill="#60a5fa" name="Service Revenue" />
        <Bar dataKey="subscription" stackId="a" fill="#93c5fd" name="Subscription Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
} 