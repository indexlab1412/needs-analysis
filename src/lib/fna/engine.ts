import {
  UserFinancialProfile,
  FNAReportSummary,
  ShortfallResult,
  InvestmentTrajectoryPoint,
  LoanRundownPoint,
  AssetItem,
  LiabilityItem,
  FinancialGoal,
  ComputedGoalSummary,
  IllnessShieldAnalysis,
  MonteCarloSimulationResult,
} from "./types";
import { runRetirementMonteCarlo } from "./monte-carlo";

/**
 * Calculates Future Value with compounding: FV = PV * (1 + r)^n
 */
export function calculateFutureValue(presentValue: number, annualRate: number, years: number): number {
  if (years <= 0) return presentValue;
  return presentValue * Math.pow(1 + annualRate, years);
}

/**
 * Calculates Present Value of an Annuity (Lump sum needed for regular income)
 */
export function calculateCapitalRequiredForAnnuity(
  annualExpensesAtRetirement: number,
  yearsInRetirement: number,
  postRetirementRealReturnRate: number
): number {
  if (yearsInRetirement <= 0) return 0;
  if (Math.abs(postRetirementRealReturnRate) < 0.001) {
    return annualExpensesAtRetirement * yearsInRetirement;
  }
  const r = postRetirementRealReturnRate;
  const n = yearsInRetirement;
  return annualExpensesAtRetirement * ((1 - Math.pow(1 + r, -n)) / r);
}

/**
 * Future value of regular monthly savings contributions compounded annually
 */
export function calculateFutureValueOfRegularSavings(
  monthlyContribution: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0 || monthlyContribution <= 0) return 0;
  if (annualRate <= 0.001) return monthlyContribution * 12 * years;
  const annualSavings = monthlyContribution * 12;
  return annualSavings * ((Math.pow(1 + annualRate, years) - 1) / annualRate);
}

/**
 * Calculates monthly savings needed to reach a future lump sum
 */
export function calculateMonthlySavingsNeeded(
  targetFutureValue: number,
  currentSavings: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0) return 0;
  const grownCurrentSavings = calculateFutureValue(currentSavings, annualRate, years);
  const remainingGap = Math.max(0, targetFutureValue - grownCurrentSavings);
  if (remainingGap <= 0) return 0;

  if (annualRate <= 0.001) {
    return Math.round(remainingGap / (years * 12));
  }

  // PMT = Gap * r / [((1 + r)^n - 1) * 12]
  const annualSavings = (remainingGap * annualRate) / (Math.pow(1 + annualRate, years) - 1);
  return Math.round(annualSavings / 12);
}

/**
 * Generates year-by-year DCA investment compounding projection
 */
export function generateInvestmentTrajectory(
  assets: AssetItem[],
  currentAge: number,
  targetRetirementAge: number,
  fallbackRate: number,
  insurancePolicies?: { currentCashValue?: number; projectedRetirementMaturityValue?: number; policyType?: string }[]
): InvestmentTrajectoryPoint[] {
  const currentYear = new Date().getFullYear();
  const maxYears = Math.max(5, Math.min(45, (targetRetirementAge || 60) - currentAge));
  const trajectory: InvestmentTrajectoryPoint[] = [];

  const initialAssetPrincipal = assets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
  const initialPolicyCash = (insurancePolicies || []).reduce((sum, p) => sum + (Number(p.currentCashValue) || 0), 0);
  const initialPrincipal = initialAssetPrincipal + initialPolicyCash;

  trajectory.push({
    yearIndex: 0,
    clientAge: currentAge,
    calendarYear: currentYear,
    totalInvestedPrincipal: Math.round(initialPrincipal),
    projectedValue: Math.round(initialPrincipal),
    totalCompoundedGains: 0,
  });

  for (let year = 1; year <= maxYears; year++) {
    let yearTotalPrincipal = 0;
    let yearTotalProjected = 0;

    // Assets & Robos
    assets.forEach((asset) => {
      const startingVal = Number(asset.currentValue) || 0;
      const monthlyDCA = Number(asset.monthlyContribution) || 0;
      const rate = (Number(asset.expectedReturnRate) || fallbackRate || 6.0) / 100;

      const grownStarting = startingVal * Math.pow(1 + rate, year);
      let grownDCA = 0;
      if (monthlyDCA > 0) {
        grownDCA = calculateFutureValueOfRegularSavings(monthlyDCA, rate, year);
      }

      const assetPrincipal = startingVal + (monthlyDCA * 12 * year);
      const assetProjected = grownStarting + grownDCA;

      yearTotalPrincipal += assetPrincipal;
      yearTotalProjected += assetProjected;
    });

    // Insurance Cash Value Policies (e.g. Whole Life & Endowment)
    (insurancePolicies || []).forEach((pol) => {
      const pCash = Number(pol.currentCashValue) || 0;
      if (pCash > 0) {
        const rate = 0.035;
        const pGrown = pCash * Math.pow(1 + rate, year);
        yearTotalPrincipal += pCash;
        yearTotalProjected += pGrown;
      }
    });

    const totalGains = Math.max(0, yearTotalProjected - yearTotalPrincipal);

    trajectory.push({
      yearIndex: year,
      clientAge: currentAge + year,
      calendarYear: currentYear + year,
      totalInvestedPrincipal: Math.round(yearTotalPrincipal),
      projectedValue: Math.round(yearTotalProjected),
      totalCompoundedGains: Math.round(totalGains),
    });
  }

  return trajectory;
}

/**
 * Generates loan amortization run-down schedule year-by-year
 */
export function generateLoanPayoffTrajectory(
  liabilities: LiabilityItem[],
  currentAge: number
): { trajectory: LoanRundownPoint[]; totalLifetimeInterest: number } {
  const currentYear = new Date().getFullYear();
  const trajectory: LoanRundownPoint[] = [];

  const initialTotalBalance = liabilities.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);

  if (initialTotalBalance <= 0) {
    return {
      trajectory: [
        {
          yearIndex: 0,
          clientAge: currentAge,
          remainingBalance: 0,
          principalPaidToDate: 0,
          interestPaidToDate: 0,
          yearlyRepaymentTotal: 0,
        },
      ],
      totalLifetimeInterest: 0,
    };
  }

  interface SimLoan {
    balance: number;
    monthlyPayment: number;
    monthlyRate: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
  }

  const activeLoans: SimLoan[] = liabilities.map((l) => {
    const bal = Number(l.outstandingBalance) || 0;
    const rateAnnual = (Number(l.interestRate) || 3.0) / 100;
    const mRate = rateAnnual / 12;
    let payment = Number(l.monthlyRepayment) || 0;

    const minInterest = bal * mRate;
    if (payment <= minInterest) {
      const tenureMonths = ((l.tenureYearsRemaining || 20) * 12);
      payment = mRate > 0
        ? (bal * (mRate * Math.pow(1 + mRate, tenureMonths))) / (Math.pow(1 + mRate, tenureMonths) - 1)
        : bal / tenureMonths;
    }

    return {
      balance: bal,
      monthlyPayment: payment,
      monthlyRate: mRate,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
    };
  });

  trajectory.push({
    yearIndex: 0,
    clientAge: currentAge,
    remainingBalance: Math.round(initialTotalBalance),
    principalPaidToDate: 0,
    interestPaidToDate: 0,
    yearlyRepaymentTotal: 0,
  });

  let totalLifetimeInterest = 0;
  let year = 1;
  const maxSimYears = 35;

  while (year <= maxSimYears) {
    let yearlyRepayment = 0;

    for (let m = 0; m < 12; m++) {
      activeLoans.forEach((loan) => {
        if (loan.balance > 0) {
          const interestMonth = loan.balance * loan.monthlyRate;
          let payment = Math.min(loan.monthlyPayment, loan.balance + interestMonth);
          const principalMonth = Math.max(0, payment - interestMonth);

          loan.balance = Math.max(0, loan.balance - principalMonth);
          loan.totalInterestPaid += interestMonth;
          loan.totalPrincipalPaid += principalMonth;
          totalLifetimeInterest += interestMonth;
          yearlyRepayment += payment;
        }
      });
    }

    const currentRemBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
    const currentPrincipalPaid = activeLoans.reduce((sum, l) => sum + l.totalPrincipalPaid, 0);
    const currentInterestPaid = activeLoans.reduce((sum, l) => sum + l.totalInterestPaid, 0);

    trajectory.push({
      yearIndex: year,
      clientAge: currentAge + year,
      remainingBalance: Math.round(currentRemBalance),
      principalPaidToDate: Math.round(currentPrincipalPaid),
      interestPaidToDate: Math.round(currentInterestPaid),
      yearlyRepaymentTotal: Math.round(yearlyRepayment),
    });

    if (currentRemBalance <= 0) {
      break;
    }
    year++;
  }

  return {
    trajectory,
    totalLifetimeInterest: Math.round(totalLifetimeInterest),
  };
}

/**
 * 3-Bucket Goal Computation
 */
export function computeGoalSummaries(goals: FinancialGoal[], generalInflationRate: number): ComputedGoalSummary[] {
  const infRate = (generalInflationRate || 3.0) / 100;

  return goals.map((goal) => {
    const years = Math.max(0.5, Number(goal.targetYearsFromNow) || 2);
    const targetToday = Number(goal.targetAmount) || 0;
    const currentSaved = Number(goal.currentSavingsAssigned) || 0;

    let targetFuture = targetToday;
    let assumedRoi = 0.032;
    let strategyDesc = "High-Yield Bank Account / Cash Fund (Capital Preservation)";

    if (goal.horizonBucket === "short_term" || years <= 3) {
      // Short term: 0-3 years -> minimal inflation, focus on capital safety
      targetFuture = targetToday;
      assumedRoi = 0.032; // 3.2% HYSA / Money market
      strategyDesc = "High-Yield Bank Account / Money Market Fund (Safe Cash)";
    } else if (goal.horizonBucket === "mid_term" || years <= 7) {
      // Mid term: 3-7 years -> moderate inflation, balanced growth
      targetFuture = Math.round(calculateFutureValue(targetToday, infRate, years));
      assumedRoi = 0.045; // 4.5% Balanced
      strategyDesc = "Balanced Robo-Advisor / Short-Term Bonds (4.5% p.a.)";
    } else {
      // Long term: 7+ years -> full inflation compounding, equity growth
      targetFuture = Math.round(calculateFutureValue(targetToday, infRate, years));
      assumedRoi = 0.070; // 7.0% Equities
      strategyDesc = "Global Equity Index ETFs / Growth Robo (7.0% p.a.)";
    }

    const monthlyNeeded = calculateMonthlySavingsNeeded(targetFuture, currentSaved, assumedRoi, years);
    const progressPct = targetFuture > 0 ? Math.min(100, Math.round((currentSaved / targetFuture) * 100)) : 100;

    return {
      goal,
      targetAmountFuture: targetFuture,
      monthlySavingsNeeded: monthlyNeeded,
      status: progressPct >= 100 ? "on_track" : "funding_needed",
      progressPercentage: progressPct,
      recommendedStrategy: strategyDesc,
    };
  });
}

/**
 * Core Financial Needs Analysis Engine
 */
export function analyzeFinancialNeeds(profile: UserFinancialProfile): FNAReportSummary {
  const { assumptions } = profile;

  // 1. CASH FLOW & MONTHLY TOTALS
  const totalMonthlyIncome = profile.incomes.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
  const totalMonthlyExpenses = profile.expenses.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
  const essentialMonthlyExpenses = profile.expenses
    .filter((e) => e.isEssential)
    .reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0) || (totalMonthlyExpenses * 0.75);

  const totalMonthlyDCAInvestments = profile.assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);

  const monthlyNetSavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRatePercentage = totalMonthlyIncome > 0
    ? Math.max(0, Math.round((monthlyNetSavings / totalMonthlyIncome) * 100))
    : 0;

  // 2. ASSETS & LIABILITIES (NET WORTH)
  const totalDirectAssets = profile.assets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
  const totalPolicyCashValues = profile.insurancePolicies.reduce(
    (sum, p) => sum + (Number(p.currentCashValue) || 0),
    0
  );
  const totalAssets = totalDirectAssets + totalPolicyCashValues;

  const liquidAssets = profile.assets
    .filter((a) => a.isLiquid || a.category === "cash_savings" || a.category === "fixed_deposit")
    .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
  const illiquidAssets = Math.max(0, totalAssets - liquidAssets);

  const totalLiabilities = profile.liabilities.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);
  const totalMonthlyDebtRepayment = profile.liabilities.reduce((sum, l) => sum + (Number(l.monthlyRepayment) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtToIncomeRatio = totalMonthlyIncome > 0
    ? Math.round((totalMonthlyDebtRepayment / totalMonthlyIncome) * 100)
    : 0;

  // 3. EXISTING INSURANCE COVERAGE
  const existingDeathBenefit = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.deathBenefit) || 0), 0);
  const existingCiBenefit = profile.insurancePolicies.reduce(
    (sum, p) => sum + Math.max(Number(p.majorCiBenefit) || 0, Number(p.earlyCiBenefit) || 0),
    0
  );

  // 4. SHORTFALL CALCULATIONS

  // A. Emergency Fund
  const targetEmergencyMonths = assumptions.emergencyFundMonthsTarget || (profile.employmentType === "self-employed" ? 9 : 6);
  const requiredEmergencyFund = Math.round(essentialMonthlyExpenses * targetEmergencyMonths);
  const existingEmergencyFund = liquidAssets;
  const emergencyShortfall = Math.max(0, requiredEmergencyFund - existingEmergencyFund);
  const emergencyRatio = requiredEmergencyFund > 0 ? Math.min(150, Math.round((existingEmergencyFund / requiredEmergencyFund) * 100)) : 100;
  
  const emergencyStatus: ShortfallResult["status"] =
    emergencyRatio >= 100 ? "on_track" : emergencyRatio >= 50 ? "warning" : "critical";

  const emergencyResult: ShortfallResult = {
    category: "emergency_fund",
    title: "Emergency Safety Stash",
    subtitle: `${targetEmergencyMonths} months of basic living expenses kept in ready cash`,
    requiredAmount: requiredEmergencyFund,
    existingAmount: existingEmergencyFund,
    shortfallAmount: emergencyShortfall,
    status: emergencyStatus,
    coverageRatio: emergencyRatio,
    recommendation: emergencyShortfall > 0
      ? `Try to save another ${profile.currency} ${emergencyShortfall.toLocaleString()} in a high-yield bank account for a solid ${targetEmergencyMonths}-month safety net.`
      : `Awesome! You have ${Math.round(existingEmergencyFund / (essentialMonthlyExpenses || 1))} months of emergency cash buffer in your bank.`,
    breakdown: [
      { label: "Essential Bills & Food per Month", value: essentialMonthlyExpenses },
      { label: "Recommended Safety Runway", value: `${targetEmergencyMonths} Months` },
      { label: "Cash You Currently Have Ready", value: existingEmergencyFund },
    ],
  };

  // B. Income Safety Net & Family Backup
  const familySupportYears = assumptions.familySupportYearsTarget || (profile.dependents.length > 0 ? 15 : 5);
  const annualFamilySupport = totalMonthlyExpenses * 12 * (profile.dependents.length > 0 ? 0.75 : 0.4);
  const totalFamilySupportNeeded = annualFamilySupport * familySupportYears;
  const totalChildEducationNeeded = profile.dependents.reduce((sum, dep) => sum + (Number(dep.tertiaryEducationTarget) || 0), 0);

  const totalLifeProtectionNeeded = Math.round(totalLiabilities + totalFamilySupportNeeded + totalChildEducationNeeded);
  const totalExistingLifeProtection = existingDeathBenefit;
  const lifeShortfall = Math.max(0, totalLifeProtectionNeeded - totalExistingLifeProtection);
  const lifeRatio = totalLifeProtectionNeeded > 0
    ? Math.min(200, Math.round((totalExistingLifeProtection / totalLifeProtectionNeeded) * 100))
    : 100;

  const lifeStatus: ShortfallResult["status"] =
    lifeRatio >= 100 ? "on_track" : lifeRatio >= 60 ? "warning" : "critical";

  const lifeResult: ShortfallResult = {
    category: "life_protection",
    title: "Income Safety Net & Family Backup",
    subtitle: "Clears your debts & takes care of loved ones if you can't work",
    requiredAmount: totalLifeProtectionNeeded,
    existingAmount: totalExistingLifeProtection,
    shortfallAmount: lifeShortfall,
    status: lifeStatus,
    coverageRatio: lifeRatio,
    recommendation: lifeShortfall > 0
      ? `Protection gap of ${profile.currency} ${lifeShortfall.toLocaleString()}. A simple term-life insurance policy keeps costs low while protecting your loans and family.`
      : `You have enough insurance in place so your family and loans are 100% protected.`,
    breakdown: [
      { label: "All Loans & Debts to Clear", value: totalLiabilities },
      { label: `Family Living Support (${familySupportYears} Years)`, value: totalFamilySupportNeeded },
      { label: "Future Kids Education Goal", value: totalChildEducationNeeded },
      { label: "Insurance Payout Currently Covered", value: totalExistingLifeProtection },
    ],
  };

  // C. Major Illness Recovery Fund
  const ciYears = assumptions.ciIncomeReplacementYears || 4;
  const annualIncome = totalMonthlyIncome * 12;
  const requiredCiCover = Math.round(annualIncome * ciYears);
  const existingCiCover = existingCiBenefit;
  const ciShortfall = Math.max(0, requiredCiCover - existingCiCover);
  const ciRatio = requiredCiCover > 0 ? Math.min(200, Math.round((existingCiCover / requiredCiCover) * 100)) : 100;

  const ciStatus: ShortfallResult["status"] =
    ciRatio >= 100 ? "on_track" : ciRatio >= 50 ? "warning" : "critical";

  const ciResult: ShortfallResult = {
    category: "critical_illness",
    title: "Major Illness Recovery Fund",
    subtitle: `${ciYears} years of salary replacement so you can rest and heal without money stress`,
    requiredAmount: requiredCiCover,
    existingAmount: existingCiCover,
    shortfallAmount: ciShortfall,
    status: ciStatus,
    coverageRatio: ciRatio,
    recommendation: ciShortfall > 0
      ? `Gap of ${profile.currency} ${ciShortfall.toLocaleString()}. Critical Illness coverage pays cash directly to you so you can take time off work to recover comfortably.`
      : `Great job! You have enough illness protection to replace your income while recovering.`,
    breakdown: [
      { label: "Your Yearly Income", value: annualIncome },
      { label: `Recovery Target (${ciYears} Years Income)`, value: requiredCiCover },
      { label: "Current Critical Illness Insurance", value: existingCiCover },
    ],
  };

  // D. Financial Freedom & Retirement (Today's Monthly Dollar + CPF LIFE Annuity Model)
  const currentAge = profile.currentAge || 24;
  const retirementAge = Math.max(currentAge + 1, profile.targetRetirementAge || 58);
  const lifeExpectancy = Math.max(retirementAge + 5, profile.lifeExpectancy || 88);
  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const yearsInRetirement = Math.max(5, lifeExpectancy - retirementAge);

  // Today's monthly spending preference
  const todayMonthlySpend = profile.desiredMonthlyRetirementSpendToday && profile.desiredMonthlyRetirementSpendToday > 0
    ? profile.desiredMonthlyRetirementSpendToday
    : Math.max(1500, Math.round(totalMonthlyExpenses * 0.70));

  const generalInflation = (assumptions.generalInflationRate || 3.0) / 100;
  const futureMonthlyExpensesAtRetirement = calculateFutureValue(
    todayMonthlySpend,
    generalInflation,
    yearsToRetirement
  );

  // CPF LIFE / Annuity Floor Calculations
  const hasCpfLifeFloor = profile.cpfLife?.isEnabled !== false;
  const cpfMonthlyPayoutToday = hasCpfLifeFloor ? (profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) : 0;
  const cpfPayoutStartAge = profile.cpfLife?.payoutStartAge || 65;
  const yearsToCpfPayout = Math.max(0, cpfPayoutStartAge - currentAge);
  const cpfMonthlyPayoutFuture = calculateFutureValue(cpfMonthlyPayoutToday, generalInflation, yearsToCpfPayout);

  const privateMonthlySpendNeededToday = Math.max(0, todayMonthlySpend - cpfMonthlyPayoutToday);
  const privateMonthlySpendNeededFuture = calculateFutureValue(
    privateMonthlySpendNeededToday,
    generalInflation,
    yearsToRetirement
  );

  const postRetireYield = (assumptions.postRetirementReturnRate || 3.5) / 100;
  const realDiscountRate = (1 + postRetireYield) / (1 + generalInflation) - 1;

  let requiredRetirementNestEgg = 0;
  if (!hasCpfLifeFloor || cpfMonthlyPayoutToday <= 0) {
    // 100% private funding needed
    requiredRetirementNestEgg = Math.round(
      calculateCapitalRequiredForAnnuity(futureMonthlyExpensesAtRetirement * 12, yearsInRetirement, realDiscountRate)
    );
  } else if (retirementAge < cpfPayoutStartAge) {
    // Early retirement with Bridge Years before Age 65
    const bridgeYears = Math.min(yearsInRetirement, cpfPayoutStartAge - retirementAge);
    const postCpfYears = Math.max(0, yearsInRetirement - bridgeYears);

    const bridgeLumpSum = calculateCapitalRequiredForAnnuity(
      futureMonthlyExpensesAtRetirement * 12,
      bridgeYears,
      realDiscountRate
    );

    const postCpfLumpSum = postCpfYears > 0
      ? calculateCapitalRequiredForAnnuity(
          privateMonthlySpendNeededFuture * 12,
          postCpfYears,
          realDiscountRate
        ) / Math.pow(1 + postRetireYield, bridgeYears)
      : 0;

    requiredRetirementNestEgg = Math.round(bridgeLumpSum + postCpfLumpSum);
  } else {
    // Retiring at or after Age 65: CPF LIFE covers baseline from day 1
    requiredRetirementNestEgg = Math.round(
      calculateCapitalRequiredForAnnuity(
        privateMonthlySpendNeededFuture * 12,
        yearsInRetirement,
        realDiscountRate
      )
    );
  }

  // Investment Projections Trajectory
  const investmentGrowthTrajectory = generateInvestmentTrajectory(
    profile.assets,
    currentAge,
    retirementAge,
    assumptions.investmentReturnRate,
    profile.insurancePolicies
  );

  const finalProjectedRetirementPoint = investmentGrowthTrajectory[investmentGrowthTrajectory.length - 1];
  const totalProjectedRetirementFund = finalProjectedRetirementPoint ? finalProjectedRetirementPoint.projectedValue : 0;

  const retirementShortfall = Math.max(0, requiredRetirementNestEgg - totalProjectedRetirementFund);
  const retirementRatio = requiredRetirementNestEgg > 0
    ? Math.min(200, Math.round((totalProjectedRetirementFund / requiredRetirementNestEgg) * 100))
    : 100;

  const retirementStatus: ShortfallResult["status"] =
    retirementRatio >= 100 ? "on_track" : retirementRatio >= 65 ? "warning" : "critical";

  const suggestedMonthlyBoost = Math.round(retirementShortfall / (yearsToRetirement * 12 * 1.5));

  const retirementResult: ShortfallResult = {
    category: "retirement",
    title: "Financial Freedom & Retirement Goal",
    subtitle: `Target ${profile.currency} ${todayMonthlySpend.toLocaleString()}/mo (${hasCpfLifeFloor ? `incl. ${profile.currency} ${cpfMonthlyPayoutToday.toLocaleString()}/mo CPF LIFE` : "100% private"})`,
    requiredAmount: requiredRetirementNestEgg,
    existingAmount: totalProjectedRetirementFund,
    shortfallAmount: retirementShortfall,
    status: retirementStatus,
    coverageRatio: retirementRatio,
    recommendation: retirementShortfall > 0
      ? `To comfortably fund your ${profile.currency} ${todayMonthlySpend.toLocaleString()}/mo retirement (with CPF LIFE covering the first ${profile.currency} ${cpfMonthlyPayoutToday.toLocaleString()}/mo), auto-investing an extra ${profile.currency} ${suggestedMonthlyBoost.toLocaleString()}/month across your robo-advisors or index ETFs will close the remaining private gap easily!`
      : `You're in great shape! Between CPF LIFE and your compounding investments, your retirement is 100% on track.`,
    breakdown: [
      { label: "Target Monthly Spend in Today's Value", value: todayMonthlySpend },
      { label: "Guaranteed CPF LIFE Floor (from Age 65)", value: hasCpfLifeFloor ? cpfMonthlyPayoutToday : "None" as any },
      { label: "Remaining Private Monthly Need Today", value: privateMonthlySpendNeededToday },
      { label: `Years in Retirement (to Age ${lifeExpectancy})`, value: `${yearsInRetirement} Years` },
      { label: "Private Nest Egg Lump Sum Required", value: requiredRetirementNestEgg },
      { label: "Projected Compounded Value with DCA", value: totalProjectedRetirementFund },
    ],
  };

  // E. Kids College Fund (if dependents exist)
  let educationResult: ShortfallResult | null = null;
  if (profile.dependents.length > 0) {
    const eduInflation = (assumptions.educationInflationRate || 5.0) / 100;
    let totalTargetFutureEdu = 0;
    let totalAssignedEduSavings = 0;

    profile.dependents.forEach((dep) => {
      const target = Number(dep.tertiaryEducationTarget) || 0;
      const years = Math.max(0, Number(dep.yearsToTertiary) || (18 - (dep.age || 0)));
      if (target > 0) {
        totalTargetFutureEdu += calculateFutureValue(target, eduInflation, years);
      }
    });

    const eduGoals = profile.goals.filter((g) => g.category === "education");
    totalAssignedEduSavings = eduGoals.reduce((sum, g) => sum + (Number(g.currentSavingsAssigned) || 0), 0);

    const eduShortfall = Math.max(0, Math.round(totalTargetFutureEdu - totalAssignedEduSavings));
    const eduRatio = totalTargetFutureEdu > 0
      ? Math.min(200, Math.round((totalAssignedEduSavings / totalTargetFutureEdu) * 100))
      : 100;

    const eduStatus: ShortfallResult["status"] =
      eduRatio >= 100 ? "on_track" : eduRatio >= 50 ? "warning" : "critical";

    if (totalTargetFutureEdu > 0) {
      educationResult = {
        category: "education",
        title: "Kids' College Education Fund",
        subtitle: `Compounded with university inflation`,
        requiredAmount: Math.round(totalTargetFutureEdu),
        existingAmount: Math.round(totalAssignedEduSavings),
        shortfallAmount: eduShortfall,
        status: eduStatus,
        coverageRatio: eduRatio,
        recommendation: eduShortfall > 0
          ? `Gap of ${profile.currency} ${eduShortfall.toLocaleString()}. Putting aside a small amount each month early on lets compounding do the work for their tuition.`
          : `College funds are on track!`,
        breakdown: [
          { label: "Estimated Future University Cost", value: Math.round(totalTargetFutureEdu) },
          { label: "Savings Set Aside for College", value: Math.round(totalAssignedEduSavings) },
        ],
      };
    }
  }

  const shortfalls: ShortfallResult[] = [
    emergencyResult,
    lifeResult,
    ciResult,
    retirementResult,
  ];
  if (educationResult) {
    shortfalls.push(educationResult);
  }

  // 5. LOAN RUNDOWN / AMORTIZATION
  const { trajectory: loanPayoffTrajectory, totalLifetimeInterest: totalLoanInterestLifetime } = generateLoanPayoffTrajectory(
    profile.liabilities,
    currentAge
  );

  // 6. 3-BUCKET GOAL PLANNING CALCULATIONS
  const computedGoals = computeGoalSummaries(profile.goals, assumptions.generalInflationRate);

  // --- FEATURE #1: ILLNESS & INCOME SHIELD (MULTI-TIER PROTECTION) ---
  const existingEarlyCiBenefit = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.earlyCiBenefit) || 0), 0);
  const existingMajorCiBenefit = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.majorCiBenefit) || 0), 0);
  const existingDisabilityIncome = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.disabilityIncomeMonthly) || 0), 0);

  // 1. Early-Stage Recovery Buffer (18 Months of Gross Income)
  const earlyNeeded = Math.round(totalMonthlyIncome * 18);
  const earlyGap = Math.max(0, earlyNeeded - existingEarlyCiBenefit);
  const earlyCoverageRatio = earlyNeeded > 0 ? Math.min(200, Math.round((existingEarlyCiBenefit / earlyNeeded) * 100)) : 100;
  const earlyMonthsSupported = totalMonthlyIncome > 0 ? Math.round((existingEarlyCiBenefit / totalMonthlyIncome) * 10) / 10 : 0;
  const earlyStatus: "critical" | "warning" | "on_track" | "surplus" =
    earlyCoverageRatio >= 100 ? "on_track" : earlyCoverageRatio >= 50 ? "warning" : "critical";

  // 2. Major-Stage Family Reset Fund (5 Years Expenses + $50k treatment buffer)
  const majorNeeded = Math.round(totalMonthlyExpenses * 12 * 5 + 50000);
  const majorGap = Math.max(0, majorNeeded - existingMajorCiBenefit);
  const majorCoverageRatio = majorNeeded > 0 ? Math.min(200, Math.round((existingMajorCiBenefit / majorNeeded) * 100)) : 100;
  const majorYearsSupported = (totalMonthlyExpenses * 12) > 0 ? Math.round((existingMajorCiBenefit / (totalMonthlyExpenses * 12)) * 10) / 10 : 0;
  const majorStatus: "critical" | "warning" | "on_track" | "surplus" =
    majorCoverageRatio >= 100 ? "on_track" : majorCoverageRatio >= 60 ? "warning" : "critical";

  // 3. Monthly Paycheck Shield (75% of pre-disability income)
  const paycheckNeededMonthly = Math.round(totalMonthlyIncome * 0.75);
  const paycheckGapMonthly = Math.max(0, paycheckNeededMonthly - existingDisabilityIncome);
  const paycheckCoverageRatio = paycheckNeededMonthly > 0 ? Math.min(200, Math.round((existingDisabilityIncome / paycheckNeededMonthly) * 100)) : 100;
  const paycheckStatus: "critical" | "warning" | "on_track" | "surplus" =
    paycheckCoverageRatio >= 100 ? "on_track" : paycheckCoverageRatio >= 50 ? "warning" : "critical";

  // 4. Medical Inflation Future Projections
  const medInflation = (assumptions.medicalInflationRate || 10.0) / 100;
  const baseBillToday = 30000;
  const billIn10Years = Math.round(calculateFutureValue(baseBillToday, medInflation, 10));
  const billIn20Years = Math.round(calculateFutureValue(baseBillToday, medInflation, 20));
  const estimatedMultiplierIn20Years = Math.round((billIn20Years / baseBillToday) * 10) / 10;

  let plainSummaryTakeaway = "";
  if (earlyMonthsSupported >= 18 && majorYearsSupported >= 5) {
    plainSummaryTakeaway = "Your illness safety net is rock solid. You have over 18 months of recovery time and 5+ years of family expenses covered.";
  } else if (earlyMonthsSupported < 6) {
    plainSummaryTakeaway = `If an unexpected illness requires 1 year off work, current insurance would only cover ${earlyMonthsSupported} months before you dip into personal savings.`;
  } else {
    plainSummaryTakeaway = `You have ${earlyMonthsSupported} months of early recovery cushion and ${majorYearsSupported} years of family reset funds covered.`;
  }

  const illnessShield: IllnessShieldAnalysis = {
    earlyStageRecovery: {
      needed: earlyNeeded,
      existing: existingEarlyCiBenefit,
      gap: earlyGap,
      coverageRatio: earlyCoverageRatio,
      monthsSupported: earlyMonthsSupported,
      supportTargetMonths: 18,
      status: earlyStatus,
    },
    majorStageReset: {
      needed: majorNeeded,
      existing: existingMajorCiBenefit,
      gap: majorGap,
      coverageRatio: majorCoverageRatio,
      yearsSupported: majorYearsSupported,
      supportTargetYears: 5,
      status: majorStatus,
    },
    monthlyPaycheckShield: {
      neededMonthly: paycheckNeededMonthly,
      existingMonthly: existingDisabilityIncome,
      gapMonthly: paycheckGapMonthly,
      coverageRatio: paycheckCoverageRatio,
      replacementPercent: 75,
      status: paycheckStatus,
    },
    medicalInflationProjection: {
      baseBillToday,
      billIn10Years,
      billIn20Years,
      annualMedicalInflationRate: assumptions.medicalInflationRate || 10.0,
      estimatedMultiplierIn20Years,
    },
    plainSummaryTakeaway,
  };

  // --- FEATURE #2: MONTE CARLO RETIREMENT SIMULATION ---
  const monteCarloRetirement = runRetirementMonteCarlo({
    startingPortfolio: totalAssets,
    monthlyContribution: totalMonthlyDCAInvestments,
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlySpendInRetirement: Math.round(futureMonthlyExpensesAtRetirement),
    guaranteedMonthlyPension: Math.round(cpfMonthlyPayoutFuture),
    meanAnnualReturn: (assumptions.investmentReturnRate || 6.5) / 100,
    annualVolatility: 0.12,
    iterations: 1000,
  });

  // 7. OVERALL FINANCIAL FITNESS SCORE
  let score = 0;
  score += Math.min(20, (emergencyRatio / 100) * 20);
  score += Math.min(20, (savingsRatePercentage / 25) * 20);
  score += debtToIncomeRatio <= 35 ? 15 : Math.max(0, 15 - ((debtToIncomeRatio - 35) / 5));
  score += Math.min(15, (lifeRatio / 100) * 15);
  score += Math.min(15, (ciRatio / 100) * 15);
  score += Math.min(15, (retirementRatio / 100) * 15);
  const overallFinancialHealthScore = Math.max(10, Math.min(100, Math.round(score)));

  // Relatable Action Tips
  const keyActionItems: string[] = [];
  if (emergencyShortfall > 0) {
    keyActionItems.push(`Build up ${profile.currency} ${emergencyShortfall.toLocaleString()} in high-yield cash for your ${targetEmergencyMonths}-month emergency stash.`);
  }
  if (lifeShortfall > 0) {
    keyActionItems.push(`Get a low-cost Term Life insurance plan to cover ${profile.currency} ${lifeShortfall.toLocaleString()} for student loans/debts and family.`);
  }
  if (ciShortfall > 0) {
    keyActionItems.push(`Add ${profile.currency} ${ciShortfall.toLocaleString()} in Critical Illness cover to protect your salary if illness takes you away from work.`);
  }
  if (retirementShortfall > 0) {
    keyActionItems.push(`Start auto-investing ${profile.currency} ${suggestedMonthlyBoost.toLocaleString()}/month across your robo-advisors or ETF portfolios.`);
  }

  // Goal-specific action items
  computedGoals.filter((cg) => cg.status === "funding_needed" && cg.monthlySavingsNeeded > 0).slice(0, 2).forEach((cg) => {
    keyActionItems.push(`Save ${profile.currency} ${cg.monthlySavingsNeeded.toLocaleString()}/mo into ${cg.goal.horizonBucket === "short_term" ? "a high-yield cash fund" : "your DCA portfolio"} for your ${cg.goal.name}.`);
  });

  if (keyActionItems.length === 0) {
    keyActionItems.push("You're rocking your finances! Keep dollar-cost averaging consistently.");
  }

  return {
    profile,
    netWorth: {
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidAssets,
      illiquidAssets,
    },
    cashFlow: {
      totalMonthlyIncome,
      totalMonthlyExpenses,
      essentialMonthlyExpenses,
      monthlyNetSavings,
      totalMonthlyDCAInvestments,
      savingsRatePercentage,
      debtToIncomeRatio,
    },
    shortfalls,
    illnessShield,
    monteCarloRetirement,
    overallFinancialHealthScore,
    keyActionItems,
    investmentGrowthTrajectory,
    loanPayoffTrajectory,
    totalLoanInterestLifetime,
    computedGoals,
    retirementDetails: {
      todayMonthlySpend,
      futureMonthlySpendAtRetirement: Math.round(futureMonthlyExpensesAtRetirement),
      yearsInRetirement,
      yearsToRetirement,
      cpfMonthlyPayoutToday: Math.round(cpfMonthlyPayoutToday),
      cpfMonthlyPayoutFuture: Math.round(cpfMonthlyPayoutFuture),
      privateMonthlySpendNeededToday: Math.round(privateMonthlySpendNeededToday),
      privateMonthlySpendNeededFuture: Math.round(privateMonthlySpendNeededFuture),
      totalNestEggRequired: requiredRetirementNestEgg,
      projectedAccumulation: totalProjectedRetirementFund,
      hasCpfLifeFloor,
    },
  };
}
