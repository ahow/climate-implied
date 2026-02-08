/**
 * Sparkline Component
 * 
 * Displays a small inline chart showing historical trends for indicators.
 * Uses Recharts LineChart with minimal styling for compact display.
 */

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: Array<{ year: number; value: number }>;
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "#06b6d4", height = 32 }: SparklineProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
