import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { DataDrivenTemperatureChart } from "@/components/DataDrivenTemperatureChart";
import { ParameterControls, DEFAULT_PARAMETER_VALUES, type ParameterValues } from "@/components/ParameterControls";
import { HistoricalTrendChart } from "@/components/HistoricalTrendChart";
import { UnderlyingDataDisplay } from "@/components/UnderlyingDataDisplay";

import { Loader2, Globe, Calendar } from "lucide-react";

export default function Home() {

  const [selectedYear, setSelectedYear] = useState<number>(2024); // For time-travel feature
  const [parameters, setParameters] = useState<ParameterValues>(DEFAULT_PARAMETER_VALUES);
  const [metricView, setMetricView] = useState<'temperature' | 'reduction' | 'netZero'>('temperature');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technology' | 'policy' | 'corporate' | 'socioeconomic'>('all');
  const [regionalFilter, setRegionalFilter] = useState<'global' | 'china' | 'us' | 'eu' | 'india'>('global');




  
  // Fetch current indicators for underlying data display
  const { data: currentIndicators } = trpc.projection.indicators.useQuery();
  
  // Fetch category-specific projection if filter is active
  const { data: categoryProjection } = trpc.category.getProjection.useQuery(
    { category: categoryFilter as any },
    { enabled: categoryFilter !== 'all' }
  );
  
  // Fetch regional projection if filter is not global
  const { data: regionalProjection } = trpc.regional.getProjection.useQuery(
    { region: regionalFilter, year: selectedYear },
    { enabled: regionalFilter !== 'global' }
  );



  // Fetch historical trend data (recalculated with current model)
  const { data: historicalTrend, isLoading: historicalLoading } = trpc.historical.getRecalculatedTrend.useQuery();
  
  // Fetch current sector-specific projection (for 2024 data)
  const { data: sectorData, isLoading: sectorLoading } = trpc.projection.sectorSpecific.useQuery(
    undefined,
    { enabled: selectedYear === 2024 } // Only fetch if viewing current year
  );

  // Fetch full projection data for selected year (time-travel feature)
  const { data: historicalYearProjection } = trpc.historical.getProjectionForYear.useQuery(
    { year: selectedYear },
    { enabled: selectedYear !== 2024 } // Only fetch if not current year
  );
  
  // Use historical data if available, otherwise use current sector data
  // If category filter is active, use category projection for metric cards
  // If regional filter is active, use regional projection
  const displayData = regionalProjection || categoryProjection || historicalYearProjection || sectorData;

  // Get scenario colors
  const scenarioColors: Record<string, string> = {
    current_policies: "oklch(0.60 0.18 210)", // Cyan
    pledges: "oklch(0.65 0.16 160)", // Green
    optimistic: "oklch(0.70 0.18 50)", // Orange
    "1.5c": "oklch(0.55 0.20 25)", // Red
  };

  if (false) { // Removed loading check
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Global Decarbonization Tracker</h1>
              <p className="text-muted-foreground mt-1">
                Real-time monitoring of global emissions trajectories and climate action progress
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Global</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Metric View Toggle */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold">View Projections As:</h3>
                <p className="text-sm text-muted-foreground mt-1">Toggle between different metrics and filter by reduction factor category</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={metricView === 'temperature' ? 'default' : 'outline'}
                  onClick={() => setMetricView('temperature')}
                  size="sm"
                >
                  Temperature Rise
                </Button>
                <Button
                  variant={metricView === 'reduction' ? 'default' : 'outline'}
                  onClick={() => setMetricView('reduction')}
                  size="sm"
                >
                  Reduction Rate
                </Button>
                <Button
                  variant={metricView === 'netZero' ? 'default' : 'outline'}
                  onClick={() => setMetricView('netZero')}
                  size="sm"
                >
                  Net-Zero Year
                </Button>
              </div>
            </div>
            
            {/* Metric Summary Cards */}
            {displayData && (
              <div className="grid grid-cols-3 gap-4">
                <Card className={`p-4 border-2 transition-colors ${
                  metricView === 'temperature' ? 'border-primary' : 'border-border'
                }`}>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Temperature Rise by 2100</p>
                    <p className="text-2xl font-bold">
                      {displayData.temperatureRise.toFixed(2)}°C
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {displayData.temperatureRise >= 3.0 ? 'Severe climate impacts' : 
                       displayData.temperatureRise >= 2.0 ? 'High warming' : 'Moderate warming'}
                    </p>
                  </div>
                </Card>
                <Card className={`p-4 border-2 transition-colors ${
                  metricView === 'reduction' ? 'border-primary' : 'border-border'
                }`}>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Emissions Reduction Rate ({selectedYear}-{selectedYear + 10})</p>
                    <p className="text-2xl font-bold">
                      {displayData.reductionRate.toFixed(2)}% per year
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {displayData.reductionRate >= 5.0 ? 'Strong action' : 
                       displayData.reductionRate >= 2.0 ? 'Moderate action' : 'Insufficient action'}
                    </p>
                  </div>
                </Card>
                <Card className={`p-4 border-2 transition-colors ${
                  metricView === 'netZero' ? 'border-primary' : 'border-border'
                }`}>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Net-Zero Year (≤5 Gt)</p>
                    <p className="text-2xl font-bold">
                      {displayData.netZeroYear ? Math.round(displayData.netZeroYear) : 'Never'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {displayData.netZeroYear && displayData.netZeroYear <= 2050 ? 'Ambitious target' : 
                       displayData.netZeroYear && displayData.netZeroYear <= 2100 ? 'Delayed action' : 'Insufficient near-term action'}
                    </p>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Category Filter */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-semibold">Filter by Reduction Factor:</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">See the impact of each category in isolation</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('all')}
                    size="sm"
                  >
                    All Combined
                  </Button>
                  <Button
                    variant={categoryFilter === 'technology' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('technology')}
                    size="sm"
                  >
                    Technology
                  </Button>
                  <Button
                    variant={categoryFilter === 'policy' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('policy')}
                    size="sm"
                  >
                    Policy
                  </Button>
                  <Button
                    variant={categoryFilter === 'corporate' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('corporate')}
                    size="sm"
                  >
                    Corporate
                  </Button>
                  <Button
                    variant={categoryFilter === 'socioeconomic' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('socioeconomic')}
                    size="sm"
                  >
                    Socioeconomic
                  </Button>
                </div>
              </div>
              
              {categoryFilter !== 'all' && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Isolated View:</strong> Showing projection if only <strong>{categoryFilter}</strong> factors improved while all others remained at baseline.
                    This helps understand the relative contribution of each reduction factor category.
                  </p>
                </div>
              )}
            </div>
            
            {/* Regional Filter */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-semibold">Filter by Region:</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Compare regional decarbonization trajectories</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={regionalFilter === 'global' ? 'default' : 'outline'}
                    onClick={() => setRegionalFilter('global')}
                    size="sm"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Global
                  </Button>
                  <Button
                    variant={regionalFilter === 'china' ? 'default' : 'outline'}
                    onClick={() => setRegionalFilter('china')}
                    size="sm"
                  >
                    China
                  </Button>
                  <Button
                    variant={regionalFilter === 'us' ? 'default' : 'outline'}
                    onClick={() => setRegionalFilter('us')}
                    size="sm"
                  >
                    United States
                  </Button>
                  <Button
                    variant={regionalFilter === 'eu' ? 'default' : 'outline'}
                    onClick={() => setRegionalFilter('eu')}
                    size="sm"
                  >
                    European Union
                  </Button>
                  <Button
                    variant={regionalFilter === 'india' ? 'default' : 'outline'}
                    onClick={() => setRegionalFilter('india')}
                    size="sm"
                  >
                    India
                  </Button>
                </div>
              </div>
              
              {regionalFilter !== 'global' && regionalProjection && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Regional View:</strong> Showing projection for <strong>{regionalProjection.regionName}</strong> ({regionalProjection.emissionsShare?.toFixed(1)}% of global emissions).
                    Regional temperature rise reflects global impact if all regions followed this region's trajectory.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* PRIMARY: Temperature Rise Probability Distribution */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {metricView === 'temperature' && 'Expected Long-Run Temperature Rise'}
                {metricView === 'reduction' && 'Emissions Reduction Rate Trajectory'}
                {metricView === 'netZero' && 'Path to Net-Zero Emissions'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {metricView === 'temperature' && 'Probability distribution showing likelihood of different warming outcomes based on current policies, pledges, and climate action scenarios'}
                {metricView === 'reduction' && 'Projected annual emissions reduction rates showing pace of decarbonization over the next decade'}
                {metricView === 'netZero' && 'Timeline showing when global emissions are projected to reach net-zero (≤5 Gt CO2e)'}
              </p>
            </div>
            {/* Time-Travel Feature */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2015">2015 Analysis</SelectItem>
                  <SelectItem value="2016">2016 Analysis</SelectItem>
                  <SelectItem value="2017">2017 Analysis</SelectItem>
                  <SelectItem value="2018">2018 Analysis</SelectItem>
                  <SelectItem value="2019">2019 Analysis</SelectItem>
                  <SelectItem value="2020">2020 Analysis</SelectItem>
                  <SelectItem value="2021">2021 Analysis</SelectItem>
                  <SelectItem value="2022">2022 Analysis</SelectItem>
                  <SelectItem value="2023">2023 Analysis</SelectItem>
                  <SelectItem value="2024">2024 Analysis (Current)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Parameter Controls */}
          <ParameterControls
            values={parameters}
            onChange={setParameters}
            onReset={() => setParameters(DEFAULT_PARAMETER_VALUES)}
          />

          {/* Data-Driven Temperature Projection */}
          <DataDrivenTemperatureChart
            metricView={metricView}
            categoryFilter={categoryFilter}
            categoryProjection={categoryProjection}
            regionalFilter={regionalFilter}
            regionalProjection={regionalProjection}
            selectedYear={selectedYear}
            historicalYearProjection={historicalYearProjection}
            customParams={{
              climateSensitivity: parameters.climateSensitivity,
              policyEffectiveness: parameters.policyImplementationRate,
              renewableAcceleration: parameters.technologyAdoptionSpeed,
              economicGrowth: parameters.economicGrowthRate,
            }}
          />
        </div>

        {/* Historical Trend Analysis */}
        {historicalTrend && historicalTrend.length > 0 && categoryFilter === 'all' && (
          <HistoricalTrendChart
            data={historicalTrend}
            metricView={metricView}
            height={500}
          />
        )}
        
        {/* Message when category filter is active */}
        {categoryFilter !== 'all' && (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Historical trend evolution is only available for "All Combined" view.
              </p>
              <p className="text-xs text-muted-foreground">
                Select "All Combined" to see how temperature projections have evolved from 2015-2024.
              </p>
            </div>
          </Card>
        )}




        {/* Underlying Data Display */}
        {currentIndicators && (
          <UnderlyingDataDisplay data={currentIndicators} />
        )}


      </main>
    </div>
  );
}
