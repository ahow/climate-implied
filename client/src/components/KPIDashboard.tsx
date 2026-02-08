import { TrendingDown, TrendingUp, Zap, DollarSign, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface KPIData {
  decarbonizationRate: number; // % per year
  renewableEnergyShare: number; // % of total energy
  carbonPricingCoverage: number; // % of emissions covered
  projectedWarming: number; // °C
}

interface KPIDashboardProps {
  data: KPIData;
  targets?: {
    decarbonizationRate?: number;
    renewableEnergyShare?: number;
    carbonPricingCoverage?: number;
    projectedWarming?: number;
  };
}

export function KPIDashboard({ data, targets }: KPIDashboardProps) {
  const metrics = [
    {
      label: "Decarbonization Rate",
      value: data.decarbonizationRate,
      unit: "% per year",
      icon: TrendingDown,
      target: targets?.decarbonizationRate || 7.6,
      description: "Annual rate of emissions reduction",
      color: "oklch(0.65 0.16 160)", // Green
      isPositive: data.decarbonizationRate > 0,
    },
    {
      label: "Renewable Energy Share",
      value: data.renewableEnergyShare,
      unit: "%",
      icon: Zap,
      target: targets?.renewableEnergyShare || 65,
      description: "Percentage of energy from renewables",
      color: "oklch(0.70 0.18 50)", // Orange
      isPositive: true,
    },
    {
      label: "Carbon Pricing Coverage",
      value: data.carbonPricingCoverage,
      unit: "%",
      icon: DollarSign,
      target: targets?.carbonPricingCoverage || 100,
      description: "Emissions covered by carbon pricing",
      color: "oklch(0.60 0.18 210)", // Cyan
      isPositive: true,
    },
    {
      label: "Projected Warming",
      value: data.projectedWarming,
      unit: "°C",
      icon: Thermometer,
      target: targets?.projectedWarming || 1.5,
      description: "Expected temperature increase by 2100",
      color: "oklch(0.55 0.20 25)", // Red
      isPositive: false,
    },
  ];

  const calculateProgress = (value: number, target: number, isPositive: boolean) => {
    if (isPositive) {
      return Math.min((value / target) * 100, 100);
    } else {
      // For negative metrics like warming, lower is better
      return Math.max(100 - ((value - target) / target) * 100, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking progress toward global climate targets
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const progress = calculateProgress(metric.value, metric.target, metric.isPositive);
          const isOnTrack = progress >= 70;

          return (
            <Card key={metric.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="metric-label">{metric.label}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="metric-value" style={{ color: metric.color }}>
                      {metric.value.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                </div>

                <div
                  className={`rounded-full p-2 ${
                    isOnTrack ? "bg-chart-2/20" : "bg-chart-4/20"
                  }`}
                >
                  {metric.isPositive ? (
                    <TrendingUp
                      className={`h-4 w-4 ${
                        isOnTrack ? "text-chart-2" : "text-chart-4"
                      }`}
                    />
                  ) : (
                    <TrendingDown
                      className={`h-4 w-4 ${
                        isOnTrack ? "text-chart-2" : "text-chart-4"
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to target</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {metric.value.toFixed(1)}</span>
                  <span>Target: {metric.target.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Target Alignment Summary</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground mb-2">On Track</div>
            <div className="text-2xl font-bold text-chart-2">
              {metrics.filter((m) => calculateProgress(m.value, m.target, m.isPositive) >= 70).length}
            </div>
            <div className="text-xs text-muted-foreground">of {metrics.length} indicators</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Needs Acceleration</div>
            <div className="text-2xl font-bold text-chart-4">
              {metrics.filter((m) => calculateProgress(m.value, m.target, m.isPositive) < 70).length}
            </div>
            <div className="text-xs text-muted-foreground">of {metrics.length} indicators</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
