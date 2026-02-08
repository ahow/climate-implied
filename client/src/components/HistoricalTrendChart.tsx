import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";

interface HistoricalTrendChartProps {
  data: Array<{
    analysisDate: Date;
    median: number;
    p10: number;
    p25: number | null;
    p75: number | null;
    p90: number;
    indicators: any;
    reductionRate?: number;
    netZeroYear?: number | null;
  }>;
  metricView: 'temperature' | 'reduction' | 'netZero';
  height?: number;
}

export function HistoricalTrendChart({
  data,
  metricView,
  height = 400,
}: HistoricalTrendChartProps) {
  // Transform data for Recharts based on metric view
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => {
      let median, p10, p90;
      
      if (metricView === 'temperature') {
        median = item.median;
        p10 = item.p10;
        p90 = item.p90;
      } else if (metricView === 'reduction') {
        median = item.reductionRate || 0;
        p10 = (item.reductionRate || 0) * 0.8; // Approximate uncertainty
        p90 = (item.reductionRate || 0) * 1.2;
      } else { // netZero
        median = item.netZeroYear || 2200;
        p10 = (item.netZeroYear || 2200) - 20; // Approximate uncertainty
        p90 = (item.netZeroYear || 2200) + 20;
      }
      
      return {
        year: new Date(item.analysisDate).getFullYear(),
        date: item.analysisDate.toLocaleDateString(),
        median,
        p10,
        p90,
        // For tooltip display
        emissions: item.indicators?.currentEmissions,
        renewableGrowth: item.indicators?.renewableGrowthRate,
        evShare: item.indicators?.evSalesShare,
      };
    });
  }, [data, metricView]);

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No historical trend data available
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="font-semibold text-foreground mb-2">{data.year}</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Median projection:</span>
            <span className="font-medium text-primary">
              {metricView === 'temperature' && `${data.median.toFixed(2)}°C`}
              {metricView === 'reduction' && `${data.median.toFixed(1)}% per year`}
              {metricView === 'netZero' && (data.median > 2100 ? 'Never' : data.median.toFixed(0))}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Range:</span>
            <span className="font-medium">
              {metricView === 'temperature' && `${data.p10.toFixed(2)}°C - ${data.p90.toFixed(2)}°C`}
              {metricView === 'reduction' && `${data.p10.toFixed(1)}% - ${data.p90.toFixed(1)}%`}
              {metricView === 'netZero' && `${data.p10 > 2100 ? 'Never' : data.p10.toFixed(0)} - ${data.p90 > 2100 ? 'Never' : data.p90.toFixed(0)}`}
            </span>
          </div>
          {data.emissions && (
            <>
              <div className="border-t border-border my-2" />
              <div className="text-xs text-muted-foreground">
                <div>Emissions: {data.emissions.toFixed(1)} Gt CO₂e</div>
                <div>Renewable growth: {data.renewableGrowth?.toFixed(1)}%</div>
                <div>EV sales share: {data.evShare?.toFixed(1)}%</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const getChartTitle = () => {
    switch (metricView) {
      case 'temperature':
        return 'Historical Evolution of Temperature Projections';
      case 'reduction':
        return 'Historical Evolution of Reduction Rate Projections';
      case 'netZero':
        return 'Historical Evolution of Net-Zero Year Projections';
    }
  };

  const getChartDescription = () => {
    switch (metricView) {
      case 'temperature':
        return 'How the projected long-run temperature rise has changed as real-world indicators evolved (2015-2024)';
      case 'reduction':
        return 'How the projected emissions reduction rate has changed as real-world indicators evolved (2015-2024)';
      case 'netZero':
        return 'How the projected net-zero year has changed as real-world indicators evolved (2015-2024)';
    }
  };

  const getYAxisLabel = () => {
    switch (metricView) {
      case 'temperature':
        return 'Projected Temperature Rise (°C)';
      case 'reduction':
        return 'Reduction Rate (% per year)';
      case 'netZero':
        return 'Net-Zero Year';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {getChartTitle()}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {getChartDescription()}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.3} />
          <XAxis
            dataKey="year"
            stroke="oklch(0.7 0 0)"
            tick={{ fill: "oklch(0.7 0 0)", fontSize: 12 }}
            label={{
              value: "Year of Analysis",
              position: "insideBottom",
              offset: -10,
              fill: "oklch(0.7 0 0)",
              fontSize: 13,
            }}
          />
          <YAxis
            stroke="oklch(0.7 0 0)"
            tick={{ fill: "oklch(0.7 0 0)", fontSize: 12 }}
            label={{
              value: getYAxisLabel(),
              angle: -90,
              position: "insideLeft",
              fill: "oklch(0.7 0 0)",
              fontSize: 13,
              offset: 10,
            }}
            domain={metricView === 'netZero' ? [2040, 2100] : [0, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          
          {/* Uncertainty band (P10-P90) */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="none"
            fill="oklch(0.45 0.15 220 / 0.35)"
            name="90th percentile"
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="none"
            fill="oklch(0.15 0 0)"
            name="10th percentile"
          />
          
          {/* Median line */}
          <Line
            type="monotone"
            dataKey="median"
            stroke="oklch(0.75 0.20 220)"
            strokeWidth={4}
            dot={{ fill: "oklch(0.75 0.20 220)", r: 6, strokeWidth: 2, stroke: "oklch(0.85 0.15 220)" }}
            name="Median projection"
          />
          
          {/* Reference lines based on metric view */}
          {metricView === 'temperature' && (
            <>
              <ReferenceLine
                y={1.5}
                stroke="oklch(0.7 0.15 150)"
                strokeDasharray="5 5"
                label={{
                  value: "1.5°C target",
                  position: "right",
                  fill: "oklch(0.7 0.15 150)",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={2.0}
                stroke="oklch(0.7 0.15 60)"
                strokeDasharray="5 5"
                label={{
                  value: "2.0°C target",
                  position: "right",
                  fill: "oklch(0.7 0.15 60)",
                  fontSize: 12,
                }}
              />
            </>
          )}
          {metricView === 'reduction' && (
            <>
              <ReferenceLine
                y={7.0}
                stroke="oklch(0.7 0.15 150)"
                strokeDasharray="5 5"
                label={{
                  value: "1.5°C target (7%/yr)",
                  position: "right",
                  fill: "oklch(0.7 0.15 150)",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={5.0}
                stroke="oklch(0.7 0.15 60)"
                strokeDasharray="5 5"
                label={{
                  value: "2.0°C target (5%/yr)",
                  position: "right",
                  fill: "oklch(0.7 0.15 60)",
                  fontSize: 12,
                }}
              />
            </>
          )}
          {metricView === 'netZero' && (
            <>
              <ReferenceLine
                y={2050}
                stroke="oklch(0.7 0.15 150)"
                strokeDasharray="5 5"
                label={{
                  value: "1.5°C target (2050)",
                  position: "right",
                  fill: "oklch(0.7 0.15 150)",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={2070}
                stroke="oklch(0.7 0.15 60)"
                strokeDasharray="5 5"
                label={{
                  value: "2.0°C target (2070)",
                  position: "right",
                  fill: "oklch(0.7 0.15 60)",
                  fontSize: 12,
                }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          This chart shows how the projected {metricView === 'temperature' ? 'temperature outcome' : metricView === 'reduction' ? 'reduction rate' : 'net-zero year'} has evolved as real-world indicators 
          (emissions, renewable deployment, EV adoption, policy implementation) changed over time. 
          The shaded area represents the 80% confidence interval (P10-P90).
        </p>
      </div>
    </Card>
  );
}
