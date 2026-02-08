import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

interface DataPoint {
  year: number;
  p10?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
  historical?: number;
}

interface EmissionsTrajectoryChartProps {
  data: DataPoint[];
  scenarioName: string;
  scenarioColor: string;
  showConfidenceBands?: boolean;
  height?: number;
}

export function EmissionsTrajectoryChart({
  data,
  scenarioName,
  scenarioColor,
  showConfidenceBands = true,
  height = 500,
}: EmissionsTrajectoryChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      // For area chart, we need the range values
      range90: d.p90 && d.p10 ? [d.p10, d.p90] : undefined,
      range50: d.p75 && d.p25 ? [d.p25, d.p75] : undefined,
    }));
  }, [data]);

  const formatYear = (year: number) => year.toString();
  const formatEmissions = (value: number) => `${value.toFixed(1)} GtCO₂e`;

  return (
    <Card className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{scenarioName} Scenario</h3>
        <p className="text-sm text-muted-foreground">
          Global emissions trajectory with probability distribution
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={`gradient-${scenarioName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={scenarioColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={scenarioColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 250)" opacity={0.5} />
          
          <XAxis
            dataKey="year"
            tickFormatter={formatYear}
            stroke="oklch(0.65 0.01 250)"
            style={{ fontSize: 12 }}
            tickLine={false}
          />
          
          <YAxis
            tickFormatter={(value) => `${value}`}
            stroke="oklch(0.65 0.01 250)"
            style={{ fontSize: 12 }}
            tickLine={false}
            label={{
              value: "GtCO₂e",
              angle: -90,
              position: "insideLeft",
              style: { fill: "oklch(0.65 0.01 250)", fontSize: 12 },
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.18 0.02 250)",
              border: "1px solid oklch(0.28 0.02 250)",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ color: "oklch(0.95 0.01 250)", fontWeight: 600, marginBottom: 8 }}
            formatter={(value: number) => [formatEmissions(value), ""]}
            labelFormatter={(year) => `Year ${year}`}
          />

          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: "oklch(0.85 0.01 250)", fontSize: 12 }}>{value}</span>
            )}
          />

          {/* Historical data */}
          {chartData.some((d) => d.historical) && (
            <Line
              type="monotone"
              dataKey="historical"
              stroke="oklch(0.65 0.01 250)"
              strokeWidth={2}
              dot={false}
              name="Historical"
              strokeDasharray="5 5"
            />
          )}

          {/* 90% confidence band (p10 to p90) */}
          {showConfidenceBands && chartData.some((d) => d.p90 && d.p10) && (
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill={scenarioColor}
              fillOpacity={0.1}
              name="90% Confidence"
            />
          )}

          {/* 50% confidence band (p25 to p75) */}
          {showConfidenceBands && chartData.some((d) => d.p75 && d.p25) && (
            <Area
              type="monotone"
              dataKey="p75"
              stroke="none"
              fill={scenarioColor}
              fillOpacity={0.2}
              name="50% Confidence"
            />
          )}

          {/* Median trajectory (p50) */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke={scenarioColor}
            strokeWidth={3}
            dot={false}
            name="Median Trajectory"
          />

          {/* p25 line */}
          {showConfidenceBands && chartData.some((d) => d.p25) && (
            <Line
              type="monotone"
              dataKey="p25"
              stroke={scenarioColor}
              strokeWidth={1}
              strokeOpacity={0.5}
              dot={false}
              name="25th Percentile"
            />
          )}

          {/* p10 line */}
          {showConfidenceBands && chartData.some((d) => d.p10) && (
            <Line
              type="monotone"
              dataKey="p10"
              stroke={scenarioColor}
              strokeWidth={1}
              strokeOpacity={0.3}
              dot={false}
              name="10th Percentile"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: scenarioColor }}
          />
          <span className="text-xs text-muted-foreground">Median (50th percentile)</span>
        </div>
        {showConfidenceBands && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-8 rounded"
                style={{ backgroundColor: scenarioColor, opacity: 0.2 }}
              />
              <span className="text-xs text-muted-foreground">50% Confidence Band</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-8 rounded"
                style={{ backgroundColor: scenarioColor, opacity: 0.1 }}
              />
              <span className="text-xs text-muted-foreground">90% Confidence Band</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
