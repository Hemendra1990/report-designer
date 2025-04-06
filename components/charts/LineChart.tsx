'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Jan 2024', visitors: 45200 },
  { name: 'Feb 2024', visitors: 52800 },
  { name: 'Mar 2024', visitors: 61400 },
  { name: 'Apr 2024', visitors: 55900 },
  { name: 'May 2024', visitors: 67300 },
  { name: 'Jun 2024', visitors: 72100 },
];

export function LineChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => value.toLocaleString() + ' visitors'} />
        <Line 
          type="monotone" 
          dataKey="visitors" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Website Traffic"
          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
} 