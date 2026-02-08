import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, RotateCcw } from "lucide-react";

export interface ParameterValues {
  climateSensitivity: number; // °C per doubling of CO2
  policyImplementationRate: number; // 0-1 scale
  technologyAdoptionSpeed: number; // multiplier
  economicGrowthRate: number; // % per year
}

interface ParameterControlsProps {
  values: ParameterValues;
  onChange: (values: ParameterValues) => void;
  onReset: () => void;
}

const DEFAULT_VALUES: ParameterValues = {
  climateSensitivity: 3.0,
  policyImplementationRate: 0.9,
  technologyAdoptionSpeed: 1.0,
  economicGrowthRate: 2.5,
};

export function ParameterControls({
  values,
  onChange,
  onReset,
}: ParameterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof ParameterValues, value: number) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const isModified = JSON.stringify(values) !== JSON.stringify(DEFAULT_VALUES);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Model Parameters</h3>
          <p className="text-sm text-muted-foreground">
            Adjust key assumptions to see how temperature projections change
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 pt-4">
          {/* Climate Sensitivity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="climate-sensitivity">
                  Climate Sensitivity (ECS)
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Equilibrium Climate Sensitivity: How much global
                      temperature rises when atmospheric CO₂ doubles. IPCC AR6
                      likely range: 2.5-4.0°C, with best estimate of 3.0°C.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">
                {values.climateSensitivity.toFixed(1)}°C
              </span>
            </div>
            <Slider
              id="climate-sensitivity"
              min={1.5}
              max={4.5}
              step={0.1}
              value={[values.climateSensitivity]}
              onValueChange={([value]) =>
                handleChange("climateSensitivity", value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.5°C (Low)</span>
              <span>3.0°C (Best estimate)</span>
              <span>4.5°C (High)</span>
            </div>
          </div>

          {/* Policy Implementation Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="policy-rate">Policy Implementation Rate</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      The fraction of announced climate policies that are
                      actually implemented and enforced. 100% means all pledges
                      are fully delivered; 50% means only half are implemented.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">
                {(values.policyImplementationRate * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              id="policy-rate"
              min={0}
              max={1}
              step={0.05}
              value={[values.policyImplementationRate]}
              onValueChange={([value]) =>
                handleChange("policyImplementationRate", value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (No implementation)</span>
              <span>50% (Partial)</span>
              <span>100% (Full implementation)</span>
            </div>
          </div>

          {/* Technology Adoption Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="tech-speed">Technology Adoption Speed</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Speed multiplier for clean technology deployment
                      (renewables, EVs, storage). 1.0x is baseline; 2.0x means
                      twice as fast deployment; 0.5x means half the speed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">
                {values.technologyAdoptionSpeed.toFixed(1)}x
              </span>
            </div>
            <Slider
              id="tech-speed"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[values.technologyAdoptionSpeed]}
              onValueChange={([value]) =>
                handleChange("technologyAdoptionSpeed", value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x (Slow)</span>
              <span>1.0x (Baseline)</span>
              <span>2.0x (Rapid)</span>
            </div>
          </div>

          {/* Economic Growth Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="economic-growth">
                  Economic Growth Rate (Annual)
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Average annual global GDP growth rate. Higher growth
                      typically increases emissions unless offset by rapid
                      decarbonization. Historical average: ~2.5-3.0%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">
                {values.economicGrowthRate.toFixed(1)}%
              </span>
            </div>
            <Slider
              id="economic-growth"
              min={0}
              max={5}
              step={0.1}
              value={[values.economicGrowthRate]}
              onValueChange={([value]) =>
                handleChange("economicGrowthRate", value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Stagnation)</span>
              <span>2.5% (Historical avg)</span>
              <span>5% (High growth)</span>
            </div>
          </div>

          {/* Methodology Explanation */}
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              How is the Temperature Distribution Calculated?
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Step 1: Real-World Indicator Collection</strong><br />
                We gather current data on renewable energy capacity (IRENA), electric vehicle adoption (IEA), 
                climate policy coverage (Climate Action Tracker), corporate commitments (SBTi), GDP growth, 
                and carbon intensity (World Bank).
              </p>
              <p>
                <strong>Step 2: Forward Projection</strong><br />
                Each indicator's recent trend (2019-2024) is projected forward to 2100. For example, if renewable 
                capacity grew 15% annually over the past 5 years, we project this momentum continues (adjusted by 
                the technology adoption parameter).
              </p>
              <p>
                <strong>Step 3: Emissions Trajectory Calculation</strong><br />
                Sector-specific models translate indicator improvements into emissions reductions. Renewable deployment 
                reduces power sector emissions, EV adoption cuts transport emissions, and policy implementation affects 
                all sectors. These are summed to create a global emissions pathway from 2024 to 2100.
              </p>
              <p>
                <strong>Step 4: Monte Carlo Uncertainty Quantification</strong><br />
                We run 10,000 simulations, varying each indicator within realistic bounds based on historical volatility. 
                Each simulation produces a different emissions pathway and temperature outcome, creating the probability 
                distribution you see in the chart.
              </p>
              <p>
                <strong>Step 5: Temperature Conversion</strong><br />
                Cumulative emissions are converted to temperature rise using the IPCC's Transient Climate Response to 
                Cumulative Emissions (TCRE) relationship: approximately 0.45°C per 1000 GtCO₂. We add this to the 
                current baseline warming of 1.1°C above pre-industrial levels.
              </p>
              <p className="pt-2 border-t border-border/50">
                <strong>Result:</strong> The histogram shows the probability density of temperature outcomes. The median 
                (50th percentile) represents the most likely outcome, while the 10th and 90th percentiles show optimistic 
                and pessimistic scenarios. Adjusting the parameters above changes these projections by modifying how 
                aggressively indicators translate into emissions reductions.
              </p>
            </div>
          </div>

          {/* Impact Summary */}
          {isModified && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">Parameter Changes:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {values.climateSensitivity !== DEFAULT_VALUES.climateSensitivity && (
                  <p>
                    • Climate sensitivity:{" "}
                    {values.climateSensitivity > DEFAULT_VALUES.climateSensitivity
                      ? "increased"
                      : "decreased"}{" "}
                    to {values.climateSensitivity.toFixed(1)}°C
                  </p>
                )}
                {values.policyImplementationRate !==
                  DEFAULT_VALUES.policyImplementationRate && (
                  <p>
                    • Policy implementation:{" "}
                    {values.policyImplementationRate >
                    DEFAULT_VALUES.policyImplementationRate
                      ? "increased"
                      : "decreased"}{" "}
                    to {(values.policyImplementationRate * 100).toFixed(0)}%
                  </p>
                )}
                {values.technologyAdoptionSpeed !==
                  DEFAULT_VALUES.technologyAdoptionSpeed && (
                  <p>
                    • Technology adoption:{" "}
                    {values.technologyAdoptionSpeed >
                    DEFAULT_VALUES.technologyAdoptionSpeed
                      ? "faster"
                      : "slower"}{" "}
                    ({values.technologyAdoptionSpeed.toFixed(1)}x)
                  </p>
                )}
                {values.economicGrowthRate !==
                  DEFAULT_VALUES.economicGrowthRate && (
                  <p>
                    • Economic growth:{" "}
                    {values.economicGrowthRate > DEFAULT_VALUES.economicGrowthRate
                      ? "increased"
                      : "decreased"}{" "}
                    to {values.economicGrowthRate.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export { DEFAULT_VALUES as DEFAULT_PARAMETER_VALUES };
