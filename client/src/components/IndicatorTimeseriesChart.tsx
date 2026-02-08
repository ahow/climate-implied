import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IndicatorTimeseriesChartProps {
  data: Array<{
    year: number;
    [key: string]: number;
  }>;
  dataKey: string;
  title: string;
  yAxisLabel: string;
  color: string;
  formatValue?: (value: number) => string;
}

export function IndicatorTimeseriesChart({
  data,
  dataKey,
  title,
  yAxisLabel,
  color,
  formatValue = (v) => v.toFixed(2),
}: IndicatorTimeseriesChartProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">Historical trend (2015-2024)</p>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
          <XAxis
            dataKey="year"
            stroke="oklch(0.6 0 0)"
            tick={{ fill: 'oklch(0.7 0 0)', fontSize: 12 }}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: 'oklch(0.7 0 0)' }}
          />
          <YAxis
            stroke="oklch(0.6 0 0)"
            tick={{ fill: 'oklch(0.7 0 0)', fontSize: 12 }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'oklch(0.7 0 0)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.15 0 0)',
              border: '1px solid oklch(0.3 0 0)',
              borderRadius: '8px',
              color: 'oklch(0.9 0 0)',
            }}
            formatter={(value: number) => [formatValue(value), title]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
