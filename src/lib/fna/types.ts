// Financial Needs Analysis (FNA) Core Type Definitions

export type EmploymentType = "employed" | "self-employed" | "civil-servant" | "business-owner" | "unemployed" | "retired";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type RiskProfile = "conservative" | "moderate" | "balanced" | "growth" | "aggressive";

export type EducationDestinationPreset =
  | "local_public"
  | "local_medicine"
  | "overseas_aus_uk"
  | "overseas_us"
  | "custom";

export interface Dependent {
  id: string;
  name: string;
  relationship: "child" | "spouse" | "parent" | "other";
  age: number;
  yearsOfSupportNeeded: number;
  monthlySupportAmount: number;
  tertiaryEducationTarget?: number;
  yearsToTertiary?: number;
  educationDestinationPreset?: EducationDestinationPreset;
  currentEducationSavingsAssigned?: number;
  monthlyEducationSavings?: number;
}

export interface IncomeItem {
  id: string;
  category: "employment" | "bonus" | "rental" | "dividends" | "business" | "other";
  description: string;
  monthlyAmount: number;
}

export type ExpenseCategory =
  | "housing"
  | "food"
  | "dining_out"
  | "transport"
  | "utilities"
  | "subscriptions"
  | "shopping"
  | "entertainment"
  | "insurance"
  | "loans"
  | "lifestyle"
  | "other";

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  monthlyAmount: number;
  isEssential: boolean;
  notes?: string;
}

export interface AssetItem {
  id: string;
  category: "cash_savings" | "fixed_deposit" | "stocks_funds" | "cpf_epf_pension" | "property_primary" | "property_investment" | "business" | "crypto" | "other";
  description: string;
  currentValue: number; // Current cash value / portfolio value
  isLiquid: boolean;
  expectedReturnRate: number; // e.g. 6.5% p.a.
  monthlyContribution?: number; // e.g. $100/mo DCA across robo-advisor / insurance
  platformOrVehicle?: string; // e.g. "Syfe / Stashaway", "Endowus", "Vanguard S&P 500", "Retirement ILP", "Manulife Annuity"
  targetPurpose?: "retirement" | "wealth_growth" | "emergency" | "property_downpayment" | "general";
}

export interface LiabilityItem {
  id: string;
  category: "mortgage_primary" | "mortgage_investment" | "car_loan" | "personal_loan" | "credit_card" | "study_loan" | "other";
  description: string;
  outstandingBalance: number; // Remaining principal balance
  monthlyRepayment: number; // Monthly payment (Principal + Interest)
  interestRate: number; // Annual interest percentage e.g. 2.8% or 5.5%
  tenureYearsRemaining?: number; // e.g. 20 years remaining on mortgage or 3 years on loan
  originalAmount?: number;
}

export interface InsurancePolicy {
  id: string;
  policyName: string;
  insurer: string;
  policyType: "term_life" | "whole_life" | "endowment" | "ilp" | "critical_illness" | "disability" | "hospital_surgical" | "personal_accident";
  deathBenefit: number;
  tpdBenefit: number;
  earlyCiBenefit: number;
  majorCiBenefit: number;
  disabilityIncomeMonthly: number;
  annualPremium: number;
  expiryAge?: number;
  currentCashValue?: number; // For ILP / Whole Life / Endowment with savings component
  projectedRetirementMaturityValue?: number; // Guaranteed / projected lump sum at retirement
}

export type GoalCategory =
  | "retirement"
  | "wedding"
  | "property"
  | "renovation"
  | "travel"
  | "car"
  | "education"
  | "emergency"
  | "custom";

export type GoalHorizonBucket = "short_term" | "mid_term" | "long_term";

export interface FinancialGoal {
  id: string;
  name: string;
  category: GoalCategory;
  horizonBucket: GoalHorizonBucket; // short_term (0-3y), mid_term (3-7y), long_term (7y+)
  targetYearsFromNow: number; // e.g. 2 years for wedding, 4 years for BTO downpayment
  targetAmount: number; // In today's dollars
  currentSavingsAssigned: number;
  monthlyContributionRequired?: number;
  recommendedVehicle?: string; // e.g. "High-Yield Bank Cash (3.2%)", "Balanced Robo (4.5%)", "Global Equities (7.0%)"
  inflationAssumed?: number;
}

export interface InvestmentTrajectoryPoint {
  yearIndex: number;
  clientAge: number;
  calendarYear: number;
  totalInvestedPrincipal: number;
  projectedValue: number;
  totalCompoundedGains: number;
}

export interface LoanRundownPoint {
  yearIndex: number;
  clientAge: number;
  remainingBalance: number;
  principalPaidToDate: number;
  interestPaidToDate: number;
  yearlyRepaymentTotal: number;
}

export interface CpfLifeSettings {
  isEnabled: boolean;
  planTier: "basic_brs" | "full_frs" | "enhanced_ers" | "custom";
  estimatedMonthlyPayoutToday: number; // e.g. S$1,650/mo starting at age 65
  payoutStartAge: number; // Default 65
  currentCpfBalance?: number;
}

export interface YearlySnapshot {
  id: string;
  year: number; // e.g. 2024, 2025, 2026
  dateRecorded: string; // ISO format e.g. "2025-12-31"
  totalNetWorth: number;
  totalLiquidSavings: number; // Cash / Emergency stash
  totalInvestments: number; // Stocks, Robos, ETFs, Cash Values
  totalLiabilities: number; // Total remaining loans & debts
  annualIncome: number;
  annualSavingsRate: number; // %
  financialHealthScore: number; // 0 - 100
  keyMilestoneAchieved?: string; // e.g. "Started $150/mo DCA in Syfe & paid off $4,000 student loan"
  reflectionNotes?: string;
}

export interface PartnerProfile {
  isEnabled: boolean;
  name: string; // e.g. "Chloe / Partner"
  currentAge: number; // e.g. 25
  targetRetirementAge: number; // e.g. 60
  monthlyIncome: number; // e.g. S$3,600/mo
  monthlyPersonalExpenses: number; // e.g. S$800/mo
  personalDebts: number; // e.g. S$10,000 remaining personal / study debt
  monthlyDebtRepayment: number; // e.g. S$250/mo
  liquidSavings: number; // e.g. S$12,000 in bank
  investmentsValue: number; // e.g. S$8,500 in robos/ETFs
  monthlyDCA: number; // e.g. S$200/mo
  deathBenefit: number; // e.g. S$300,000 life cover
  ciBenefit: number; // e.g. S$150,000 critical illness cover
  cpfLifeEstimatedMonthlyToday: number; // e.g. S$1,650/mo starting at 65
}

export interface DivorceSettings {
  childMaintenanceType: "receiving" | "paying" | "none";
  childMaintenanceMonthlyAmount: number; // e.g. S$800/mo
  maintenanceEndAgeOfChild?: number; // e.g. age 21
  housingDivisionPlan: "sole_owner_buyout" | "downsizing_hdb" | "renting";
  soleCustodyOfDependents: boolean;
}

export interface WidowedSettings {
  insuranceLumpSumReceived: number; // e.g. S$400,000 death payout from deceased spouse
  cpfNominationPayoutReceived: number; // e.g. S$80,000
  hpsMortgageWipedOut: boolean; // Home Protection Scheme (HPS) paid off outstanding mortgage
  monthlyIncomeToReplace: number; // e.g. S$3,000/mo lost deceased income
  familySupportYearsNeeded: number; // e.g. 15 years until children graduate
}

export interface UserFinancialProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancy: number; // Longevity horizon e.g. 88
  desiredMonthlyRetirementSpendToday: number; // e.g. $3,000/month in today's dollars
  retirementLifestylePreset?: "basic" | "comfortable" | "abundant" | "custom";
  maritalStatus: MaritalStatus;
  employmentType: EmploymentType;
  riskProfile: RiskProfile;
  currency: string;
  
  cpfLife?: CpfLifeSettings;
  yearlySnapshots?: YearlySnapshot[];
  partner?: PartnerProfile;
  divorceSettings?: DivorceSettings;
  widowedSettings?: WidowedSettings;

  dependents: Dependent[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  insurancePolicies: InsurancePolicy[];
  goals: FinancialGoal[];
  
  assumptions: {
    generalInflationRate: number;
    medicalInflationRate: number;
    educationInflationRate: number;
    investmentReturnRate: number;
    postRetirementReturnRate: number;
    emergencyFundMonthsTarget: number;
    familySupportYearsTarget: number;
    ciIncomeReplacementYears: number;
  };
}

export interface ComputedGoalSummary {
  goal: FinancialGoal;
  targetAmountFuture: number;
  monthlySavingsNeeded: number;
  status: "on_track" | "funding_needed";
  progressPercentage: number;
  recommendedStrategy: string;
}

export interface ShortfallResult {
  category: "emergency_fund" | "life_protection" | "critical_illness" | "disability_income" | "retirement" | "education";
  title: string;
  subtitle: string;
  requiredAmount: number;
  existingAmount: number;
  shortfallAmount: number;
  status: "critical" | "warning" | "on_track" | "surplus";
  coverageRatio: number;
  recommendation: string;
  breakdown?: { label: string; value: number | string }[];
}

export interface FNAReportSummary {
  profile: UserFinancialProfile;
  netWorth: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    liquidAssets: number;
    illiquidAssets: number;
  };
  cashFlow: {
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    essentialMonthlyExpenses: number;
    monthlyNetSavings: number;
    totalMonthlyDCAInvestments: number;
    savingsRatePercentage: number;
    debtToIncomeRatio: number;
  };
  shortfalls: ShortfallResult[];
  overallFinancialHealthScore: number;
  keyActionItems: string[];
  investmentGrowthTrajectory: InvestmentTrajectoryPoint[];
  loanPayoffTrajectory: LoanRundownPoint[];
  totalLoanInterestLifetime: number;
  computedGoals: ComputedGoalSummary[];
  retirementDetails: {
    todayMonthlySpend: number;
    futureMonthlySpendAtRetirement: number;
    yearsInRetirement: number;
    yearsToRetirement: number;
    cpfMonthlyPayoutToday: number;
    cpfMonthlyPayoutFuture: number;
    privateMonthlySpendNeededToday: number;
    privateMonthlySpendNeededFuture: number;
    totalNestEggRequired: number;
    projectedAccumulation: number;
    hasCpfLifeFloor: boolean;
  };
}
