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
} from "lucide-react";

export type FormulaKey =
  | "retirement_nest_egg"
  | "emergency_fund"
  | "life_protection"
  | "critical_illness"
  | "disability_income"
  | "goal_sinking_fund"
  | "education_compounding"
  | "couple_burn_rate"
  | "dual_cpf_life"
  | "savings_rate"
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
  const { profile, summary, currency } = useFinancialStore();
  const [selectedKey, setSelectedKey] = useState<FormulaKey>(initialKey);

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
  }[] = [
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
          value: formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency) + "/mo",
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
          value: formatCurrency(retirementDetails.futureMonthlySpendAtRetirement, currency) + "/mo",
          note: `${formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency)} × (1 + ${generalInf / 100})^${yearsToRetire}`,
        },
        {
          label: "CPF LIFE Guaranteed Monthly Payout",
          value: profile.cpfLife?.isEnabled !== false ? `${formatCurrency(retirementDetails.cpfMonthlyPayoutFuture, currency)}/mo` : "$0 (Disabled)",
          note: "Reduces private capital burden for life",
        },
        {
          label: "Net Monthly Private Gap",
          value: formatCurrency(retirementDetails.privateMonthlySpendNeededFuture, currency) + "/mo",
          note: "Amount your private investment portfolio must generate",
        },
        {
          label: "Years in Retirement",
          value: `${yearsInRetire} years (Age ${profile.targetRetirementAge} → ${profile.lifeExpectancy})`,
          note: "Longevity planning horizon",
        },
      ],
      derivationSteps: [
        `Step 1: Inflate your today spend (${formatCurrency(profile.desiredMonthlyRetirementSpendToday, currency)}/mo) by ${generalInf}% over ${yearsToRetire} years = ${formatCurrency(retirementDetails.futureMonthlySpendAtRetirement, currency)}/mo at age ${profile.targetRetirementAge}.`,
        `Step 2: Deduct CPF LIFE lifelong monthly annuity floor of ${formatCurrency(retirementDetails.cpfMonthlyPayoutFuture, currency)}/mo, leaving a net private need of ${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture, currency)}/mo (${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture * 12, currency)}/year).`,
        `Step 3: Calculate the lump sum required to sustain ${formatCurrency(retirementDetails.privateMonthlySpendNeededFuture * 12, currency)}/year for ${yearsInRetire} years at a ${postRetireReturn}% post-retirement return.`,
      ],
      resultLabel: "Total Private Nest Egg Required",
      resultValue: formatCurrency(retirementDetails.totalNestEggRequired, currency),
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
          value: formatCurrency(cashFlow.essentialMonthlyExpenses, currency) + "/mo",
          note: "Rent/mortgage, food, utilities, debt payments, and basic bills",
        },
        {
          label: "Buffer Target Months",
          value: `${profile.assumptions.emergencyFundMonthsTarget} Months`,
          note: "Recommended 6 months for employees, 12 months for freelancers",
        },
        {
          label: "Existing Liquid Bank Cash",
          value: formatCurrency(netWorth.liquidAssets, currency),
          note: "Cash in bank and fixed deposits",
        },
      ],
      derivationSteps: [
        `Step 1: Filter your expense list for essential survival items (Total: ${formatCurrency(cashFlow.essentialMonthlyExpenses, currency)}/month).`,
        `Step 2: Multiply by target buffer (${profile.assumptions.emergencyFundMonthsTarget} months) = ${formatCurrency(cashFlow.essentialMonthlyExpenses * profile.assumptions.emergencyFundMonthsTarget, currency)}.`,
        `Step 3: Compare against your current liquid bank savings (${formatCurrency(netWorth.liquidAssets, currency)}).`,
      ],
      resultLabel: "Required Emergency Cash Stash",
      resultValue: formatCurrency(cashFlow.essentialMonthlyExpenses * profile.assumptions.emergencyFundMonthsTarget, currency),
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
          value: formatCurrency(netWorth.totalLiabilities, currency),
          note: "To clear all housing, car, and personal loans to $0",
        },
        {
          label: "Annual Dependent Living Support",
          value: formatCurrency(cashFlow.essentialMonthlyExpenses * 12, currency) + "/yr",
          note: "To maintain your family's baseline standard of living",
        },
        {
          label: "Support Duration Horizon",
          value: `${profile.assumptions.familySupportYearsTarget} Years`,
          note: "Years until children/dependents become financially independent",
        },
        {
          label: "Existing Life / TPD Insurance In-Force",
          value: formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.deathBenefit || 0), 0), currency),
          note: "Term and Whole Life death benefit coverage",
        },
      ],
      derivationSteps: [
        `Step 1: Calculate full debt settlement: ${formatCurrency(netWorth.totalLiabilities, currency)}.`,
        `Step 2: Add living fund for dependents: ${formatCurrency(cashFlow.essentialMonthlyExpenses * 12, currency)} × ${profile.assumptions.familySupportYearsTarget} years = ${formatCurrency(cashFlow.essentialMonthlyExpenses * 12 * profile.assumptions.familySupportYearsTarget, currency)}.`,
        `Step 3: Add tertiary university education funds for children = ${formatCurrency(profile.dependents.reduce((s, d) => s + (d.tertiaryEducationTarget || 0), 0), currency)}.`,
      ],
      resultLabel: "Total Life Protection Required",
      resultValue: formatCurrency(
        netWorth.totalLiabilities +
          cashFlow.essentialMonthlyExpenses * 12 * profile.assumptions.familySupportYearsTarget +
          profile.dependents.reduce((s, d) => s + (d.tertiaryEducationTarget || 0), 0),
        currency
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
          value: formatCurrency(cashFlow.totalMonthlyIncome, currency) + "/mo",
          note: "Your monthly earning capacity",
        },
        {
          label: "Annual Income",
          value: formatCurrency(cashFlow.totalMonthlyIncome * 12, currency) + "/yr",
          note: "Base yearly income replacement need",
        },
        {
          label: "Medical Recovery Horizon",
          value: `${profile.assumptions.ciIncomeReplacementYears} Years`,
          note: "LIA industry benchmark recovery & rehabilitation period",
        },
        {
          label: "Existing Major CI Coverage",
          value: formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.majorCiBenefit || 0), 0), currency),
          note: "In-force Critical Illness policies",
        },
      ],
      derivationSteps: [
        `Step 1: Multiply gross annual income (${formatCurrency(cashFlow.totalMonthlyIncome * 12, currency)}) by ${profile.assumptions.ciIncomeReplacementYears} years.`,
        `Step 2: Total required = ${formatCurrency(cashFlow.totalMonthlyIncome * 12 * profile.assumptions.ciIncomeReplacementYears, currency)}.`,
        `Step 3: Compare against in-force CI insurance (${formatCurrency(profile.insurancePolicies.reduce((s, p) => s + (p.majorCiBenefit || 0), 0), currency)}) to find your gap.`,
      ],
      resultLabel: "Critical Illness Target Coverage",
      resultValue: formatCurrency(cashFlow.totalMonthlyIncome * 12 * profile.assumptions.ciIncomeReplacementYears, currency),
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
          value: formatCurrency(cashFlow.totalMonthlyExpenses + (profile.partner?.isEnabled ? (profile.partner.monthlyPersonalExpenses + profile.partner.monthlyDebtRepayment) : 0), currency) + "/mo",
          note: "Mortgages, bills, food, and partner personal commitments",
        },
        {
          label: "Single Surviving Partner Salary",
          value: formatCurrency(cashFlow.totalMonthlyIncome, currency) + "/mo",
          note: "Income remaining when 1 partner is retrenched",
        },
        {
          label: "Joint Bank Cash Buffer",
          value: formatCurrency(netWorth.liquidAssets + (profile.partner?.isEnabled ? profile.partner.liquidSavings : 0), currency),
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
          value: profile.cpfLife?.isEnabled !== false ? `${formatCurrency(profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650, currency)}/mo` : "$0",
          note: "Full Retirement Sum (FRS) lifelong monthly payout",
        },
        {
          label: "Partner CPF LIFE Estimated Payout",
          value: profile.partner?.isEnabled ? `${formatCurrency(profile.partner.cpfLifeEstimatedMonthlyToday, currency)}/mo` : "$0",
          note: "Partner FRS lifelong monthly payout",
        },
      ],
      derivationSteps: [
        `Step 1: Sum User payout (${formatCurrency(profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650, currency)}/mo) and Partner payout (${formatCurrency(profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650, currency)}/mo).`,
        `Step 2: Total combined baseline annuity = ${formatCurrency((profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) + (profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650), currency)}/mo.`,
        `Step 3: This lifelong floor guarantees basic housing & utility expenses will be covered unconditionally, eliminating the risk of outliving your wealth.`,
      ],
      resultLabel: "Combined Guaranteed Lifelong Annuity",
      resultValue: formatCurrency((profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) + (profile.partner?.cpfLifeEstimatedMonthlyToday ?? 1650), currency) + "/mo",
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
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
