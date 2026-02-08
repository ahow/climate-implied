import { useMemo } from "react";
import {
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

interface ScenarioData {
  scenarioCode: string;
  scenarioName: string;
  color: string;
  data: Array<{ year: number; emissions: number }>;
}

interface ScenarioComparisonChartProps {
  scenarios: ScenarioData[];
  height?: number;
  title?: string;
  subtitle?: string;
}

export function ScenarioComparisonChart({
  scenarios,
  height = 500,
  title = "Emissions Scenarios Comparison",
  subtitle = "Comparing different policy pathways and their projected outcomes",
}: ScenarioComparisonChartProps) {
  const chartData = useMemo(() => {
    if (scenarios.length === 0) return [];

    // Get all unique years across all scenarios
    const allYears = new Set<number>();
    scenarios.forEach((scenario) => {
      scenario.data.forEach((d) => allYears.add(d.year));
    });

    const years = Array.from(allYears).sort((a, b) => a - b);

    // Create combined data structure
    return years.map((year) => {
      const dataPoint: any = { year };

      scenarios.forEach((scenario) => {
        const yearData = scenario.data.find((d) => d.year === year);
        if (yearData) {
          dataPoint[scenario.scenarioCode] = yearData.emissions;
        }
      });

      return dataPoint;
    });
  }, [scenarios]);

  const formatYear = (year: number) => year.toString();
  const formatEmissions = (value: number) => `${value.toFixed(1)} GtCO₂e`;

  return (
    <Card className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
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
            formatter={(value: number, name: string) => {
              const scenario = scenarios.find((s) => s.scenarioCode === name);
              return [formatEmissions(value), scenario?.scenarioName || name];
            }}
            labelFormatter={(year) => `Year ${year}`}
          />

          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="line"
            formatter={(value) => {
              const scenario = scenarios.find((s) => s.scenarioCode === value);
              return (
                <span style={{ color: "oklch(0.85 0.01 250)", fontSize: 12 }}>
                  {scenario?.scenarioName || value}
                </span>
              );
            }}
          />

          {scenarios.map((scenario) => (
            <Line
              key={scenario.scenarioCode}
              type="monotone"
              dataKey={scenario.scenarioCode}
              stroke={scenario.color}
              strokeWidth={3}
              dot={false}
              name={scenario.scenarioCode}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {scenarios.map((scenario) => (
          <div key={scenario.scenarioCode} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: scenario.color }}
            />
            <span className="text-xs text-muted-foreground">{scenario.scenarioName}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
