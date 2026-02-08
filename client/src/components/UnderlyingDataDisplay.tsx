/**
 * Underlying Data Display Component
 * 
 * Shows the current real-world indicator values that feed into the projection model.
 * Provides transparency about the data sources and assumptions behind the analysis.
 */
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Database } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkline } from "./Sparkline";

interface IndicatorData {
  // Renewable Energy
  renewableCapacityGW: number;
  renewableGrowthRate: number;
  renewableAcceleration: number;
  
  // Electric Vehicles
  evSalesShare: number;
  evGrowthRate: number;
  
  // Policy Momentum
  policyCoveragePercent: number;
  policyImplementationRate: number;
  netZeroTargetsCoverage: number;
  
  // Economic & Emissions
  globalGDP: number;
  carbonIntensity: number;
  carbonIntensityDeclineRate: number;
  
  // Corporate Action
  sbtiCompaniesPercent: number;
  corporateImplementationRate: number;
}

interface Props {
  data: IndicatorData;
}

export function UnderlyingDataDisplay({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch historical indicator data for sparklines
  const { data: historicalData } = trpc.historical.getIndicatorTimeseries.useQuery();
  
  // Transform historical data into sparkline format
  const getSparklineData = (field: string) => {
    if (!historicalData) return [];
    
    const fieldMap: Record<string, string> = {
      renewableCapacity: 'renewableCapacityGW',
      renewableGrowth: 'renewableGrowthRate',
      evShare: 'evSalesSharePct',
      evGrowth: 'evGrowthRate',
      policyPricing: 'policyCoveragePct',
      policyImplementation: 'policyImplementationRate',
      gdp: 'gdpTrillionUSD',
      carbonIntensity: 'carbonIntensityKgPerGDP',
      corporateTargets: 'corporateTargetsPct',
      corporateImplementation: 'corporateImplementationRate',
      climateConcern: 'climateConcernPct',
      policySupport: 'policySupportPct',
      sacrificeWillingness: 'sacrificeWillingnessPct',
      humanCausation: 'humanCausationPct',
    };
    
    const dataField = fieldMap[field];
    if (!dataField) return [];
    
    return historicalData.map((d: any) => ({
      year: d.year,
      value: d[dataField],
    }));
  };
  
  const indicatorGroups = [
    {
      title: "Renewable Energy",
      icon: "⚡",
      indicators: [
        { label: "Global Capacity", value: `${data.renewableCapacityGW.toFixed(0)} GW`, source: "IRENA 2024", sparklineKey: "renewableCapacity" },
        { label: "Annual Growth Rate", value: `${data.renewableGrowthRate.toFixed(1)}%`, source: "IEA", sparklineKey: "renewableGrowth" },
        { label: "Acceleration Factor", value: data.renewableAcceleration.toFixed(2), source: "Calculated" },
      ],
    },
    {
      title: "Electric Vehicles",
      icon: "🚗",
      indicators: [
        { label: "Global Sales Share", value: `${data.evSalesShare.toFixed(1)}%`, source: "IEA EV Outlook 2024", sparklineKey: "evShare" },
        { label: "Annual Growth Rate", value: `${data.evGrowthRate.toFixed(1)}%`, source: "BloombergNEF", sparklineKey: "evGrowth" },
      ],
    },
    {
      title: "Policy Momentum",
      icon: "📋",
      indicators: [
        { label: "Carbon Pricing Coverage", value: `${data.policyCoveragePercent.toFixed(1)}%`, source: "World Bank", sparklineKey: "policyPricing" },
        { label: "Implementation Rate", value: `${data.policyImplementationRate.toFixed(0)}%`, source: "Climate Action Tracker", sparklineKey: "policyImplementation" },
        { label: "Net-Zero Targets Coverage", value: `${data.netZeroTargetsCoverage.toFixed(1)}%`, source: "ECIU Net Zero Tracker" },
      ],
    },
    {
      title: "Economic & Emissions",
      icon: "💰",
      indicators: [
        { label: "Global GDP", value: `$${(data.globalGDP / 1000).toFixed(1)}T`, source: "World Bank 2024", sparklineKey: "gdp" },
        { label: "Carbon Intensity", value: `${data.carbonIntensity.toFixed(2)} Gt/$T`, source: "Global Carbon Project", sparklineKey: "carbonIntensity" },
        { label: "Decline Rate", value: `${data.carbonIntensityDeclineRate.toFixed(1)}%/year`, source: "Calculated" },
      ],
    },
    {
      title: "Corporate Action",
      icon: "🏢",
      indicators: [
        { label: "SBTi Companies", value: `${data.sbtiCompaniesPercent.toFixed(1)}%`, source: "Science Based Targets", sparklineKey: "corporateTargets" },
        { label: "Implementation Rate", value: `${data.corporateImplementationRate.toFixed(0)}%`, source: "CDP Climate Change 2024", sparklineKey: "corporateImplementation" },
      ],
    },
    {
      title: "Socioeconomic & Public Opinion",
      icon: "🗳️",
      indicators: [
        { label: "Climate Concern", value: "42%", source: "Gallup 2024", sparklineKey: "climateConcern" },
        { label: "Policy Support", value: "84%", source: "Pew 2024", sparklineKey: "policySupport" },
        { label: "Sacrifice Willingness", value: "75%", source: "Pew 2024", sparklineKey: "sacrificeWillingness" },
        { label: "Human Causation Belief", value: "64%", source: "Gallup 2024", sparklineKey: "humanCausation" },
      ],
    },
  ];
  
  return (
    <Card className="p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" />
          <div className="text-left">
            <h3 className="text-lg font-semibold">Underlying Data & Indicators</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Current real-world values feeding the projection model
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {indicatorGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{group.icon}</span>
                <h4 className="font-semibold">{group.title}</h4>
              </div>
              <div className="space-y-2">
                {group.indicators.map((indicator: any) => (
                  <div key={indicator.label} className="space-y-1">
                    <div className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{indicator.label}</div>
                        <div className="text-xs text-muted-foreground">{indicator.source}</div>
                      </div>
                      <div className="font-mono font-semibold text-primary">{indicator.value}</div>
                    </div>
                    {indicator.sparklineKey && (
                      <div className="w-full h-8">
                        <Sparkline 
                          data={getSparklineData(indicator.sparklineKey)} 
                          color="#06b6d4"
                          height={32}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Data Currency:</strong> All indicators reflect the most recent available data as of 2024.
            The model updates these values annually to maintain projection accuracy.
            Sources include IEA, IRENA, World Bank, Global Carbon Project, and other authoritative climate data providers.
          </p>
        </div>
      )}
    </Card>
  );
}
