# Socioeconomic Indicator Design for Decarbonization Dashboard

## Overview
The socioeconomic category represents public opinion and social/political will toward climate action. This captures the "demand side" of decarbonization - how much society wants and supports climate action, which drives policy adoption and behavior change.

## Primary Indicator: Climate Concern Index (CCI)

**Definition:** Composite score measuring public concern about climate change based on Gallup "worry a great deal" percentage.

**Historical Data (2015-2024):**
| Year | Worry "A Great Deal" (%) | CCI Score (0-100) |
|------|-------------------------|-------------------|
| 2015 | 32% | 32 |
| 2016 | 37% | 37 |
| 2017 | 45% | 45 |
| 2018 | 44% | 44 |
| 2019 | 44% | 44 |
| 2020 | 43% | 43 |
| 2021 | 43% | 43 |
| 2022 | 42% | 42 |
| 2023 | 43% | 43 |
| 2024 | 42% | 42 |

**Trend Analysis:**
- **2015 baseline**: 32% (post-recession recovery)
- **2016-2017 surge**: +13 points (warm winters, Trump concerns)
- **2017-2024 plateau**: 42-45% (sustained high concern)
- **Average 2015-2024**: 41.5%
- **Current (2024)**: 42%

## Secondary Indicators

### 1. Policy Support Score
**Source:** Pew Research 2024
- Tree planting programs: 90% support
- Methane sealing: 84% support
- Tax credits for efficiency: 78% support
**Average**: 84%

### 2. Sacrifice Willingness
**Source:** Pew Research 2024
- Expect to make sacrifices: 75%
- Expect major sacrifices: 23%
**Score**: 75%

### 3. Human Causation Belief
**Source:** Gallup 2024
- Believe warming is caused by human activity: 64%
**Score**: 64%

## Composite Socioeconomic Score Formula

```
Socioeconomic Score = (
  Climate Concern Index × 0.40 +
  Policy Support × 0.30 +
  Sacrifice Willingness × 0.20 +
  Human Causation Belief × 0.10
)
```

**2024 Calculation:**
```
= (42 × 0.40) + (84 × 0.30) + (75 × 0.20) + (64 × 0.10)
= 16.8 + 25.2 + 15.0 + 6.4
= 63.4
```

## Impact on Projections

The socioeconomic score affects decarbonization trajectory through:

1. **Policy Implementation Speed** (primary effect)
   - Higher public support → faster policy adoption
   - Scaling factor: `(SocioScore / 63.4)^0.8`
   
2. **Corporate Action Pressure** (secondary effect)
   - Public concern drives corporate commitments
   - Scaling factor: `(SocioScore / 63.4)^0.5`

3. **Behavior Change** (tertiary effect)
   - Willingness to sacrifice drives consumption changes
   - Affects carbon intensity decline rate

## Historical Socioeconomic Scores (2015-2024)

| Year | CCI | Policy Support | Sacrifice Will | Human Cause | **Total Score** |
|------|-----|----------------|----------------|-------------|-----------------|
| 2015 | 32 | ~75* | ~65* | 62 | **54.2** |
| 2016 | 37 | ~76* | ~66* | 65 | **57.3** |
| 2017 | 45 | ~78* | ~68* | 68 | **62.1** |
| 2018 | 44 | ~79* | ~69* | 67 | **61.5** |
| 2019 | 44 | ~80* | ~70* | 66 | **61.6** |
| 2020 | 43 | ~81* | ~71* | 64 | **61.1** |
| 2021 | 43 | ~82* | ~72* | 64 | **61.3** |
| 2022 | 42 | ~83* | ~73* | 64 | **61.2** |
| 2023 | 43 | ~83* | ~74* | 64 | **61.9** |
| 2024 | 42 | 84 | 75 | 64 | **63.4** |

*Interpolated from available data points

## Display in Dashboard

**Underlying Data & Indicators Section:**
```
🗳️ Socioeconomic & Public Opinion

Climate Concern
43% (Gallup 2024)
[Sparkline: 2015-2024 trend]

Policy Support
84% (Pew 2024)
[Sparkline: 2015-2024 trend]

Sacrifice Willingness
75% (Pew 2024)
[Sparkline: 2015-2024 trend]

Human Causation Belief
64% (Gallup 2024)
[Sparkline: 2015-2024 trend]
```

## Data Sources

1. **Gallup Environment Poll** (Annual, March)
   - "Worry a great deal" about global warming
   - Human causation belief
   - https://news.gallup.com/poll/1615/environment.aspx

2. **Pew Research Climate Surveys**
   - Policy support
   - Sacrifice willingness
   - https://www.pewresearch.org/science/

3. **Yale Climate Opinion Maps** (Supplementary)
   - County-level climate opinions
   - https://climatecommunication.yale.edu/visualizations-data/ycom-us/

## Implementation Notes

- Socioeconomic score should be **inversely related** to temperature rise (higher concern → lower emissions)
- Current global score (63.4) represents US data; regional variations should be applied
- EU likely has higher socioeconomic score (~70-75)
- China/India may have different dynamics (less survey data available)
