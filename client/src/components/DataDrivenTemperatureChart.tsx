import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Area, AreaChart, CartesianGrid, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategoryProjectionResult {
  category: string;
  categoryName: string;
  temperatureRise: number;
  reductionRate: number;
  netZeroYear: number | null;
  trajectory: Array<{
    year: number;
    emissions: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    cumulativeEmissions: number;
  }>;
  temperatureDistribution: Array<{ temperature: number; probability: number; cumulativeProbability?: number }>;
}

interface DataDrivenTemperatureChartProps {
  metricView: 'temperature' | 'reduction' | 'netZero';
  categoryFilter?: 'all' | 'technology' | 'policy' | 'corporate' | 'socioeconomic';
  categoryProjection?: CategoryProjectionResult;
  regionalFilter?: 'global' | 'china' | 'us' | 'eu' | 'india';
  regionalProjection?: any; // Regional projection data
  selectedYear?: number;
  historicalYearProjection?: {
    temperatureRise: number;
    reductionRate: number;
    netZeroYear: number | null;
    trajectory: Array<{
      year: number;
      emissions: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      cumulativeEmissions: number;
    }>;
    temperatureDistribution: Array<{ temperature: number; probability: number; cumulativeProbability?: number }>;
    indicators: any;
  } | null;
  customParams?: {
    climateSensitivity?: number;
    renewableAcceleration?: number;
    policyEffectiveness?: number;
    economicGrowth?: number;
  };
}

export function DataDrivenTemperatureChart({ metricView, categoryFilter = 'all', categoryProjection, regionalFilter = 'global', regionalProjection, selectedYear, historicalYearProjection, customParams }: DataDrivenTemperatureChartProps) {
  // Use sector-specific projection with validated weights (unless category filter is active or historical year selected)
  const { data: sectorData, isLoading } = trpc.projection.sectorSpecific.useQuery(
    undefined,
    { enabled: selectedYear === 2024 } // Only fetch current data if viewing 2024
  );
  
  // Priority: regionalProjection > historicalYearProjection > categoryProjection > sectorData
  const data = regionalProjection ? regionalProjection : (
    historicalYearProjection ? historicalYearProjection : (
      categoryFilter !== 'all' && categoryProjection ? {
        temperatureRise: categoryProjection.temperatureRise,
        reductionRate: categoryProjection.reductionRate,
        netZeroYear: categoryProjection.netZeroYear,
        trajectory: categoryProjection.trajectory,
        temperatureDistribution: categoryProjection.temperatureDistribution,
        indicators: sectorData?.indicators, // Use sector indicators as fallback
      } : sectorData
    )
  );

  // Only show loading if we're fetching current year data AND no other data source is available
  const shouldShowLoading = isLoading && !regionalProjection && !historicalYearProjection && !categoryProjection;
  
  if (shouldShowLoading) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">
            {metricView === 'temperature' && 'Most Likely Temperature Rise'}
            {metricView === 'reduction' && 'Emissions Reduction Rate'}
            {metricView === 'netZero' && 'Path to Net-Zero Emissions'}
          </CardTitle>
          <CardDescription>Based on current trends and observable indicators (relative to pre-industrial 1850-1900 baseline)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-400/30 border-b-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-cyan-400 mb-1">Updating Projection</div>
              <div className="text-sm text-muted-foreground">Running Monte Carlo simulation (10,000 iterations)...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Data Unavailable</CardTitle>
          <CardDescription>No projection data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { temperatureDistribution, indicators, trajectory } = data;

  // Calculate metrics from trajectory
  const emissions2024 = trajectory.find((p: any) => p.year === 2024)?.emissions || 60;
  const emissions2034 = trajectory.find((p: any) => p.year === 2034)?.emissions || 55;
  const reductionRate = ((emissions2024 - emissions2034) / emissions2024) * 10; // Annual rate over 10 years
  
  // Calculate net-zero year (extrapolate if needed)
  let netZeroYear: number | null = trajectory.find((p: any) => p.emissions <= 5.0)?.year || null;
  
  if (!netZeroYear && trajectory.length > 0) {
    // Extrapolate beyond 2100
    const finalEmissions = trajectory[trajectory.length - 1].emissions;
    const firstEmissions = trajectory[0].emissions;
    const yearsElapsed = trajectory[trajectory.length - 1].year - trajectory[0].year;
    const avgAnnualReduction = (firstEmissions - finalEmissions) / yearsElapsed;
    
    if (avgAnnualReduction > 0 && finalEmissions > 5.0) {
      const yearsToNetZero = (finalEmissions - 5.0) / avgAnnualReduction;
      netZeroYear = Math.round(trajectory[trajectory.length - 1].year + yearsToNetZero);
    }
  }

  // Extract temperature statistics from cumulative distribution
  // Find the temperature where cumulative probability crosses the target percentile
  const findPercentile = (target: number) => {
    const sorted = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
    for (let i = 0; i < sorted.length; i++) {
      if ((sorted[i].cumulativeProbability || 0) >= target) {
        return sorted[i].temperature;
      }
    }
    return sorted[sorted.length - 1]?.temperature || 2.7;
  };
  
  const median = findPercentile(0.5);
  const p10 = findPercentile(0.1);
  const p90 = findPercentile(0.9);

  // Render based on metric view
  if (metricView === 'temperature') {
    // Prepare chart data for probability density function
    const chartData = temperatureDistribution.map((point: any) => ({
      temperature: point.temperature,
      probability: point.probability * 100,
      cumulativeProbability: (point.cumulativeProbability || 0) * 100,
    }));

    const peakPoint = temperatureDistribution.reduce((max: any, point: any) => 
      point.probability > max.probability ? point : max
    );

    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Most Likely Temperature Rise by 2100</CardTitle>
          <CardDescription>
            Data-driven projection based on current renewable deployment, EV adoption, policy momentum, and carbon intensity trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Median (50th percentile)</div>
              <div className="text-2xl font-bold text-foreground">
                {median.toFixed(2)}°C
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Most Likely (mode)</div>
              <div className="text-2xl font-bold text-foreground">
                {peakPoint.temperature.toFixed(2)}°C
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">10th percentile (optimistic)</div>
              <div className="text-2xl font-bold text-emerald-400">
                {p10.toFixed(2)}°C
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">90th percentile (pessimistic)</div>
              <div className="text-2xl font-bold text-red-400">
                {p90.toFixed(2)}°C
              </div>
            </div>
          </div>

          {/* Probability Distribution Chart */}
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="uncertaintyBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                <XAxis
                  dataKey="temperature"
                  type="number"
                  domain={[1.0, 5.0]}
                  label={{
                    value: "Temperature Rise Above Pre-Industrial (°C)",
                    position: "insideBottom",
                    offset: -10,
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <YAxis
                  label={{
                    value: "Probability Density (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.2 0 0 / 0.95)",
                    border: "1px solid oklch(0.3 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.9 0 0)",
                  }}
                  labelFormatter={(value) => `${value}°C`}
                  formatter={(value: number, name: string) => {
                    if (name === "probability") {
                      return [`${value.toFixed(2)}%`, "Probability"];
                    }
                    return [value, name];
                  }}
                />
                {/* P10-P90 Uncertainty Band */}
                <ReferenceArea
                  x1={p10}
                  x2={p90}
                  fill="url(#uncertaintyBand)"
                  fillOpacity={0.3}
                />
                {/* P10 Line */}
                <ReferenceLine
                  x={p10}
                  stroke="oklch(0.7 0.15 140)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `P10: ${p10.toFixed(2)}°C`,
                    position: "insideBottomLeft",
                    fill: "oklch(0.7 0.15 140)",
                    fontSize: 11,
                    offset: 10,
                  }}
                />
                {/* P90 Line */}
                <ReferenceLine
                  x={p90}
                  stroke="oklch(0.7 0.15 20)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `P90: ${p90.toFixed(2)}°C`,
                    position: "insideBottomRight",
                    fill: "oklch(0.7 0.15 20)",
                    fontSize: 11,
                    offset: 10,
                  }}
                />
                {/* Median Line */}
                <ReferenceLine
                  x={median}
                  stroke="oklch(0.7 0.15 250)"
                  strokeWidth={3}
                  label={{
                    value: `Median: ${median.toFixed(2)}°C`,
                    position: "top",
                    fill: "oklch(0.7 0.15 250)",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="oklch(0.7 0.15 250)"
                  strokeWidth={2}
                  fill="url(#probabilityGradient)"
                  name="Probability Density"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
            <h4 className="font-semibold text-foreground">Interpretation</h4>
            <p className="text-sm text-muted-foreground">
              Based on validated model weights and current observable trends, the median projected warming by 2100 is{" "}
              <span className="font-semibold text-foreground">{median.toFixed(2)}°C</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              There is an 80% probability that warming will fall between{" "}
              <span className="font-semibold text-emerald-400">{p10.toFixed(2)}°C</span> and{" "}
              <span className="font-semibold text-red-400">{p90.toFixed(2)}°C</span>, reflecting
              uncertainty in future policy effectiveness, technology adoption rates, and climate sensitivity.
            </p>
          </div>


        </CardContent>
      </Card>
    );
  }

  if (metricView === 'reduction') {
    // Prepare chart data for reduction rate trajectory
    const chartData = trajectory
      .filter((p: any) => p.year >= 2024 && p.year <= 2050)
      .map((point: any, idx: number, arr: any[]) => {
        if (idx === 0) return null;
        const prevPoint = arr[idx - 1];
        const yearlyRate = ((prevPoint.emissions - point.emissions) / prevPoint.emissions) * 100;
        return {
          year: point.year,
          reductionRate: yearlyRate,
          p10Rate: ((prevPoint.p10 - point.p10) / prevPoint.p10) * 100,
          p90Rate: ((prevPoint.p90 - point.p90) / prevPoint.p90) * 100,
        };
      })
      .filter(Boolean);

    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Emissions Reduction Rate Trajectory</CardTitle>
          <CardDescription>
            Annual emissions reduction rates showing pace of decarbonization over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Current Rate (2024-2034)</div>
              <div className="text-2xl font-bold text-foreground">
                {reductionRate.toFixed(1)}% per year
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Required for 1.5°C</div>
              <div className="text-2xl font-bold text-emerald-400">
                7.0% per year
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Required for 2.0°C</div>
              <div className="text-2xl font-bold text-yellow-400">
                5.0% per year
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Gap to 2°C Target</div>
              <div className="text-2xl font-bold text-red-400">
                {(5.0 - reductionRate).toFixed(1)}% shortfall
              </div>
            </div>
          </div>

          {/* Reduction Rate Chart */}
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="reductionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -10,
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <YAxis
                  label={{
                    value: "Annual Reduction Rate (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.2 0 0 / 0.95)",
                    border: "1px solid oklch(0.3 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.9 0 0)",
                  }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Area
                  type="monotone"
                  dataKey="reductionRate"
                  stroke="oklch(0.7 0.15 180)"
                  strokeWidth={2}
                  fill="url(#reductionGradient)"
                  name="Reduction Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
            <h4 className="font-semibold text-foreground">Interpretation</h4>
            <p className="text-sm text-muted-foreground">
              Current trajectory shows emissions declining at <span className="font-semibold text-foreground">{reductionRate.toFixed(1)}% per year</span> over the next decade.
              This is significantly below the <span className="font-semibold text-yellow-400">5.0% per year</span> needed for the 2°C Paris Agreement target
              and the <span className="font-semibold text-emerald-400">7.0% per year</span> needed for the 1.5°C goal.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metricView === 'netZero') {
    // Prepare chart data for net-zero trajectory
    const chartData = trajectory
      .filter((p: any) => p.year >= 2024 && p.year <= 2100)
      .map((point: any) => ({
        year: point.year,
        emissions: point.emissions,
        p10: point.p10,
        p90: point.p90,
      }));

    return (
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Path to Net-Zero Emissions</CardTitle>
          <CardDescription>
            Timeline showing when global emissions are projected to reach net-zero (≤5 Gt CO2e)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Net-Zero Year</div>
              <div className="text-2xl font-bold text-foreground">
                {netZeroYear ? netZeroYear : 'Never'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">1.5°C Target</div>
              <div className="text-2xl font-bold text-emerald-400">
                2050
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">2°C Target</div>
              <div className="text-2xl font-bold text-yellow-400">
                2070
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Emissions 2100</div>
              <div className="text-2xl font-bold text-red-400">
                {trajectory[trajectory.length - 1].emissions.toFixed(1)} Gt
              </div>
            </div>
          </div>

          {/* Net-Zero Trajectory Chart */}
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 30)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 30)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -10,
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <YAxis
                  label={{
                    value: "Global Emissions (Gt CO2e)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "oklch(0.7 0 0)", fontSize: 14 },
                  }}
                  tick={{ fill: "oklch(0.7 0 0)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.2 0 0 / 0.95)",
                    border: "1px solid oklch(0.3 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.9 0 0)",
                  }}
                  formatter={(value: number) => `${value.toFixed(1)} Gt`}
                />
                <Area
                  type="monotone"
                  dataKey="emissions"
                  stroke="oklch(0.7 0.15 30)"
                  strokeWidth={2}
                  fill="url(#emissionsGradient)"
                  name="Emissions"
                />
                {/* Net-zero threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => 5.0}
                  stroke="oklch(0.8 0.15 150)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Net-Zero Threshold (5 Gt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
            <h4 className="font-semibold text-foreground">Interpretation</h4>
            <p className="text-sm text-muted-foreground">
              {netZeroYear ? (
                <>
                  Current trajectory projects net-zero emissions (≤5 Gt) will be reached in{" "}
                  <span className="font-semibold text-foreground">{netZeroYear}</span>.
                  This is {netZeroYear > 2050 ? 'significantly later' : 'earlier'} than the 2050 target needed for 1.5°C.
                </>
              ) : (
                <>
                  Current trajectory shows emissions <span className="font-semibold text-red-400">never reaching net-zero</span> by 2100.
                  Emissions remain at <span className="font-semibold text-foreground">{trajectory[trajectory.length - 1].emissions.toFixed(1)} Gt</span> by century's end,
                  well above the 5 Gt threshold.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
