import { Battery, Car, Sun, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TechnologyData {
  year: number;
  technologyType: string;
  capacity: string | null;
  capacityUnit: string;
  annualAdditions?: string | null;
  cumulativeInvestment?: string | null;
}

interface TechnologyDeploymentTrackerProps {
  data: TechnologyData[];
  latestData: TechnologyData[];
}

export function TechnologyDeploymentTracker({
  data,
  latestData,
}: TechnologyDeploymentTrackerProps) {
  const technologies = [
    {
      type: "solar",
      name: "Solar PV",
      icon: Sun,
      color: "oklch(0.70 0.18 50)", // Orange
      unit: "GW",
    },
    {
      type: "wind",
      name: "Wind Power",
      icon: Wind,
      color: "oklch(0.60 0.18 210)", // Cyan
      unit: "GW",
    },
    {
      type: "ev",
      name: "Electric Vehicles",
      icon: Car,
      color: "oklch(0.65 0.16 160)", // Green
      unit: "M units",
    },
    {
      type: "battery_storage",
      name: "Battery Storage",
      icon: Battery,
      color: "oklch(0.60 0.15 280)", // Purple
      unit: "GW",
    },
  ];

  // Prepare chart data by year
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.year === item.year);
    const capacityValue = item.capacity ? parseFloat(item.capacity) : 0;
    if (existing) {
      existing[item.technologyType] = capacityValue;
    } else {
      acc.push({
        year: item.year,
        [item.technologyType]: capacityValue,
      });
    }
    return acc;
  }, [] as any[]);

  chartData.sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Technology Deployment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking clean energy and transportation technology adoption
        </p>
      </div>

      {/* Latest Capacity Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {technologies.map((tech) => {
          const latest = latestData.find((d) => d.technologyType === tech.type);
          const Icon = tech.icon;
          const latestCapacity = latest?.capacity ? parseFloat(latest.capacity) : 0;
          const previousYear = data
            .filter((d) => d.technologyType === tech.type)
            .sort((a, b) => b.year - a.year)[1];
          const previousCapacity = previousYear?.capacity ? parseFloat(previousYear.capacity) : 0;
          const growthRate = previousCapacity
            ? ((latestCapacity - previousCapacity) / previousCapacity) * 100
            : 0;

          return (
            <Card key={tech.type} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-full p-3" style={{ backgroundColor: `${tech.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: tech.color }} />
                </div>
                {growthRate > 0 && (
                  <div className="text-xs text-chart-2 font-medium">
                    +{growthRate.toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{tech.name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="metric-value" style={{ color: tech.color }}>
                    {latestCapacity.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">{tech.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {latest?.annualAdditions
                    ? `+${parseFloat(latest.annualAdditions).toFixed(0)} ${tech.unit} added`
                    : "Cumulative capacity"}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Deployment Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Deployment Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 250)" opacity={0.5} />

            <XAxis
              dataKey="year"
              stroke="oklch(0.65 0.01 250)"
              style={{ fontSize: 12 }}
              tickLine={false}
            />

            <YAxis
              stroke="oklch(0.65 0.01 250)"
              style={{ fontSize: 12 }}
              tickLine={false}
              label={{
                value: "Capacity",
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
                const tech = technologies.find((t) => t.type === name);
                return [`${value.toFixed(0)} ${tech?.unit || ""}`, tech?.name || name];
              }}
              labelFormatter={(year) => `Year ${year}`}
            />

            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="line"
              formatter={(value) => {
                const tech = technologies.find((t) => t.type === value);
                return (
                  <span style={{ color: "oklch(0.85 0.01 250)", fontSize: 12 }}>
                    {tech?.name || value}
                  </span>
                );
              }}
            />

            {technologies.map((tech) => (
              <Line
                key={tech.type}
                type="monotone"
                dataKey={tech.type}
                stroke={tech.color}
                strokeWidth={3}
                dot={false}
                name={tech.type}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Growth Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Growth Insights</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {technologies.map((tech) => {
            const techData = data
              .filter((d) => d.technologyType === tech.type)
              .sort((a, b) => a.year - b.year);

            if (techData.length < 2) return null;

            const firstYear = techData[0];
            const lastYear = techData[techData.length - 1];
            const firstCapacity = firstYear.capacity ? parseFloat(firstYear.capacity) : 0;
            const lastCapacity = lastYear.capacity ? parseFloat(lastYear.capacity) : 0;
            const totalGrowth = firstCapacity
              ? ((lastCapacity - firstCapacity) / firstCapacity) * 100
              : 0;
            const years = lastYear.year - firstYear.year;
            const cagr = firstCapacity && years > 0
              ? (Math.pow(lastCapacity / firstCapacity, 1 / years) - 1) * 100
              : 0;

            return (
              <div key={tech.type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tech.color }}
                  />
                  <span className="font-medium">{tech.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Growth</div>
                    <div className="font-semibold text-chart-2">+{totalGrowth.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">CAGR</div>
                    <div className="font-semibold text-chart-2">{cagr.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
