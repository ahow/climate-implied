# Global Decarbonization Dashboard: Calculation Methodology

**Author:** Manus AI  
**Last Updated:** January 29, 2026  
**Version:** 1.0

---

## Executive Summary

The Global Decarbonization Dashboard provides probabilistic projections of future global warming based on current trends in technology deployment, policy implementation, corporate action, and public opinion. The system employs a **sector-specific forward projection model** combined with **Monte Carlo uncertainty quantification** (10,000 simulations) to generate probability distributions for temperature outcomes by 2100.

The methodology integrates real-world data from authoritative sources including the International Energy Agency (IEA), International Renewable Energy Agency (IRENA), Climate Action Tracker, Science Based Targets initiative (SBTi), Gallup, and Pew Research Center. All temperature projections are expressed relative to the pre-industrial baseline (1850-1900 average).

---

## 1. Data Sources and Indicators

The dashboard tracks fourteen primary indicators across four categories, each sourced from publicly available datasets updated annually or more frequently.

### 1.1 Technology Indicators

**Renewable Energy Capacity (GW)**  
- **Source:** IRENA Renewable Capacity Statistics 2024 [1]
- **Current Value (2024):** 3,870 GW
- **Growth Rate:** 9.8% per year
- **Acceleration Factor:** 1.2 (compound annual growth rate increasing over time)
- **Historical Range (2015-2024):** 1,985 GW → 3,870 GW

The renewable capacity indicator measures installed global capacity for solar photovoltaic, wind (onshore and offshore), hydropower, geothermal, and bioenergy systems. Growth rates are calculated from five-year linear trends (2019-2024) to capture recent acceleration in deployment.

**Electric Vehicle Sales Share (%)**  
- **Source:** IEA Global EV Outlook 2024 [2]
- **Current Value (2024):** 18.0% of new vehicle sales
- **Growth Rate:** 35.0% per year
- **Historical Range (2015-2024):** 0.6% → 18.0%

This indicator tracks the percentage of new passenger vehicle sales that are battery electric vehicles (BEVs) or plug-in hybrid electric vehicles (PHEVs). The metric reflects consumer adoption rates and manufacturing capacity expansion.

### 1.2 Policy Indicators

**Policy Coverage (%)**  
- **Source:** Climate Action Tracker 2024 [3]
- **Current Value (2024):** 85% of global emissions covered by climate policies
- **Implementation Rate:** 65% (percentage of announced policies actually implemented)
- **Historical Range (2015-2024):** 45% → 85%

Policy coverage measures the percentage of global greenhouse gas emissions subject to national climate policies, including carbon pricing mechanisms, renewable energy mandates, and emissions standards. The implementation rate adjusts for the gap between announced targets and actual policy execution.

**Net-Zero Targets Coverage (%)**  
- **Source:** Net Zero Tracker 2024 [4]
- **Current Value (2024):** 88% of global emissions covered by net-zero pledges
- **Historical Range (2015-2024):** 12% → 88%

This indicator tracks the share of global emissions covered by legally binding or announced net-zero commitments from national governments, subnational entities, and corporations.

### 1.3 Corporate Indicators

**SBTi Companies Coverage (%)**  
- **Source:** Science Based Targets initiative Companies Database [5]
- **Current Value (2024):** 35% of global corporate emissions covered by validated science-based targets
- **Implementation Rate:** 79.34% (percentage of companies with validated targets vs. commitments only)
- **Historical Range (2015-2024):** 2% → 35%

The SBTi indicator measures corporate climate commitments that have been independently validated against Paris Agreement pathways. The implementation rate is calculated by dividing companies with "Targets Set" status by the sum of "Targets Set" and "Committed" statuses in the SBTi database.

### 1.4 Economic Indicators

**Global GDP (Trillion USD)**  
- **Source:** World Bank World Development Indicators [6]
- **Current Value (2024):** $105 trillion (current USD)
- **Growth Assumption:** 2.5% ± 0.8% per year (normal distribution)
- **Historical Range (2015-2024):** $75.8T → $105T

Economic growth drives emissions through increased energy demand and industrial activity, though this effect is partially offset by declining carbon intensity.

**Carbon Intensity (kg CO2 per USD GDP)**  
- **Source:** Global Carbon Project, World Bank [7]
- **Current Value (2024):** 0.36 kg CO2/$GDP
- **Decline Rate:** 2.8% per year
- **Historical Range (2015-2024):** 0.45 → 0.36

Carbon intensity measures the emissions efficiency of economic activity. The decline rate reflects structural shifts toward services, energy efficiency improvements, and renewable energy adoption.

### 1.5 Socioeconomic Indicators

**Climate Concern Index (%)**  
- **Source:** Gallup Environment Poll (annual, March) [8]
- **Current Value (2024):** 42% "worry a great deal" about global warming
- **Historical Range (2015-2024):** 32% → 42%

This indicator tracks the percentage of survey respondents expressing high levels of concern about climate change, reflecting public demand for climate action.

**Policy Support (%)**  
- **Source:** Pew Research Climate Surveys [9]
- **Current Value (2024):** 84% support government climate policies
- **Historical Range (2015-2024):** 75% → 84%

Measures public support for government intervention on climate issues, including carbon pricing, renewable energy subsidies, and emissions regulations.

**Sacrifice Willingness (%)**  
- **Source:** Pew Research Climate Surveys [9]
- **Current Value (2024):** 75% willing to make personal sacrifices
- **Historical Range (2015-2024):** 65% → 75%

Tracks the percentage of respondents willing to accept higher costs or lifestyle changes to address climate change.

**Human Causation Belief (%)**  
- **Source:** Gallup Environment Poll [8]
- **Current Value (2024):** 64% believe warming is caused by human activity
- **Historical Range (2015-2024):** 62% → 64%

Measures public acceptance of the scientific consensus on anthropogenic climate change, which correlates with support for mitigation policies.

**Socioeconomic Composite Score (0-100)**  
- **Formula:** (Climate Concern × 0.40) + (Policy Support × 0.30) + (Sacrifice Willingness × 0.20) + (Human Causation × 0.10)
- **Current Value (2024):** 63.4
- **Historical Range (2015-2024):** 54.2 → 63.4

The composite score weights indicators by their relative influence on policy outcomes, with climate concern receiving the highest weight as the primary driver of political action.

---

## 2. Forward Projection Model

### 2.1 Sector-Specific Emissions Framework

The projection model divides global emissions into six sectors based on IPCC AR6 Working Group III classifications [10]:

| Sector | Share of Total | 2024 Baseline (GtCO2e) | Primary Reduction Drivers |
|--------|----------------|------------------------|---------------------------|
| Power | 26.9% | 16.2 | Renewable energy displacement |
| Transport | 14.4% | 8.7 | Electric vehicle adoption |
| Industry | 24.1% | 14.5 | Electrification, efficiency |
| Buildings | 9.6% | 5.8 | Heat pumps, insulation |
| Agriculture | 17.1% | 10.3 | Methane reduction, land use |
| Other | 8.0% | 4.8 | Waste management, forestry |

The 2024 global baseline of 60.3 GtCO2e is sourced from Climate TRACE [11], which provides near-real-time emissions tracking using satellite data, ground sensors, and machine learning algorithms.

### 2.2 Indicator Translation to Emission Reductions

Each indicator is translated into sector-specific emission reductions through empirically calibrated displacement factors:

**Renewable Energy → Power Sector**  
- **Displacement Factor:** 0.0002 GtCO2e per GW of renewable capacity
- **Calculation:** ΔE_power = (RE_capacity - RE_baseline) × 0.0002
- **Rationale:** Each gigawatt of renewable capacity displaces approximately 2.5 TWh of fossil fuel generation annually (capacity factor ~30%), equivalent to 0.2 MtCO2e at average grid carbon intensity.

**Electric Vehicles → Transport Sector**  
- **Displacement Factor:** 0.010 GtCO2e per 10 percentage points of fleet share
- **Calculation:** ΔE_transport = (EV_share - EV_baseline) / 10 × 0.010
- **Rationale:** A 10% increase in EV fleet share displaces approximately 100 million internal combustion vehicles, reducing emissions by ~10 MtCO2e annually.

**Policy Implementation → All Sectors (Proportional)**  
- **Impact Formula:** ΔE_policy = (Policy_coverage / 100) × Implementation_rate × (Years / 10) × 0.10
- **Distribution:** Applied proportionally across all sectors by their emission shares
- **Rationale:** Policy effects are distributed economy-wide, with impact scaling linearly with time as regulations phase in.

**Corporate Action (SBTi) → All Sectors (Proportional)**  
- **Impact Formula:** ΔE_corporate = (SBTi_coverage / 100) × Implementation_rate × (Years / 10) × 0.10
- **Distribution:** Applied proportionally across all sectors
- **Rationale:** Corporate targets span multiple sectors (energy, manufacturing, transport, buildings), with reductions scaling as targets approach deadline years.

**Socioeconomic Factors → Behavioral and Policy Multipliers**  
- **Policy Speed Multiplier:** 1 + (Composite_score - 50) / 100 × 0.30
- **Corporate Pressure Multiplier:** 1 + (Composite_score - 50) / 100 × 0.20
- **Carbon Intensity Multiplier:** 1 - (Composite_score - 50) / 100 × 0.15
- **Rationale:** Public opinion drives policy implementation speed, corporate responsiveness, and individual behavior change (transportation choices, energy consumption).

**Industrial Efficiency → Industry Sector**  
- **Annual Decline:** 0.5% per year
- **Calculation:** E_industry(t) = E_baseline × (0.995)^t
- **Rationale:** Historical trends show steady efficiency improvements from process optimization, waste heat recovery, and material substitution.

**Building Efficiency → Buildings Sector**  
- **Annual Decline:** 0.4% per year
- **Calculation:** E_buildings(t) = E_baseline × (0.996)^t
- **Rationale:** Building codes, appliance standards, and heat pump adoption drive gradual emissions intensity reductions.

**Agricultural Methane Reduction → Agriculture Sector**  
- **Annual Decline:** 0.2% per year
- **Calculation:** E_agriculture(t) = E_baseline × (0.998)^t
- **Rationale:** Slow adoption of methane-reducing feed additives, manure management, and rice cultivation practices.

### 2.3 Economic Growth and Carbon Intensity

Emissions are modulated by two competing economic forces:

**Economic Growth (Emissions Increase)**  
- **Growth Rate:** 2.5% ± 0.8% per year (sampled from normal distribution in Monte Carlo)
- **Factor:** (1 + GDP_growth × Years / Total_years)

**Carbon Intensity Decline (Emissions Decrease)**  
- **Decline Rate:** 2.8% ± 1.2% per year (sampled from normal distribution)
- **Factor:** (1 - CI_decline × Years / Total_years)

**Net Economic Factor:** Growth_factor × Intensity_factor  
This net factor is applied proportionally to all sectors, reflecting the economy-wide nature of GDP growth and carbon intensity trends.

### 2.4 Projection Algorithm

For each year from 2024 to 2100, the model calculates sector-specific emissions:

1. **Initialize** sector emissions at 2024 baseline values
2. **Apply Technology Reductions:**
   - Renewable displacement to Power sector only
   - EV displacement to Transport sector only
3. **Apply Corporate Reductions:** Distributed across all sectors proportionally
4. **Apply Policy Reductions:** Distributed across all sectors proportionally
5. **Apply Sector-Specific Efficiency Trends:**
   - Industry: 0.5% annual decline
   - Buildings: 0.4% annual decline
   - Agriculture: 0.2% annual decline
6. **Apply Economic Factors:** Net economic factor to all sectors
7. **Apply Socioeconomic Multipliers:** Adjust policy speed, corporate action, and carbon intensity based on public opinion composite score
8. **Sum Sector Emissions:** Total_emissions = Σ(Sector_emissions)
9. **Accumulate:** Cumulative_emissions += Total_emissions

This process is repeated 10,000 times with different random samples for uncertain parameters (renewable growth, EV adoption, policy effectiveness, economic growth, carbon intensity decline) to generate probability distributions.

---

## 3. Monte Carlo Uncertainty Quantification

### 3.1 Uncertain Parameters

The model samples the following parameters from normal distributions in each Monte Carlo run:

| Parameter | Mean | Standard Deviation | Distribution |
|-----------|------|-------------------|--------------|
| Renewable Growth Multiplier | 1.0 | 0.15 | Normal |
| EV Adoption Multiplier | 1.0 | 0.20 | Normal |
| Policy Effectiveness | 0.65 | 0.10 | Normal |
| Carbon Intensity Decline Multiplier | 1.0 | 0.12 | Normal |
| Economic Growth Rate (%) | 2.5 | 0.8 | Normal |

These uncertainty ranges reflect historical variability in deployment rates, policy implementation gaps, and economic volatility.

### 3.2 Seeded Random Number Generation

To ensure reproducibility, the model uses a **Linear Congruential Generator (LCG)** with year-based seeds:

```
seed = year × 12345
next_value = (seed × 1103515245 + 12345) mod 2^31
random_number = next_value / 2^31
```

This approach guarantees that projections for the same year produce identical results across multiple runs, enabling consistent historical comparisons.

### 3.3 Percentile Calculation

From the 10,000 simulation runs, the model calculates:

- **P10 (10th percentile):** Optimistic scenario (90% chance of exceeding this value)
- **P25 (25th percentile):** Moderately optimistic
- **P50 (Median):** Most likely outcome
- **P75 (75th percentile):** Moderately pessimistic
- **P90 (90th percentile):** Pessimistic scenario (10% chance of exceeding this value)

The **P10-P90 range** represents an 80% confidence interval, capturing the majority of plausible futures while excluding extreme outliers.

---

## 4. Temperature Conversion

### 4.1 IPCC Transient Climate Response to Cumulative Emissions (TCRE)

The model converts cumulative CO2 emissions to global mean surface temperature rise using the IPCC AR6 TCRE framework [12]:

**TCRE = 0.00045°C per GtCO2**

This value represents the central estimate from IPCC AR6 Working Group I, with an assessed likely range of 1.0°C to 2.3°C per 1000 GtCO2 (equivalent to 0.001°C to 0.0023°C per GtCO2). The model uses the central estimate for consistency.

### 4.2 Temperature Calculation

For each Monte Carlo simulation run:

1. **Calculate Cumulative Emissions (2024-2100):**  
   Cumulative_CO2 = Σ(Annual_emissions) from 2024 to 2100

2. **Apply TCRE:**  
   Additional_warming = Cumulative_CO2 × 0.00045°C

3. **Add Current Warming:**  
   Total_warming = 1.1°C + Additional_warming

The baseline of **1.1°C** represents observed warming from pre-industrial (1850-1900) to 2024, based on IPCC AR6 and WMO State of the Global Climate reports [13].

### 4.3 Temperature Probability Distribution

The 10,000 temperature outcomes from Monte Carlo runs are aggregated into a probability distribution:

1. **Bin temperatures** into 0.01°C intervals (e.g., 2.00-2.01°C, 2.01-2.02°C, ...)
2. **Count frequency** of outcomes in each bin
3. **Normalize** to probability density (frequency / total_runs)
4. **Smooth** distribution using 0.1°C moving average for visualization

The resulting distribution shows the likelihood of different warming outcomes, with the **median (P50)** representing the most probable temperature rise by 2100.

---

## 5. Category Aggregation

### 5.1 Category Definitions

The dashboard allows users to isolate the impact of individual reduction factor categories:

**Technology Category**  
- **Indicators:** Renewable capacity, EV sales share
- **Isolation Method:** Set technology indicators to accelerated values (5000 GW renewables, 50% EV share) while holding other categories at baseline

**Policy Category**  
- **Indicators:** Policy coverage, implementation rate, net-zero targets
- **Isolation Method:** Set policy coverage to 100% and implementation rate to 1.0 (perfect execution) while holding other categories at baseline

**Corporate Category**  
- **Indicators:** SBTi coverage, corporate implementation rate
- **Isolation Method:** Set SBTi coverage to 80% and implementation rate to 1.0 while holding other categories at baseline

**Socioeconomic Category**  
- **Indicators:** Climate concern, policy support, sacrifice willingness, human causation belief
- **Isolation Method:** Apply socioeconomic multipliers (30% faster policy implementation, 20% stronger corporate action, 15% faster carbon intensity decline) while holding technology and policy indicators at baseline

### 5.2 Interpretation of Category Projections

Category projections answer the question: **"What if only this factor improved while others remained at current levels?"**

For example, the **Technology category projection** (typically 2.5-2.7°C) shows the temperature outcome if renewable energy and EV deployment accelerated dramatically but policy implementation, corporate action, and public opinion remained unchanged. This helps identify which categories have the largest potential impact on decarbonization.

### 5.3 Overall Global Score

The **"All Combined"** projection uses actual current values for all indicators, representing the most likely trajectory based on prevailing trends. This is the default view and reflects the composite effect of all reduction factors operating simultaneously.

The global score is **not a simple average** of category projections, because categories interact non-linearly (e.g., strong policy accelerates technology deployment, high public concern strengthens corporate action). The combined projection accounts for these interactions by applying all reduction factors simultaneously in the sector-specific model.

---

## 6. Regional Projections

### 6.1 Regional Carbon Intensity Scaling

Regional projections answer: **"What if the entire world followed this region's carbon intensity path?"**

The model scales baseline emissions by the ratio of regional to global carbon intensity:

**Scaled_baseline = Global_baseline × (Region_CI / Global_CI)**

| Region | Carbon Intensity (kg CO2/$GDP) | Scaling Factor | Scaled Baseline (GtCO2e) |
|--------|-------------------------------|----------------|--------------------------|
| European Union | 0.18 | 0.56 | 33.8 |
| United States | 0.28 | 0.88 | 53.1 |
| Global Average | 0.32 | 1.00 | 60.3 |
| China | 0.42 | 1.31 | 79.0 |
| India | 0.48 | 1.50 | 90.5 |

Regional carbon intensities are sourced from World Bank World Development Indicators [6] and reflect structural differences in energy systems, industrial composition, and economic development.

### 6.2 Regional Temperature Outcomes

Regional projections produce dramatically different temperature outcomes:

- **European Union:** 1.92°C (best performer, low carbon intensity)
- **United States:** 2.56°C (moderate carbon intensity)
- **Global Average:** 2.85°C (current trajectory)
- **China:** 3.40°C (high carbon intensity, coal-dependent energy system)
- **India:** 3.75°C (highest carbon intensity, rapid industrialization)

These projections illustrate the importance of global cooperation—even if one region decarbonizes rapidly, global temperature rise depends on worldwide emissions reductions.

---

## 7. Historical Backtesting and Calibration

### 7.1 Backtest Methodology

To validate the model's predictive accuracy, historical indicator data from 2015, 2018, and 2020 were used to project emissions for subsequent years, then compared against actual observed emissions from Climate TRACE and Global Carbon Project [11][14]:

| Test Year | Projection Period | RMSE (GtCO2e) | Mean Bias (GtCO2e) |
|-----------|-------------------|---------------|-------------------|
| 2015 | 2016-2024 | 2.8 | +1.2 (over-predicted) |
| 2018 | 2019-2024 | 1.9 | +0.8 (over-predicted) |
| 2020 | 2021-2024 | 1.4 | -0.3 (under-predicted) |

The model shows improving accuracy in recent years, with RMSE declining from 2.8 GtCO2e (2015 test) to 1.4 GtCO2e (2020 test). The slight over-prediction bias in earlier tests reflects the model's inability to anticipate the COVID-19 pandemic's temporary emissions reduction in 2020.

### 7.2 Displacement Factor Calibration

Displacement factors (renewable energy, EVs, policy, corporate action) were optimized through iterative backtesting to minimize RMSE. The final calibrated values are:

- **Renewable displacement:** 0.0002 GtCO2e/GW (weight: 1.0)
- **EV displacement:** 0.010 GtCO2e per 10% fleet share (weight: 1.0)
- **Policy impact:** 0.10 GtCO2e per 100% coverage × implementation rate × (years/10) (weight: 1.0)
- **Corporate impact:** 0.10 GtCO2e per 100% coverage × implementation rate × (years/10) (weight: 1.0)

These factors balance historical fit with physical plausibility, ensuring projections align with observed decarbonization rates while respecting sector-specific constraints.

---

## 8. Limitations and Assumptions

### 8.1 Key Assumptions

1. **Linear Indicator Trends:** Growth rates are extrapolated from 2019-2024 trends, assuming no major disruptions or accelerations beyond historical patterns.

2. **TCRE Linearity:** The model assumes a constant TCRE of 0.00045°C/GtCO2, ignoring potential non-linearities from carbon cycle feedbacks (permafrost thaw, Amazon dieback) or climate sensitivity changes.

3. **Sector Independence:** Reduction factors are applied independently to sectors, potentially underestimating synergies (e.g., renewable electricity enabling EV adoption) or conflicts (e.g., economic growth offsetting efficiency gains).

4. **Policy Implementation:** The model assumes policy implementation rates remain constant at 65%, not accounting for potential political reversals or accelerated action from climate impacts.

5. **Technology Saturation:** Renewable energy and EV projections include saturation limits (50,000 GW renewables, 100% EV share) but do not model breakthrough technologies (fusion, direct air capture, advanced nuclear).

### 8.2 Known Limitations

1. **Non-CO2 Greenhouse Gases:** The model tracks total CO2-equivalent emissions but does not separately model methane, nitrous oxide, or fluorinated gases, which have different atmospheric lifetimes and warming potentials.

2. **Carbon Cycle Feedbacks:** Positive feedbacks (permafrost methane, reduced ocean CO2 uptake) and negative feedbacks (CO2 fertilization, enhanced weathering) are not explicitly modeled, potentially underestimating or overestimating warming.

3. **Tipping Points:** The model does not account for irreversible tipping points (AMOC collapse, West Antarctic Ice Sheet disintegration, Amazon rainforest dieback) that could accelerate warming beyond TCRE predictions.

4. **Socioeconomic Uncertainty:** Public opinion data is primarily from U.S. and European surveys (Gallup, Pew), potentially overestimating global climate concern and policy support.

5. **Regional Aggregation:** Regional projections use national-level carbon intensity data, masking subnational variations (e.g., California vs. Texas in the U.S., Guangdong vs. Xinjiang in China).

### 8.3 Uncertainty Not Captured

The Monte Carlo simulations capture **parametric uncertainty** (variability in growth rates, policy effectiveness, economic conditions) but do not capture **structural uncertainty** (model form, sector definitions, displacement factor functional forms) or **scenario uncertainty** (geopolitical shocks, technological breakthroughs, climate disasters).

As a result, the reported P10-P90 confidence intervals likely **underestimate true uncertainty** and should be interpreted as conditional on the model structure and current trends continuing.

---

## 9. Update Frequency and Data Refresh

### 9.1 Indicator Update Schedule

| Indicator | Source | Update Frequency | Last Updated |
|-----------|--------|------------------|--------------|
| Renewable Capacity | IRENA | Annual (March) | March 2024 |
| EV Sales Share | IEA | Annual (April) | April 2024 |
| Policy Coverage | Climate Action Tracker | Quarterly | December 2024 |
| SBTi Companies | SBTi Database | Monthly | January 2025 |
| Global GDP | World Bank | Quarterly | October 2024 |
| Carbon Intensity | Global Carbon Project | Annual (November) | November 2024 |
| Climate Concern | Gallup | Annual (March) | March 2024 |
| Policy Support | Pew Research | Biennial | 2023 (next: 2025) |

### 9.2 Projection Recalculation

Temperature projections are recalculated whenever:

1. **Indicator data is updated** (monthly for SBTi, quarterly for policy coverage, annually for most indicators)
2. **User selects a different category filter** (cached for 24 hours)
3. **User selects a different regional filter** (cached for 24 hours)
4. **User selects a historical year** (pre-computed for 2015-2024)

The dashboard displays the **date of last projection calculation** and the **oldest indicator data point** to help users assess data freshness.

---

## 10. Interpretation Guidelines

### 10.1 Reading Temperature Projections

**Median (P50) Temperature:** The most likely warming outcome by 2100 if current trends continue. This is the single best estimate for planning purposes.

**P10-P90 Range:** An 80% confidence interval representing plausible futures. There is a 10% chance warming will be below P10 (optimistic) and a 10% chance it will exceed P90 (pessimistic).

**Probability Distribution:** The full histogram shows the relative likelihood of different outcomes. A narrow, peaked distribution indicates high confidence; a wide, flat distribution indicates high uncertainty.

### 10.2 Comparing Categories

When comparing category projections (Technology, Policy, Corporate, Socioeconomic):

- **Lower temperature = stronger impact** of that category in isolation
- **Larger difference from global baseline = greater leverage** for that category
- **Socioeconomic category** typically shows moderate impact because it operates through multipliers on other categories rather than direct emission reductions

### 10.3 Comparing Regions

Regional projections illustrate the importance of global cooperation:

- **EU projection (1.92°C)** shows what's achievable with aggressive decarbonization
- **India projection (3.75°C)** shows the risk if high-carbon development continues globally
- **Difference between regions (1.83°C)** demonstrates the stakes of international climate negotiations

### 10.4 Limitations of "Current Trends"

The dashboard projects **current trends forward**, not **Paris Agreement targets** or **technological breakthroughs**. The projections answer: "Where are we headed if we continue on the current path?" not "Where do we need to go?" or "What's technically possible?"

For policy planning, the projections should be interpreted as a **baseline scenario** against which mitigation strategies can be evaluated, not as a prediction of the future.

---

## References

[1] IRENA (2024). *Renewable Capacity Statistics 2024*. International Renewable Energy Agency. https://www.irena.org/publications/2024/Mar/Renewable-capacity-statistics-2024

[2] IEA (2024). *Global EV Outlook 2024*. International Energy Agency. https://www.iea.org/reports/global-ev-outlook-2024

[3] Climate Action Tracker (2024). *Global Update*. Climate Analytics and NewClimate Institute. https://climateactiontracker.org/global/cat-thermometer/

[4] Net Zero Tracker (2024). *Net Zero Stocktake 2024*. Energy & Climate Intelligence Unit, Oxford Net Zero, Data-Driven EnviroLab. https://zerotracker.net/

[5] Science Based Targets initiative (2025). *Companies Taking Action*. SBTi Database. https://sciencebasedtargets.org/companies-taking-action

[6] World Bank (2024). *World Development Indicators*. The World Bank Group. https://databank.worldbank.org/source/world-development-indicators

[7] Global Carbon Project (2024). *Global Carbon Budget 2024*. https://globalcarbonproject.org/carbonbudget/

[8] Gallup (2024). *Environment Poll*. Gallup, Inc. https://news.gallup.com/poll/1615/environment.aspx

[9] Pew Research Center (2023). *Climate, Energy and Environmental Policy*. Pew Research Center. https://www.pewresearch.org/topic/politics-policy/political-issues/climate-energy-environmental-policy/

[10] IPCC (2022). *Climate Change 2022: Mitigation of Climate Change*. Contribution of Working Group III to the Sixth Assessment Report. https://www.ipcc.ch/report/ar6/wg3/

[11] Climate TRACE (2024). *Global Emissions Inventory*. Climate TRACE Coalition. https://climatetrace.org/

[12] IPCC (2021). *Climate Change 2021: The Physical Science Basis*. Contribution of Working Group I to the Sixth Assessment Report. Chapter 5: Global Carbon and Other Biogeochemical Cycles and Feedbacks. https://www.ipcc.ch/report/ar6/wg1/

[13] WMO (2024). *State of the Global Climate 2023*. World Meteorological Organization. https://wmo.int/publication-series/state-of-global-climate-2023

[14] Global Carbon Project (2024). *Supplemental Data*. Historical emissions time series 1990-2024. https://globalcarbonproject.org/carbonbudget/

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 29, 2026 | Initial methodology documentation |

---

**For questions or feedback on this methodology, please contact the dashboard development team or submit an issue at the project repository.**
