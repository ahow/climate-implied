import { Building2, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CorporateCommitment {
  companyName: string;
  sector: string;
  hasSbtiTarget: number;
  sbtiTargetType?: string | null;
  ca100Assessment?: string | null;
  baselineEmissions: string | null;
  targetYear?: number | null;
  targetReduction?: string | null;
  currentProgress?: string | null;
}

interface CorporateCommitmentsTrackerProps {
  commitments: CorporateCommitment[];
  summary: {
    total: number;
    withSbtiTargets: number;
    bySector: Record<string, number>;
  };
}

export function CorporateCommitmentsTracker({
  commitments,
  summary,
}: CorporateCommitmentsTrackerProps) {
  const sectorData = Object.entries(summary.bySector).map(([sector, count]) => ({
    sector,
    count,
  }));

  const assessmentColors: Record<string, string> = {
    leading: "oklch(0.65 0.16 160)", // Green
    aligned: "oklch(0.60 0.18 210)", // Cyan
    aligning: "oklch(0.70 0.18 50)", // Orange
    "not aligned": "oklch(0.55 0.20 25)", // Red
  };

  const assessmentCounts = commitments.reduce((acc, c) => {
    const assessment = c.ca100Assessment || "unknown";
    acc[assessment] = (acc[assessment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Corporate Climate Commitments</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking corporate net-zero targets and transition progress
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Companies</div>
              <div className="text-2xl font-bold">{summary.total}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Major corporate emitters tracked
          </p>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-chart-2/20 p-3">
              <Target className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">SBTi Validated</div>
              <div className="text-2xl font-bold">{summary.withSbtiTargets}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={(summary.withSbtiTargets / summary.total) * 100}
              className="h-2 flex-1"
            />
            <span className="text-xs text-muted-foreground">
              {((summary.withSbtiTargets / summary.total) * 100).toFixed(0)}%
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-chart-3/20 p-3">
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
              <div className="text-2xl font-bold">
                {(
                  commitments.reduce((sum, c) => {
                    const progress = c.currentProgress ? parseFloat(c.currentProgress) : 0;
                    return sum + progress;
                  }, 0) / commitments.length
                ).toFixed(0)}
                %
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Toward reduction targets
          </p>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Commitments by Sector</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectorData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 250)" opacity={0.5} />
            <XAxis
              dataKey="sector"
              stroke="oklch(0.65 0.01 250)"
              style={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="oklch(0.65 0.01 250)" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0.02 250)",
                border: "1px solid oklch(0.28 0.02 250)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "oklch(0.95 0.01 250)" }}
            />
            <Bar dataKey="count" fill="oklch(0.60 0.18 210)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Climate Action 100+ Assessment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Climate Action 100+ Assessment</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(assessmentCounts).map(([assessment, count]) => {
            const color = assessmentColors[assessment] || "oklch(0.65 0.01 250)";
            const percentage = ((count / commitments.length) * 100).toFixed(0);

            return (
              <div key={assessment} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{assessment}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Progress
                  value={(count / commitments.length) * 100}
                  className="h-2"
                  style={{ "--progress-color": color } as any}
                />
                <div className="text-xs text-muted-foreground">{percentage}% of companies</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Companies by Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="space-y-4">
          {commitments
            .filter((c) => c.currentProgress !== undefined && c.currentProgress !== null)
            .sort((a, b) => {
              const aVal = a.currentProgress ? parseFloat(a.currentProgress) : 0;
              const bVal = b.currentProgress ? parseFloat(b.currentProgress) : 0;
              return bVal - aVal;
            })
            .slice(0, 5)
            .map((commitment) => {
              const currentProgress = commitment.currentProgress ? parseFloat(commitment.currentProgress) : 0;
              const targetReduction = commitment.targetReduction ? parseFloat(commitment.targetReduction) : 0;
              
              return (
                <div key={commitment.companyName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{commitment.companyName}</div>
                      <div className="text-xs text-muted-foreground">{commitment.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{currentProgress.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">
                        {targetReduction.toFixed(0)}% by {commitment.targetYear}
                      </div>
                    </div>
                  </div>
                  <Progress value={currentProgress} className="h-2" />
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
