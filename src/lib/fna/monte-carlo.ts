import { MonteCarloSimulationResult, MonteCarloTrajectoryPoint, WeatherGrade } from "./types";

export interface MonteCarloConfig {
  startingPortfolio: number;
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy?: number;
  monthlySpendInRetirement: number;
  guaranteedMonthlyPension?: number; // e.g. CPF Life or state pension
  meanAnnualReturn?: number; // e.g. 0.065 (6.5%)
  annualVolatility?: number; // e.g. 0.12 (12% standard deviation)
  iterations?: number; // Default 1000
  simulatedEarlyCrash?: boolean; // If true, forces -25% market shock in year 1 of retirement
}

/**
 * Standard Box-Muller Gaussian Random Number Generator
 */
function gaussianRandom(mean = 0, stdev = 1): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}

/**
 * Executes a fast, client-side 1,000-run Monte Carlo stochastic simulation
 * for retirement portfolio resilience under sequence of returns risk.
 */
export function runRetirementMonteCarlo(config: MonteCarloConfig): MonteCarloSimulationResult {
  const currentAge = Math.max(18, Math.min(config.currentAge, 85));
  const retirementAge = Math.max(currentAge + 1, Math.min(config.retirementAge, 90));
  const lifeExpectancy = Math.max(retirementAge + 1, config.lifeExpectancy || 88);
  const startingPortfolio = Math.max(0, config.startingPortfolio || 0);
  const monthlyContribution = Math.max(0, config.monthlyContribution || 0);
  const monthlySpendInRetirement = Math.max(0, config.monthlySpendInRetirement || 0);
  const guaranteedMonthlyPension = Math.max(0, config.guaranteedMonthlyPension || 0);
  const meanReturn = config.meanAnnualReturn ?? 0.065; // 6.5% average
  const volatility = config.annualVolatility ?? 0.12; // 12% annual standard deviation
  const iterations = config.iterations ?? 1000;
  const simulatedEarlyCrash = config.simulatedEarlyCrash ?? false;

  const totalYears = lifeExpectancy - currentAge;
  const yearsToRetirement = retirementAge - currentAge;

  let successfulRunsCount = 0;
  const yearlySimulations: number[][] = Array.from({ length: totalYears + 1 }, () => []);

  // Record age 0 (current age) starting point
  yearlySimulations[0] = Array(iterations).fill(startingPortfolio);

  for (let iter = 0; iter < iterations; iter++) {
    let balance = startingPortfolio;
    let ranOutOfCash = false;

    for (let yr = 1; yr <= totalYears; yr++) {
      const isAccumulation = yr <= yearsToRetirement;
      const isRetirementShockYear = simulatedEarlyCrash && yr === yearsToRetirement + 1;

      // Determine return for this year
      let annualReturn: number;
      if (isRetirementShockYear) {
        annualReturn = -0.25; // Force -25% crash at start of retirement
      } else {
        annualReturn = gaussianRandom(meanReturn, volatility);
      }

      if (isAccumulation) {
        // Accumulation phase: Add savings at start of month/year and apply returns
        const annualSavings = monthlyContribution * 12;
        balance = (balance + annualSavings) * (1 + annualReturn);
      } else {
        // Decumulation phase: Withdraw living expenses minus guaranteed pensions
        const netAnnualWithdrawal = Math.max(0, (monthlySpendInRetirement - guaranteedMonthlyPension) * 12);
        balance = (balance - netAnnualWithdrawal) * (1 + annualReturn);
      }

      if (balance <= 0) {
        balance = 0;
        ranOutOfCash = true;
      }

      yearlySimulations[yr].push(Math.round(balance));
    }

    if (!ranOutOfCash && balance > 0) {
      successfulRunsCount++;
    }
  }

  // Calculate Percentiles (10th = worst crash, 50th = median, 90th = bull market)
  const trajectories: MonteCarloTrajectoryPoint[] = [];
  const currentCalendarYear = new Date().getFullYear();
  let worstCaseDepletionAge: number | null = null;

  for (let yr = 0; yr <= totalYears; yr++) {
    const age = currentAge + yr;
    const year = currentCalendarYear + yr;
    const sortedBalances = [...yearlySimulations[yr]].sort((a, b) => a - b);

    const idx10 = Math.floor(iterations * 0.1);
    const idx50 = Math.floor(iterations * 0.5);
    const idx90 = Math.floor(iterations * 0.9);

    const p10 = sortedBalances[idx10] ?? 0;
    const p50 = sortedBalances[idx50] ?? 0;
    const p90 = sortedBalances[idx90] ?? 0;

    if (p10 === 0 && worstCaseDepletionAge === null && age > retirementAge) {
      worstCaseDepletionAge = age;
    }

    trajectories.push({
      age,
      year,
      percentile10: Math.round(p10),
      percentile50: Math.round(p50),
      percentile90: Math.round(p90),
      zeroLine: 0,
    });
  }

  const successRate = Math.round((successfulRunsCount / iterations) * 100);
  const medianFinalNestEgg = trajectories[trajectories.length - 1]?.percentile50 ?? 0;

  // Derive human-readable Weather Grade and narrative
  let weatherGrade: WeatherGrade;
  let weatherTitle: string;
  let weatherDescription: string;

  if (successRate >= 90) {
    weatherGrade = "sunny";
    weatherTitle = "☀️ Sunny & Bulletproof";
    weatherDescription = "Your retirement plan is exceptionally resilient. Funds survive even severe prolonged market crashes.";
  } else if (successRate >= 75) {
    weatherGrade = "mild";
    weatherTitle = "⛅ Partly Cloudy (Safe)";
    weatherDescription = "Strong foundation. You may only need to trim discretionary lifestyle spending during rare bad market years.";
  } else if (successRate >= 50) {
    weatherGrade = "cloudy";
    weatherTitle = "🌧️ Rainy (Moderate Risk)";
    weatherDescription = `In ${100 - successRate}% of simulated market lifelines, funds depleted prematurely. A modest monthly savings boost will secure this.`;
  } else {
    weatherGrade = "stormy";
    weatherTitle = "⛈️ Storm Warning (High Risk)";
    weatherDescription = "High probability of outliving your nest egg. Adjusting your retirement age or monthly savings is strongly recommended.";
  }

  return {
    successRate,
    weatherGrade,
    weatherTitle,
    weatherDescription,
    medianFinalNestEgg,
    worstCaseDepletionAge,
    totalSimulationsRun: iterations,
    parameters: {
      startingPortfolio,
      monthlyContribution,
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlySpendInRetirement,
      guaranteedMonthlyPension,
      meanAnnualReturn: meanReturn,
      annualVolatility: volatility,
    },
    trajectories,
  };
}
