"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Calculator,
  HelpCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Clock,
  GraduationCap,
  Wallet,
  Users,
  ChevronDown,
  ChevronRight,
  Info,
  Target,
  Percent,
  ArrowRight,
} from "lucide-react";

export type FormulaKey =
  | "savings_rate"
  | "net_worth"
  | "retirement_nest_egg"
  | "emergency_fund"
  | "life_protection"
  | "critical_illness"
  | "disability_income"
  | "goal_sinking_fund"
  | "education_compounding"
  | "couple_burn_rate"
  | "dual_cpf_life"
  | "loan_refinance";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: FormulaKey;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({
  isOpen,
  onClose,
  initialKey = "retirement_nest_egg",
}) => {
  const { profile, summary, currency, isPrivacyMode, goToWizardStep } = useFinancialStore();
  const [selectedKey, setSelectedKey] = useState<FormulaKey>(initialKey);

  // Sync selectedKey whenever initialKey changes
  React.useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);

  if (!isOpen) return null;

  const { netWorth, cashFlow, retirementDetails } = summary;
  const generalInf = profile.assumptions.generalInflationRate;
  const eduInf = profile.assumptions.educationInflationRate;
  const investReturn = profile.assumptions.investmentReturnRate;
  const postRetireReturn = profile.assumptions.postRetirementReturnRate;
  const yearsToRetire = Math.max(1, profile.targetRetirementAge - profile.currentAge);
  const yearsInRetire = Math.max(1, profile.lifeExpectancy - profile.targetRetirementAge);

  const formulasList: {
    key: FormulaKey;
    title: string;
    category: string;
    icon: any;
    summaryText: string;
    formulaLaTeX: string;
    variables: { label: string; value: string; note: string }[];
    derivationSteps: string[];
    resultLabel: string;
    resultValue: string;
    editAction?: { label: string; onClick: () => void };
  }[] = [
    {
      key: "savings_rate",
      title: "Monthly Cashflow & Savings Rate",
      category: "Cashflow & Budgeting",
      icon: Wallet,
      summaryText:
        "Measures how much free cash you retain each month after all living bills, and the percentage of your total income saved or invested towards your future.",
      formulaLaTeX: "Net Savings = Total Income - Total Living Expenses; Savings Rate (%) = (Net Savings + Monthly DCA) ÷ Total Income",
      variables: [
        {
          label: "Total Monthly Inflow",
          value: formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode) + "/mo",
          note: "Take-home pay, bonuses, side hustle & passive income",
        },
        {
          label: "Total Monthly Living Bills",
          value: formatCurrency(cashFlow.totalMonthlyExpenses, currency, 0, isPrivacyMode) + "/mo",
          note: "Essential needs (housing, food, transport) + discretionary lifestyle",
        },
        {
          label: "Monthly Net Cashflow",
          value: `+${formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}/mo`,
          note: `${formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode)} - ${formatCurrency(cashFlow.totalMonthlyExpenses, currency, 0, isPrivacyMode)}`,
        },
        {
          label: "Monthly Automated DCA / Investments",
          value: formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency, 0, isPrivacyMode) + "/mo",
          note: "Robo-advisors, index ETFs, and regular savings plans",
        },
      ],
      derivationSteps: [
        `Step 1: Sum all monthly income streams = ${formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode)}.`,
        `Step 2: Deduct itemized living bills = ${formatCurrency(cashFlow.totalMonthlyExpenses, currency, 0, isPrivacyMode)}, yielding net cash savings of +${formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}/month.`,
        `Step 3: Add regular investment contributions (${formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency, 0, isPrivacyMode)}/mo) for total retained wealth creation of ${formatCurrency(cashFlow.monthlyNetSavings + cashFlow.totalMonthlyDCAInvestments, currency, 0, isPrivacyMode)}/mo.`,
        `Step 4: Divide retained wealth by total monthly income = ${cashFlow.savingsRatePercentage}% savings rate.`,
      ],
      resultLabel: "Monthly Net Savings",
      resultValue: `+${formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}/mo (${cashFlow.savingsRatePercentage}%)`,
      editAction: {
        label: "Edit Monthly Paycheck & Bills",
        onClick: () => {
          onClose();
          goToWizardStep(2, "cashflow");
        },
      },
    },
    {
      key: "net_worth",
      title: "Total Net Worth & Balance Sheet",
      category: "Assets & Liabilities",
      icon: TrendingUp,
      summaryText:
        "The true measure of your financial foundation: the sum of everything you own (liquid bank accounts, stocks, real estate, pension/CPF, and cash values) minus everything you owe (mortgages, study loans, car loans).",
      formulaLaTeX: "Net Worth = Total Assets (Liquid + Investments + CPF + Properties) - Total Liabilities (Debts & Mortgages)",
      variables: [
        {
          label: "Total Assets",
          value: formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode),
          note: "Cash, investments, CPF/EPF, real estate & insurance cash value",
        },
        {
          label: "Total Liabilities",
          value: formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode),
          note: "Outstanding balance on all loans and mortgages",
        },
        {
          label: "Liquid Assets Cushion",
          value: formatCurrency(netWorth.liquidAssets, currency, 0, isPrivacyMode),
          note: "Cash readily available within 48 hours",
        },
        {
          label: "Debt-to-Asset Ratio",
          value: `${netWorth.totalAssets > 0 ? Math.round((netWorth.totalLiabilities / netWorth.totalAssets) * 100) : 0}%`,
          note: "Percentage of assets financed by borrowed debt",
        },
      ],
      derivationSteps: [
        `Step 1: Aggregate asset categories: Cash & Savings (${formatCurrency(profile.assets.filter(a => a.isLiquid || a.category === "cash_savings").reduce((s, a) => s + (Number(a.currentValue) || 0), 0), currency, 0, isPrivacyMode)}) + Invested Portfolio + CPF/Pension + Real Estate = ${formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode)}.`,
        `Step 2: Aggregate outstanding liabilities: Mortgages + Personal/Study Loans = ${formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode)}.`,
        `Step 3: Total Assets (${formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode)}) - Total Liabilities (${formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode)}) = ${formatCurrency(netWorth.netWorth, currency, 0, isPrivacyMode)}.`,
      ],
      resultLabel: "Current Net Worth",
      resultValue: formatCurrency(netWorth.netWorth, currency, 0, isPrivacyMode),
      editAction: {
        label: "Edit Assets & Liabilities",
        onClick: () => {
          onClose();
          goToWizardStep(3, "net_worth");
        },
      },
    },
    {
      key: "retirement_nest_egg",
      title: "Retirement Nest Egg Capital Required",
      category: "Retirement & Longevity",
      icon: Clock,
      summaryText:
        "How much accumulated investment capital you need at retirement so you never run out of money up to age " +
        profile.lifeExpectancy +
        ", taking into account general inflation and CPF LIFE guaranteed payouts.",
      formulaLaTeX:
        "Nest Egg = [ (Today Spend × (1 + Inflation)^YearsToRetire) - CPF LIFE Payout ] × 12 × AnnuityFactor(YearsInRetire, RealReturn)",
      variables: [
        {
          label: "Desired Monthly Spend (Today's $)",
          value: formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency, 0, isPrivacyMode) + "/mo",
          note: "What you want to live on in today's purchasing power",
        },
        {
          label: "Years Until Retirement",
          value: `${yearsToRetire} years (Age ${profile.currentAge} → ${profile.targetRetirementAge})`,
          note: "Compounding accumulation horizon",
        },
        {
          label: "Assumed General Inflation",
          value: `${generalInf}% per year`,
          note: "Cost of living increase",
        },
        {
          label: "Future Monthly Spend at Age " + profile.targetRetirementAge,
          value: formatCurrency(retirementDetails.futureMonthlySpendAtRetirement, currency, 0, isPrivacyMode) + "/mo",
          note: `${formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency, 0, isPrivacyMode)} × (1 + ${generalInf / 100})^${yearsToRetire}`,
        },
        {
          label: "CPF LIFE Guaranteed Monthly Payout",
          value: profile.cpfLife?.isEnabled !== false ? `${formatCurrency(retirementDetails.cpfMonthlyPayoutFuture, currency, 0, isPrivacyMode)}/mo` : "$0 (Disabled)",
          note: "Reduces private capital burden for life",
        },
        {
          label: "Net Monthly Private Gap",
          value: formatCurrency(retirementDetails.privateMonthlySpendNeededFuture, currency, 0, isPrivacyMode) + "/mo",
          note: "Amount your private investment portfolio must generate",
        },
        {
          label: "Years in Retirement",
          value: `${yearsInRetire} years (Age ${profile.targetRetirementAge} → ${profile.lifeExpectancy})`,
          note: "Longevity planning horizon",
        },
      ],
      derivationSteps: [
        `Step 1: Inflate your today spend (${formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency, 0, isPrivacyMode)}/mo) by ${generalInf}% over ${yearsToRetire} years = ${formatCurrency(retirementDetails.futureMonthlySpendAtRetirement, currency, 0, isPrivacyMode)}/mo at age ${profile.targetRetirementAge}.`,
        `Step 2: Deduct CPF LIFE lifelong monthly annuity floor of ${formatCurrency(retirementDetails.cpfMonthlyPayoutFuture, currency, 0, isPrivacyMode)}/mo, leaving a net private need of ${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture, currency, 0, isPrivacyMode)}/mo (${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture * 12, currency, 0, isPrivacyMode)}/year).`,
        `Step 3: Calculate the lump sum required to sustain ${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture * 12, currency, 0, isPrivacyMode)}/year for ${yearsInRetire} years at a ${postRetireReturn}% post-retirement return.`,
      ],
      resultLabel: "Total Private Nest Egg Required",
      resultValue: formatCurrency(retirementDetails.totalNestEggRequired, currency, 0, isPrivacyMode),
    },
    {
      key: "emergency_fund",
      title: "Emergency Cash Buffer Target",
      category: "Protection & Liquidity",
      icon: Sparkles,
      summaryText:
        "The minimum liquid cash needed in high-yield bank accounts to survive unexpected retrenchment, medical gaps, or sudden household emergencies.",
      formulaLaTeX: "Emergency Target = Essential Monthly Living Spend × Target Buffer Months (e.g. 6)",
      variables: [
        {
          label: "Essential Monthly Expenses",
          value: formatCurrency(cashFlow.essentialMonthlyExpenses, currency, 0, isPrivacyMode) + "/mo",
          note: "Rent/mortgage, food, utilities, debt payments, and basic bills",
        },
        {
          label: "Buffer Target Months",
          value: `${profile.assumptions.emergencyFundMonthsTarget} Months`,
          note: "Recommended 6 months for employees, 12 months for freelancers",
        },
        {
          label: "Existing Liquid Bank Cash",
          value: formatCurrency(netWorth.liquidAssets, currency, 0, isPrivacyMode),
          note: "Cash in bank and fixed deposits",
        },
      ],
      derivationSteps: [
        `Step 1: Filter your expense list for essential survival items (Total: ${formatCurrency(cashFlow.essentialMonthlyExpenses, currency, 0, isPrivacyMode)}/month).`,
        `Step 2: Multiply by target buffer (${profile.assumptions.emergencyFundMonthsTarget} months) = ${formatCurrency(cashFlow.essentialMonthlyExpenses * profile.assumptions.emergencyFundMonthsTarget, currency, 0, isPrivacyMode)}.`,
        `Step 3: Compare against your current liquid bank savings (${formatCurrency(netWorth.liquidAssets, currency, 0, isPrivacyMode)}).`,
      ],
      resultLabel: "Required Emergency Cash Stash",
      resultValue: formatCurrency(cashFlow.essentialMonthlyExpenses * profile.assumptions.emergencyFundMonthsTarget, currency, 0, isPrivacyMode),
    },
    {
      key: "life_protection",
      title: "Life & Total Permanent Disability (TPD) Protection Need",
      category: "Protection & Family Security",
      icon: ShieldCheck,
      summaryText:
        "The total payout required if you were to pass away or become permanently disabled, ensuring all loans are paid off and your dependents are financially secure.",
      formulaLaTeX: "Life Need = Outstanding Liabilities + (Annual Living Need × Years of Support) + Children Tertiary Education",
      variables: [
        {
          label: "Total Outstanding Debts & Mortgages",
          value: formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode),
          note: "To clear all housing, car, and personal loans to $0",
        },
        {
          label: "Annual Dependent Living Support",
          value: formatCurrency(cashFlow.essentialMonthlyExpenses * 12, currency, 0, isPrivacyMode) + "/yr",
          note: "To maintain your family's baseline standard of living",
        },
        {
          label: "Support Duration Horizon",
          value: `${profile.assumptions.familySupportYearsTarget} Years`,
          note: "Years until children/dependents become financially independent",
        },
        {
          label: "Existing Life / TPD Insurance In-Force",
          value: formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.deathBenefit || 0), 0), currency, 0, isPrivacyMode),
          note: "Term and Whole Life death benefit coverage",
        },
      ],
      derivationSteps: [
        `Step 1: Calculate full debt settlement: ${formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode)}.`,
        `Step 2: Add living fund for dependents: ${formatCurrency(cashFlow.essentialMonthlyExpenses * 12, currency, 0, isPrivacyMode)} × ${profile.assumptions.familySupportYearsTarget} years = ${formatCurrency(cashFlow.essentialMonthlyExpenses * 12 * profile.assumptions.familySupportYearsTarget, currency, 0, isPrivacyMode)}.`,
        `Step 3: Add tertiary university education funds for children = ${formatCurrency(profile.dependents.reduce((s, d) => s + (d.tertiaryEducationTarget || 0), 0), currency, 0, isPrivacyMode)}.`,
      ],
      resultLabel: "Total Life Protection Required",
      resultValue: formatCurrency(
        netWorth.totalLiabilities +
          cashFlow.essentialMonthlyExpenses * 12 * profile.assumptions.familySupportYearsTarget +
          profile.dependents.reduce((s, d) => s + (d.tertiaryEducationTarget || 0), 0),
        currency,
        0,
        isPrivacyMode
      ),
    },
    {
      key: "critical_illness",
      title: "Critical Illness (CI) Income Replacement",
      category: "Protection & Health",
      icon: ShieldCheck,
      summaryText:
        "Replaces your lost salary for 4–5 years during major cancer, heart attack, or stroke recovery without depleting your retirement investments.",
      formulaLaTeX: "CI Need = Gross Annual Income × Income Replacement Years (4 to 5 Yrs)",
      variables: [
        {
          label: "Monthly Take-Home / Gross Pay",
          value: formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode) + "/mo",
          note: "Your monthly earning capacity",
        },
        {
          label: "Annual Income",
          value: formatCurrency(cashFlow.totalMonthlyIncome * 12, currency, 0, isPrivacyMode) + "/yr",
          note: "Base yearly income replacement need",
        },
        {
          label: "Medical Recovery Horizon",
          value: `${profile.assumptions.ciIncomeReplacementYears} Years`,
          note: "LIA industry benchmark recovery & rehabilitation period",
        },
        {
          label: "Existing Major CI Coverage",
          value: formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.majorCiBenefit || 0), 0), currency, 0, isPrivacyMode),
          note: "In-force Critical Illness policies",
        },
      ],
      derivationSteps: [
        `Step 1: Multiply gross annual income (${formatCurrency(cashFlow.totalMonthlyIncome * 12, currency, 0, isPrivacyMode)}) by ${profile.assumptions.ciIncomeReplacementYears} years.`,
        `Step 2: Total required = ${formatCurrency(cashFlow.totalMonthlyIncome * 12 * profile.assumptions.ciIncomeReplacementYears, currency, 0, isPrivacyMode)}.`,
        `Step 3: Compare against in-force CI insurance (${formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.majorCiBenefit || 0), 0), currency, 0, isPrivacyMode)}) to find your gap.`,
      ],
      resultLabel: "Critical Illness Target Coverage",
      resultValue: formatCurrency(cashFlow.totalMonthlyIncome * 12 * profile.assumptions.ciIncomeReplacementYears, currency, 0, isPrivacyMode),
    },
    {
      key: "couple_burn_rate",
      title: "Couple Breadwinner / Job Loss Runway",
      category: "Couple & Joint Household",
      icon: Users,
      summaryText:
        "Measures how many months your combined household can survive if one partner loses their job or takes unpaid leave, tested against joint mortgage & living bills.",
      formulaLaTeX: "Surviving Runway (Months) = Joint Liquid Savings ÷ Absolute Monthly Deficit on 1 Salary",
      variables: [
        {
          label: "Combined Joint Monthly Expenses",
          value: formatCurrency(cashFlow.totalMonthlyExpenses + (profile.partner?.isEnabled ? (profile.partner.monthlyPersonalExpenses + profile.partner.monthlyDebtRepayment) : 0), currency, 0, isPrivacyMode) + "/mo",
          note: "Mortgages, bills, food, and partner personal commitments",
        },
        {
          label: "Single Surviving Partner Salary",
          value: formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode) + "/mo",
          note: "Income remaining when 1 partner is retrenched",
        },
        {
          label: "Joint Bank Cash Buffer",
          value: formatCurrency(netWorth.liquidAssets + (profile.partner?.isEnabled ? profile.partner.liquidSavings : 0), currency, 0, isPrivacyMode),
          note: "Combined cash cushion available to absorb the burn",
        },
      ],
      derivationSteps: [
        `Step 1: Calculate monthly deficit under single salary: Surviving Pay - Combined Joint Expenses.`,
        `Step 2: Divide combined emergency cash by monthly deficit to determine exact months of survival runway before debt distress.`,
      ],
      resultLabel: "Joint Emergency Cash Runway",
      resultValue: "Tested against 1-Salary Retrenchment",
    },
    {
      key: "dual_cpf_life",
      title: "Dual CPF LIFE Guaranteed Annuity Floor",
      category: "Couple & Joint Household",
      icon: Users,
      summaryText:
        "The combined guaranteed monthly payout from Singapore CPF LIFE (Full Retirement Sum) paid to both spouses for as long as both live, starting at age 65.",
      formulaLaTeX: "Joint CPF Floor = Partner A CPF LIFE Payout (Age 65+) + Partner B CPF LIFE Payout (Age 65+)",
      variables: [
        {
          label: "User CPF LIFE Estimated Payout",
          value: profile.cpfLife?.isEnabled !== false ? `${formatCurrency(profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650, currency, 0, isPrivacyMode)}/mo` : "$0",
          note: "Full Retirement Sum (FRS) lifelong monthly payout",
        },
        {
          label: "Partner CPF LIFE Estimated Payout",
          value: profile.partner?.isEnabled ? `${formatCurrency(profile.partner.cpfLifeEstimatedMonthlyToday, currency, 0, isPrivacyMode)}/mo` : "$0",
          note: "Partner FRS lifelong monthly payout",
        },
      ],
      derivationSteps: [
        `Step 1: Sum User payout (${formatCurrency(profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650, currency, 0, isPrivacyMode)}/mo) and Partner payout (${formatCurrency(profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650, currency, 0, isPrivacyMode)}/mo).`,
        `Step 2: Total combined baseline annuity = ${formatCurrency((profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) + (profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650), currency, 0, isPrivacyMode)}/mo.`,
        `Step 3: This lifelong floor guarantees basic housing & utility expenses will be covered unconditionally, eliminating the risk of outliving your wealth.`,
      ],
      resultLabel: "Combined Guaranteed Lifelong Annuity",
      resultValue: formatCurrency((profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) + (profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650), currency, 0, isPrivacyMode) + "/mo",
    },
    {
      key: "goal_sinking_fund",
      title: "Goal Compounding & Monthly Sinking Fund",
      category: "Goals & Milestones",
      icon: Target,
      summaryText:
        "Calculates the future cost of your dream milestones (e.g. house downpayment, wedding, sabbatical) adjusted for inflation, and determines the exact monthly auto-savings required to hit it right on schedule.",
      formulaLaTeX: "Future Cost = Today Cost × (1 + Inflation)^Years; Monthly PMT = Remaining Gap × r ÷ [((1 + r)^Years - 1) × 12]",
      variables: [
        {
          label: "Active Tracked Goals",
          value: `${profile.goals.length} Goals`,
          note: "Short-term, mid-term, and long-term milestones",
        },
        {
          label: "General Inflation Assumption",
          value: `${generalInf}% per year`,
          note: "Applied to mid and long term horizons",
        },
        {
          label: "Assumed Investment Growth Rate",
          value: `${investReturn}% per year`,
          note: "Based on balanced/equity allocation for goal horizon",
        },
      ],
      derivationSteps: [
        `Step 1: Determine goal target year and compound current cost by inflation rate.`,
        `Step 2: Compound any currently earmarked seed savings at the target portfolio return rate.`,
        `Step 3: Solve for the exact monthly contribution (PMT) needed to close the remaining gap before your target deadline.`,
      ],
      resultLabel: "Goal Sinking Fund Engine",
      resultValue: `${summary.computedGoals.length} Computed Goals`,
      editAction: {
        label: "Manage Life Goals",
        onClick: () => {
          onClose();
          goToWizardStep(5, "goals");
        },
      },
    },
    {
      key: "loan_refinance",
      title: "Loan Refinance & Interest Savings",
      category: "Debts & Mortgages",
      icon: Percent,
      summaryText:
        "Analyzes how shaving even 0.5%–1.0% off your mortgage or personal loan interest rate drops your monthly repayment and saves tens of thousands in lifetime bank interest.",
      formulaLaTeX: "Lifetime Interest Savings = Total Interest at Existing Rate - Total Interest at Refinanced Rate - Refinance Fees",
      variables: [
        {
          label: "Total Outstanding Loan Balance",
          value: formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode),
          note: "Principal remaining across all debt facilities",
        },
        {
          label: "Current Total Lifetime Interest",
          value: formatCurrency(summary.totalLoanInterestLifetime, currency, 0, isPrivacyMode),
          note: "Cumulative interest if held to full maturity without early payoff",
        },
      ],
      derivationSteps: [
        `Step 1: Compute monthly amortization schedule and cumulative interest on existing loan terms.`,
        `Step 2: Simulate lower interest rate refinancing across the remaining tenure.`,
        `Step 3: Difference between existing interest and new interest minus legal/valuation fees yields net profit into your pocket.`,
      ],
      resultLabel: "Lifetime Interest at Stake",
      resultValue: formatCurrency(summary.totalLoanInterestLifetime, currency, 0, isPrivacyMode),
      editAction: {
        label: "Review Loan Details",
        onClick: () => {
          onClose();
          goToWizardStep(3, "net_worth");
        },
      },
    },
    {
      key: "education_compounding",
      title: "Children's University Education Compounding",
      category: "Goals & Sinking Funds",
      icon: GraduationCap,
      summaryText:
        "Compounds current tuition and living costs at a 5.0% annual education inflation rate from the child's current age to Age 18, and calculates the required monthly auto-DCA sinking fund.",
      formulaLaTeX: "Future Cost = Today Tuition × (1 + EduInflation)^(18 - ChildAge)",
      variables: [
        {
          label: "Education Inflation Rate Assumed",
          value: `${eduInf}% per year`,
          note: "Higher than general inflation due to university fee escalation",
        },
        {
          label: "Compounding Horizon",
          value: "From Child's Current Age until Age 18 (Tertiary Matriculation)",
          note: "Years available for investment compounding",
        },
        {
          label: "Target University Benchmarks",
          value: "Local Public (~$45k), Local Med (~$160k), Overseas UK/AUS (~$220k), US Tier-1 (~$400k)",
          note: "Tuition + living expenses in today's dollars",
        },
      ],
      derivationSteps: [
        `Step 1: Calculate years to age 18 = 18 - ChildAge.`,
        `Step 2: Compound today's benchmark tuition by (1 + ${eduInf / 100})^(YearsTo18).`,
        `Step 3: Deduct existing earmarked education savings compounded at ${investReturn}%.`,
        `Step 4: Divide remaining gap into monthly auto-DCA sinking fund.`,
      ],
      resultLabel: "Compounded Future Tuition Target",
      resultValue: "5.0% Annual Education Escalation",
    },
  ];

  const activeFormula = formulasList.find((f) => f.key === selectedKey) || formulasList[0];
  const ActiveIcon = activeFormula.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Financial Formula & Derivation Guide
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% transparent math, variables & derivations powering your plan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Topic Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {formulasList.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedKey === f.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{f.title.split(" ")[0]} {f.title.split(" ")[1] || ""}</span>
              </button>
            ))}
          </div>

          {/* Active Formula Explanation Container */}
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Title & Category Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
                  {activeFormula.category}
                </span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  {activeFormula.resultValue}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ActiveIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                {activeFormula.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeFormula.summaryText}
              </p>
            </div>

            {/* Mathematical Formula Box */}
            <div className="p-3 bg-indigo-950 text-white rounded-2xl border border-indigo-800 space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Mathematical Formula
              </span>
              <code className="text-xs sm:text-sm font-mono text-emerald-300 block font-bold leading-relaxed break-words">
                {activeFormula.formulaLaTeX}
              </code>
            </div>

            {/* Step-by-Step Numerical Derivation */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Step-by-Step Derivation with Your Numbers
              </h5>

              <div className="space-y-1.5">
                {activeFormula.derivationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variables & Substituted Values Table */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Variables & Assumptions Applied
              </h5>

              <div className="space-y-1.5">
                {activeFormula.variables.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {v.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{v.note}</span>
                    </div>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0 text-right">
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          {activeFormula.editAction ? (
            <button
              onClick={activeFormula.editAction.onClick}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>{activeFormula.editAction.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
