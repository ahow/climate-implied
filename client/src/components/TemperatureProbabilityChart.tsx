import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TemperatureProbabilityChartProps {
  comparisons: Array<{
    scenario: string;
    region?: string;
    dimension?: string;
    label: string;
    color: string;
  }>;
  customParams?: {
    climateSensitivity?: number;
    policyImplementationRate?: number;
    technologyAdoptionSpeed?: number;
    economicGrowthRate?: number;
  };
}

export function TemperatureProbabilityChart({ comparisons, customParams }: TemperatureProbabilityChartProps) {
  const { data: distributions, isLoading } = trpc.temperature.multipleDistributions.useQuery({
    comparisons: comparisons.map((c) => ({
      scenario: c.scenario,
      region: c.region,
      dimension: c.dimension,
      label: c.label,
    })),
    customParams,
  });

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display">Temperature Rise Probability Distribution</CardTitle>
          <CardDescription>Loading probability analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Generating probability distributions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!distributions || distributions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display">Temperature Rise Probability Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Merge all PDF data points by temperature
  const temperaturePoints = distributions[0].pdf.map((point) => point.temperature);
  const chartData = temperaturePoints.map((temp) => {
    const dataPoint: Record<string, number> = { temperature: temp };

    distributions.forEach((dist, index) => {
      const pdfPoint = dist.pdf.find((p) => p.temperature === temp);
      if (pdfPoint) {
        dataPoint[`probability_${index}`] = pdfPoint.probability;
      }
    });

    return dataPoint;
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{label.toFixed(2)}°C Temperature Rise</p>
        {payload.map((entry: any, index: number) => {
          const dist = distributions[index];
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{dist.label}:</span>
              <span className="font-mono font-semibold">{(entry.value * 100).toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-display">Temperature Rise Probability Distribution</CardTitle>
        <CardDescription>
          Probability density showing likelihood of different long-run temperature outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {distributions.map((dist, index) => {
            const comparison = comparisons[index];
            return (
              <div
                key={index}
                className="rounded-lg border border-border/30 bg-background/40 p-4"
                style={{ borderLeftWidth: "3px", borderLeftColor: comparison.color }}
              >
                <div className="text-xs text-muted-foreground mb-1">{dist.label}</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold font-mono">{dist.median}°C</div>
                  <div className="text-xs text-muted-foreground">median</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Range: {dist.p10}°C - {dist.p90}°C (80% confidence)
                </div>
                <div className="text-xs text-muted-foreground">Mean: {dist.mean}°C</div>
              </div>
            );
          })}
        </div>

        {/* Probability Distribution Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {comparisons.map((comp, index) => (
                  <linearGradient key={index} id={`gradient_${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={comp.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={comp.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.3} />
              <XAxis
                dataKey="temperature"
                stroke="oklch(0.6 0 0)"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                label={{
                  value: "Temperature Rise (°C)",
                  position: "insideBottom",
                  offset: -5,
                  style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                }}
                domain={[1, 5]}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis
                stroke="oklch(0.6 0 0)"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                label={{
                  value: "Probability Density",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry: any) => {
                  const index = parseInt(value.split("_")[1]);
                  return distributions[index]?.label || value;
                }}
              />
              {comparisons.map((comp, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={`probability_${index}`}
                  stroke={comp.color}
                  strokeWidth={2}
                  fill={`url(#gradient_${index})`}
                  name={`probability_${index}`}
                  dot={false}
                  activeDot={{ r: 4, fill: comp.color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation Guide */}
        <div className="mt-6 rounded-lg border border-border/30 bg-background/20 p-4">
          <h4 className="text-sm font-semibold mb-2">How to Read This Chart</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • The <strong>height of the curve</strong> at any temperature shows the probability density (likelihood)
              of that outcome
            </p>
            <p>
              • The <strong>median</strong> represents the 50th percentile - equal probability of higher or lower
              warming
            </p>
            <p>
              • The <strong>80% confidence range</strong> (P10-P90) shows where most outcomes are expected to fall
            </p>
            <p>
              • <strong>Wider curves</strong> indicate greater uncertainty; <strong>narrower curves</strong> indicate
              more confidence
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
