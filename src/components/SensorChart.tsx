'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HistoryEntry, SensorField } from '@/types';

interface SensorChartProps {
  data: HistoryEntry[];
  sensor: SensorField;
  color?: string;
  height?: number | string;
}

const SensorChart: React.FC<SensorChartProps> = ({ data, sensor, color = '#005a9c', height = '100%' }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div style={{ width: '100%', height: height }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>
        {sensor.name} Trend ({sensor.unit})
      </h4>
      <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTime}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              domain={([dataMin, dataMax]) => [
                Math.min(0, dataMin, sensor.min ?? 0),
                Math.max(dataMax, sensor.max ?? dataMax)
              ]}
            />
            <Tooltip 
              labelFormatter={(label) => new Date(label).toLocaleString()}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '10px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={sensor.field}
              name={sensor.name}
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;
