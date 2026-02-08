import { describe, it, expect } from "vitest";
import { getAllHistoricalIndicators, getHistoricalIndicators } from "./historicalIndicators";

describe("Historical Indicators", () => {
  describe("getAllHistoricalIndicators", () => {
    it("should return 10 years of data (2015-2024)", () => {
      const data = getAllHistoricalIndicators();
      expect(data).toHaveLength(10);
      expect(data[0].year).toBe(2015);
      expect(data[9].year).toBe(2024);
    });

    it("should have all required fields for each year", () => {
      const data = getAllHistoricalIndicators();
      data.forEach((yearData) => {
        expect(yearData).toHaveProperty("year");
        expect(yearData).toHaveProperty("renewableCapacityGW");
        expect(yearData).toHaveProperty("renewableGrowthRate");
        expect(yearData).toHaveProperty("evSalesSharePct");
        expect(yearData).toHaveProperty("evGrowthRate");
        expect(yearData).toHaveProperty("policyCoveragePct");
        expect(yearData).toHaveProperty("policyImplementationRate");
        expect(yearData).toHaveProperty("gdpTrillionUSD");
        expect(yearData).toHaveProperty("carbonIntensityKgPerGDP");
        expect(yearData).toHaveProperty("corporateTargetsPct");
        expect(yearData).toHaveProperty("corporateImplementationRate");
      });
    });

    it("should show increasing renewable capacity over time", () => {
      const data = getAllHistoricalIndicators();
      const capacity2015 = data[0].renewableCapacityGW;
      const capacity2024 = data[9].renewableCapacityGW;
      expect(capacity2024).toBeGreaterThan(capacity2015);
      expect(capacity2015).toBe(1985); // IRENA 2015 data
      expect(capacity2024).toBe(4455); // IRENA 2025 press release
    });

    it("should show increasing EV sales share over time", () => {
      const data = getAllHistoricalIndicators();
      const ev2015 = data[0].evSalesSharePct;
      const ev2024 = data[9].evSalesSharePct;
      expect(ev2024).toBeGreaterThan(ev2015);
      expect(ev2015).toBe(0.6); // IEA 2015 data
      expect(ev2024).toBe(20.5); // IEA 2024 estimate
    });

    it("should show increasing policy coverage over time", () => {
      const data = getAllHistoricalIndicators();
      const policy2015 = data[0].policyCoveragePct;
      const policy2024 = data[9].policyCoveragePct;
      expect(policy2024).toBeGreaterThan(policy2015);
      expect(policy2015).toBe(45); // CAT 2015 baseline
      expect(policy2024).toBe(87); // CAT 2024 estimate
    });

    it("should show decreasing carbon intensity over time", () => {
      const data = getAllHistoricalIndicators();
      const carbon2015 = data[0].carbonIntensityKgPerGDP;
      const carbon2024 = data[9].carbonIntensityKgPerGDP;
      expect(carbon2024).toBeLessThan(carbon2015);
      expect(carbon2015).toBe(0.45); // Global Carbon Project 2015
      expect(carbon2024).toBe(0.36); // IEA 2024 estimate
    });

    it("should show increasing corporate commitments over time", () => {
      const data = getAllHistoricalIndicators();
      const corp2015 = data[0].corporateTargetsPct;
      const corp2024 = data[9].corporateTargetsPct;
      expect(corp2024).toBeGreaterThan(corp2015);
      expect(corp2015).toBe(2); // SBTi 2015 launch
      expect(corp2024).toBe(38); // SBTi 2024 estimate
    });

    it("should show COVID impact on GDP in 2020", () => {
      const data = getAllHistoricalIndicators();
      const gdp2019 = data.find((d) => d.year === 2019)!.gdpTrillionUSD;
      const gdp2020 = data.find((d) => d.year === 2020)!.gdpTrillionUSD;
      const gdp2021 = data.find((d) => d.year === 2021)!.gdpTrillionUSD;
      
      // 2020 GDP should be lower than 2019 due to COVID
      expect(gdp2020).toBeLessThan(gdp2019);
      // 2021 GDP should recover above 2019 levels
      expect(gdp2021).toBeGreaterThan(gdp2019);
    });
  });

  describe("getHistoricalIndicators", () => {
    it("should return data for a specific year", () => {
      const data2020 = getHistoricalIndicators(2020);
      expect(data2020).not.toBeNull();
      expect(data2020!.year).toBe(2020);
      expect(data2020!.renewableCapacityGW).toBe(2838);
    });

    it("should return null for years outside range", () => {
      expect(getHistoricalIndicators(2014)).toBeNull();
      expect(getHistoricalIndicators(2025)).toBeNull();
    });

    it("should return correct data for boundary years", () => {
      const data2015 = getHistoricalIndicators(2015);
      const data2024 = getHistoricalIndicators(2024);
      
      expect(data2015).not.toBeNull();
      expect(data2024).not.toBeNull();
      expect(data2015!.year).toBe(2015);
      expect(data2024!.year).toBe(2024);
    });
  });

  describe("Data Quality", () => {
    it("should have realistic growth rates", () => {
      const data = getAllHistoricalIndicators();
      data.forEach((yearData) => {
        // Renewable growth rate should be between 0% and 20% annually
        expect(yearData.renewableGrowthRate).toBeGreaterThanOrEqual(0);
        expect(yearData.renewableGrowthRate).toBeLessThanOrEqual(0.20);
        
        // EV growth rate should be between 0% and 120% annually
        expect(yearData.evGrowthRate).toBeGreaterThanOrEqual(0);
        expect(yearData.evGrowthRate).toBeLessThanOrEqual(1.20);
        
        // Policy coverage should be between 0% and 100%
        expect(yearData.policyCoveragePct).toBeGreaterThanOrEqual(0);
        expect(yearData.policyCoveragePct).toBeLessThanOrEqual(100);
      });
    });

    it("should have positive GDP values", () => {
      const data = getAllHistoricalIndicators();
      data.forEach((yearData) => {
        expect(yearData.gdpTrillionUSD).toBeGreaterThan(0);
        expect(yearData.gdpTrillionUSD).toBeLessThan(200); // Sanity check
      });
    });

    it("should have positive carbon intensity values", () => {
      const data = getAllHistoricalIndicators();
      data.forEach((yearData) => {
        expect(yearData.carbonIntensityKgPerGDP).toBeGreaterThan(0);
        expect(yearData.carbonIntensityKgPerGDP).toBeLessThan(1); // Sanity check
      });
    });
  });
});
