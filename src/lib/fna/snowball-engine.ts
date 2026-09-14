import { StockHolding, DividendSnowballPoint } from "./types";

export interface HoldingMetrics {
  totalCost: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  annualDividend: number;
  monthlyDividend: number;
  dividendYield: number;
  yieldOnCost: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  annualDividends: number;
  monthlyDividends: number;
  portfolioYield: number;
  portfolioYieldOnCost: number;
  holdingCount: number;
}

/**
 * Calculates individual holding financial metrics
 */
export function calculateHoldingMetrics(holding: StockHolding): HoldingMetrics {
  const shares = Number(holding.shares) || 0;
  const costBasis = Number(holding.costBasisPerShare) || 0;
  const currentPrice = Number(holding.currentPrice) || 0;
  const divPerShare = Number(holding.annualDividendPerShare) || 0;

  const totalCost = shares * costBasis;
  const currentValue = shares * currentPrice;
  const unrealizedGainLoss = currentValue - totalCost;
  const unrealizedGainLossPercent = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;
  const annualDividend = shares * divPerShare;
  const monthlyDividend = annualDividend / 12;

  const dividendYield = currentPrice > 0 ? (divPerShare / currentPrice) * 100 : 0;
  const yieldOnCost = costBasis > 0 ? (divPerShare / costBasis) * 100 : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    unrealizedGainLoss: Math.round(unrealizedGainLoss * 100) / 100,
    unrealizedGainLossPercent: Math.round(unrealizedGainLossPercent * 10) / 10,
    annualDividend: Math.round(annualDividend * 100) / 100,
    monthlyDividend: Math.round(monthlyDividend * 100) / 100,
    dividendYield: Math.round(dividendYield * 100) / 100,
    yieldOnCost: Math.round(yieldOnCost * 100) / 100,
  };
}

/**
 * Computes portfolio-wide totals and aggregate yields
 */
export function calculatePortfolioMetrics(holdings: StockHolding[]): PortfolioMetrics {
  if (!holdings || holdings.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      annualDividends: 0,
      monthlyDividends: 0,
      portfolioYield: 0,
      portfolioYieldOnCost: 0,
      holdingCount: 0,
    };
  }

  let totalValue = 0;
  let totalCost = 0;
  let annualDividends = 0;

  holdings.forEach((h) => {
    const m = calculateHoldingMetrics(h);
    totalValue += m.currentValue;
    totalCost += m.totalCost;
    annualDividends += m.annualDividend;
  });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const portfolioYield = totalValue > 0 ? (annualDividends / totalValue) * 100 : 0;
  const portfolioYieldOnCost = totalCost > 0 ? (annualDividends / totalCost) * 100 : 0;

  return {
    totalValue: Math.round(totalValue),
    totalCost: Math.round(totalCost),
    totalGainLoss: Math.round(totalGainLoss),
    totalGainLossPercent: Math.round(totalGainLossPercent * 10) / 10,
    annualDividends: Math.round(annualDividends),
    monthlyDividends: Math.round(annualDividends / 12),
    portfolioYield: Math.round(portfolioYield * 100) / 100,
    portfolioYieldOnCost: Math.round(portfolioYieldOnCost * 100) / 100,
    holdingCount: holdings.length,
  };
}

export interface SnowballSimulationOptions {
  holdings: StockHolding[];
  currentAge: number;
  projectionYears: number; // e.g. 10, 20, 30
  monthlyDcaContribution?: number; // e.g. $500/mo cash DCA
  forceGlobalDrip?: boolean; // If provided, overrides individual holding DRIP settings
}

/**
 * Multi-year Dividend Snowball simulation
 * Accurately models dual-growth compounding:
 * 1. Capital appreciation of underlying share price
 * 2. Dividend growth rate (raising payout per share)
 * 3. Share accumulation via dividend reinvestment (DRIP) & monthly DCA
 */
export function runDividendSnowballSimulation(options: SnowballSimulationOptions): DividendSnowballPoint[] {
  const {
    holdings,
    currentAge,
    projectionYears = 20,
    monthlyDcaContribution = 0,
    forceGlobalDrip,
  } = options;

  const currentYear = new Date().getFullYear();
  const points: DividendSnowballPoint[] = [];

  const initialMetrics = calculatePortfolioMetrics(holdings);
  const initialCost = initialMetrics.totalCost || initialMetrics.totalValue || 1;

  // Year 0
  points.push({
    yearIndex: 0,
    clientAge: currentAge,
    calendarYear: currentYear,
    portfolioValueWithDrip: Math.round(initialMetrics.totalValue),
    portfolioValueWithoutDrip: Math.round(initialMetrics.totalValue),
    annualDividendsWithDrip: Math.round(initialMetrics.annualDividends),
    annualDividendsWithoutDrip: Math.round(initialMetrics.annualDividends),
    monthlyPassiveIncome: Math.round(initialMetrics.annualDividends / 12),
    cumulativeDividendsWithDrip: 0,
    yieldOnCostWithDrip: initialMetrics.portfolioYieldOnCost,
  });

  if (holdings.length === 0) {
    // Generate flat baseline if empty
    for (let yr = 1; yr <= projectionYears; yr++) {
      points.push({
        yearIndex: yr,
        clientAge: currentAge + yr,
        calendarYear: currentYear + yr,
        portfolioValueWithDrip: 0,
        portfolioValueWithoutDrip: 0,
        annualDividendsWithDrip: 0,
        annualDividendsWithoutDrip: 0,
        monthlyPassiveIncome: 0,
        cumulativeDividendsWithDrip: 0,
        yieldOnCostWithDrip: 0,
      });
    }
    return points;
  }

  // Simulation state per holding
  interface HoldingState {
    holding: StockHolding;
    currentPrice: number;
    dividendPerShare: number;
    sharesWithDrip: number;
    sharesWithoutDrip: number;
    cumulativeDividends: number;
  }

  const states: HoldingState[] = holdings.map((h) => ({
    holding: h,
    currentPrice: Number(h.currentPrice) || 1,
    dividendPerShare: Number(h.annualDividendPerShare) || 0,
    sharesWithDrip: Number(h.shares) || 0,
    sharesWithoutDrip: Number(h.shares) || 0,
    cumulativeDividends: 0,
  }));

  const totalInitialValue = initialMetrics.totalValue || 1;

  for (let yr = 1; yr <= projectionYears; yr++) {
    let yearTotalValueWithDrip = 0;
    let yearTotalValueWithoutDrip = 0;
    let yearAnnualDividendsWithDrip = 0;
    let yearAnnualDividendsWithoutDrip = 0;
    let yearTotalCumulativeDividends = 0;

    states.forEach((st) => {
      const h = st.holding;
      const priceGrowthRate = (Number(h.expectedPriceGrowthRate) || 4.5) / 100;
      const divGrowthRate = (Number(h.expectedDividendGrowthRate) || 5.0) / 100;
      const isDrip = forceGlobalDrip !== undefined ? forceGlobalDrip : (h.isDripEnabled ?? true);

      // 1. Advance share price and dividend per share for year
      st.currentPrice = st.currentPrice * (1 + priceGrowthRate);
      st.dividendPerShare = st.dividendPerShare * (1 + divGrowthRate);

      // 2. Calculate annual dividends earned by each branch
      const dividendsEarnedWithDrip = st.sharesWithDrip * st.dividendPerShare;
      const dividendsEarnedWithoutDrip = st.sharesWithoutDrip * st.dividendPerShare;

      st.cumulativeDividends += dividendsEarnedWithDrip;

      // 3. Weight monthly DCA across holdings proportionally by current value
      const holdingWeight = (st.sharesWithDrip * st.currentPrice) / (totalInitialValue || 1);
      const allocatedYearlyDca = monthlyDcaContribution * 12 * Math.max(0.1, Math.min(1.0, holdingWeight || 1 / states.length));

      // 4. Reinvestment (DRIP) and DCA share purchase
      const dcaSharesPurchased = st.currentPrice > 0 ? allocatedYearlyDca / st.currentPrice : 0;
      const dripSharesPurchased = (isDrip && st.currentPrice > 0) ? dividendsEarnedWithDrip / st.currentPrice : 0;

      st.sharesWithDrip += dripSharesPurchased + dcaSharesPurchased;
      st.sharesWithoutDrip += dcaSharesPurchased; // Without DRIP, only cash DCA buys new shares

      // 5. Aggregate totals
      yearTotalValueWithDrip += st.sharesWithDrip * st.currentPrice;
      yearTotalValueWithoutDrip += st.sharesWithoutDrip * st.currentPrice;
      yearAnnualDividendsWithDrip += dividendsEarnedWithDrip;
      yearAnnualDividendsWithoutDrip += dividendsEarnedWithoutDrip;
      yearTotalCumulativeDividends += st.cumulativeDividends;
    });

    const yieldOnCostWithDrip = initialCost > 0 ? (yearAnnualDividendsWithDrip / initialCost) * 100 : 0;

    points.push({
      yearIndex: yr,
      clientAge: currentAge + yr,
      calendarYear: currentYear + yr,
      portfolioValueWithDrip: Math.round(yearTotalValueWithDrip),
      portfolioValueWithoutDrip: Math.round(yearTotalValueWithoutDrip),
      annualDividendsWithDrip: Math.round(yearAnnualDividendsWithDrip),
      annualDividendsWithoutDrip: Math.round(yearAnnualDividendsWithoutDrip),
      monthlyPassiveIncome: Math.round(yearAnnualDividendsWithDrip / 12),
      cumulativeDividendsWithDrip: Math.round(yearTotalCumulativeDividends),
      yieldOnCostWithDrip: Math.round(yieldOnCostWithDrip * 10) / 10,
    });
  }

  return points;
}

/**
 * Calculates how much of target retirement living expenses are covered purely by dividends
 */
export function calculateRetirementCoverage(
  projectedMonthlyDividends: number,
  desiredMonthlyRetirementSpendToday: number,
  inflationRate: number = 0.025,
  yearsToRetirement: number = 25
) {
  const inflatedMonthlySpend = desiredMonthlyRetirementSpendToday * Math.pow(1 + inflationRate, Math.max(0, yearsToRetirement));
  const coveragePercent = inflatedMonthlySpend > 0 ? (projectedMonthlyDividends / inflatedMonthlySpend) * 100 : 0;

  return {
    projectedMonthlyDividends: Math.round(projectedMonthlyDividends),
    inflatedMonthlySpend: Math.round(inflatedMonthlySpend),
    coveragePercent: Math.min(999, Math.round(coveragePercent)),
    isFullyCovered: coveragePercent >= 100,
    monthlySurplusDeficit: Math.round(projectedMonthlyDividends - inflatedMonthlySpend),
  };
}

/**
 * Common popular dividend stocks / ETF presets for 1-click addition
 */
export const POPULAR_DIVIDEND_PRESETS: Omit<StockHolding, "id">[] = [
  {
    ticker: "SCHD",
    name: "Schwab US Dividend Equity ETF",
    shares: 50,
    costBasisPerShare: 76.5,
    currentPrice: 82.2,
    annualDividendPerShare: 2.74,
    dividendYield: 3.33,
    payoutFrequency: "quarterly",
    expectedDividendGrowthRate: 7.5,
    expectedPriceGrowthRate: 5.5,
    isDripEnabled: true,
    notes: "Core dividend growth ETF (Dow Jones US Dividend 100)",
  },
  {
    ticker: "O",
    name: "Realty Income Corp",
    shares: 40,
    costBasisPerShare: 52.0,
    currentPrice: 56.4,
    annualDividendPerShare: 3.16,
    dividendYield: 5.60,
    payoutFrequency: "monthly",
    expectedDividendGrowthRate: 3.2,
    expectedPriceGrowthRate: 3.0,
    isDripEnabled: true,
    notes: "The Monthly Dividend Company (S&P 500 REIT)",
  },
  {
    ticker: "D05.SI",
    name: "DBS Group Holdings",
    shares: 400,
    costBasisPerShare: 33.5,
    currentPrice: 38.8,
    annualDividendPerShare: 2.16,
    dividendYield: 5.57,
    payoutFrequency: "quarterly",
    expectedDividendGrowthRate: 6.0,
    expectedPriceGrowthRate: 4.5,
    isDripEnabled: true,
    notes: "Southeast Asia's largest bank; high regular dividend payer",
  },
  {
    ticker: "VYM",
    name: "Vanguard High Dividend Yield ETF",
    shares: 30,
    costBasisPerShare: 112.0,
    currentPrice: 122.5,
    annualDividendPerShare: 3.65,
    dividendYield: 2.98,
    payoutFrequency: "quarterly",
    expectedDividendGrowthRate: 6.2,
    expectedPriceGrowthRate: 5.0,
    isDripEnabled: true,
    notes: "Broad US high-yield equities (FTSE High Dividend Yield)",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    shares: 20,
    costBasisPerShare: 154.0,
    currentPrice: 161.0,
    annualDividendPerShare: 4.96,
    dividendYield: 3.08,
    payoutFrequency: "quarterly",
    expectedDividendGrowthRate: 5.5,
    expectedPriceGrowthRate: 4.0,
    isDripEnabled: true,
    notes: "Dividend King with 60+ consecutive years of dividend increases",
  },
];
