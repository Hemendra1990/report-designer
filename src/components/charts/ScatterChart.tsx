'use client';

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { price: 49.99, rating: 4.2, name: 'Product A' },
  { price: 99.99, rating: 4.5, name: 'Product B' },
  { price: 149.99, rating: 4.8, name: 'Product C' },
  { price: 199.99, rating: 4.1, name: 'Product D' },
  { price: 299.99, rating: 4.7, name: 'Product E' },
  { price: 399.99, rating: 4.9, name: 'Product F' },
  { price: 499.99, rating: 4.4, name: 'Product G' },
  { price: 599.99, rating: 4.6, name: 'Product H' },
];

export function ScatterChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="price" 
          name="Price" 
          unit="$"
          domain={[0, 'dataMax + 100']}
        />
        <YAxis 
          type="number" 
          dataKey="rating" 
          name="Rating"
          domain={[0, 5]}
          tickCount={6}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => [
            name === 'price' ? `$${value}` : value,
            name === 'price' ? 'Price' : 'Rating'
          ]}
        />
        <Scatter 
          name="Products" 
          data={data} 
          fill="#3b82f6"
          shape="circle"
          legendType="none"
        />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
} 