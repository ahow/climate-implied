import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SECTOR_COLORS: Record<string, string> = {
  power: "oklch(0.65 0.20 150)", // Green
  transport: "oklch(0.65 0.20 210)", // Blue
  industry: "oklch(0.65 0.20 30)", // Orange
  buildings: "oklch(0.65 0.20 270)", // Purple
  agriculture: "oklch(0.65 0.20 90)", // Yellow-green
  other: "oklch(0.55 0.10 240)", // Gray-blue
};

const SECTOR_NAMES: Record<string, string> = {
  power: "Power Generation",
  transport: "Transportation",
  industry: "Industry",
  buildings: "Buildings",
  agriculture: "Agriculture",
  other: "Other",
};

export function SectoralBreakdownChart() {
  const { data: breakdown, isLoading } = trpc.sectors.breakdown.useQuery();
  const { data: indicators } = trpc.sectors.indicators.useQuery();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Sectoral Emissions Breakdown</CardTitle>
          <CardDescription>Current global emissions by sector (2024)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading sectoral data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Sectoral Emissions Breakdown</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = breakdown.map((sector) => ({
    name: SECTOR_NAMES[sector.sector] || sector.sector,
    sector: sector.sector,
    emissions: Number(sector.emissions.toFixed(2)),
    share: Number(sector.share.toFixed(1)),
  }));

  const totalEmissions = chartData.reduce((sum, s) => sum + s.emissions, 0);

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Sectoral Emissions Breakdown</CardTitle>
        <CardDescription>
          Current global emissions by sector • Total: {totalEmissions.toFixed(1)} Gt CO₂e (2024)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="emissions"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, share }) => `${name}: ${share}%`}
                  labelLine={{ stroke: "oklch(0.7 0.05 240)", strokeWidth: 1 }}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 240 / 0.95)",
                    border: "1px solid oklch(0.3 0.05 240)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0.02 240)",
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} Gt CO₂e`, "Emissions"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.05 240)" opacity={0.3} />
                <XAxis
                  type="number"
                  stroke="oklch(0.7 0.05 240)"
                  tick={{ fill: "oklch(0.7 0.05 240)" }}
                  label={{ value: "Emissions (Gt CO₂e)", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.7 0.05 240)"
                  tick={{ fill: "oklch(0.7 0.05 240)" }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 240 / 0.95)",
                    border: "1px solid oklch(0.3 0.05 240)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0.02 240)",
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} Gt CO₂e`, "Emissions"]}
                />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Indicators */}
        {indicators && (
          <div className="mt-8 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold mb-4">Sector-Specific Indicators (2024)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Power Sector</div>
                <div className="text-xl font-semibold text-green-400">{indicators.renewableShare.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Renewable electricity share</div>
              </div>
              
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Transport Sector</div>
                <div className="text-xl font-semibold text-blue-400">{indicators.evSalesShare.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">EV sales share</div>
              </div>
              
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Industry Sector</div>
                <div className="text-xl font-semibold text-orange-400">{indicators.electrificationRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Industrial electrification</div>
              </div>
              
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Buildings Sector</div>
                <div className="text-xl font-semibold text-purple-400">{indicators.heatPumpDeployment.toFixed(1)}M</div>
                <div className="text-xs text-muted-foreground">Annual heat pump installations</div>
              </div>
              
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Agriculture Sector</div>
                <div className="text-xl font-semibold text-yellow-400">{indicators.sustainablePractices.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Sustainable practices adoption</div>
              </div>
              
              <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">Power Sector</div>
                <div className="text-xl font-semibold text-red-400">{indicators.coalPhaseOutRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Annual coal phase-out rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
