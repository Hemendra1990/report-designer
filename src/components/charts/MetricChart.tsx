'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface MetricChartProps {
  data: ChartData;
}

export function MetricChart({ data }: MetricChartProps) {
  const [currentValue, setCurrentValue] = useState(0);
  
  // Get metric value from data
  const metricValue = data.datasets[0]?.data[0] || 0;
  // Get label for the metric
  const metricLabel = data.datasets[0]?.label || 'Value';
  // Get comparison value (if provided)
  const previousValue = data.datasets[0]?.data[1];
  
  // Calculate percentage change
  const calculateChange = () => {
    if (previousValue === undefined || previousValue === 0) return null;
    const change = ((metricValue - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };
  
  const change = calculateChange();
  
  // Animate the value on load
  useEffect(() => {
    if (metricValue === 0) {
      setCurrentValue(0);
      return;
    }
    
    const duration = 1000; // 1 second animation
    const stepTime = 20; // Update every 20ms
    const steps = duration / stepTime;
    const stepValue = metricValue / steps;
    let current = 0;
    let timer: NodeJS.Timeout;
    
    const animateValue = () => {
      current += stepValue;
      if (current >= metricValue) {
        current = metricValue;
        clearInterval(timer);
      }
      setCurrentValue(current);
    };
    
    timer = setInterval(animateValue, stepTime);
    return () => clearInterval(timer);
  }, [metricValue]);
  
  // Format the number based on its size
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Number(num.toFixed(1)).toLocaleString();
  };
  
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-500 mb-3">{metricLabel}</h3>
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {formatNumber(currentValue)}
        </div>
        
        {change && (
          <div className={`flex items-center justify-center gap-1 text-sm font-medium 
            ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change.isPositive ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            <span>{change.value}% from previous</span>
          </div>
        )}
      </div>
    </div>
  );
} 