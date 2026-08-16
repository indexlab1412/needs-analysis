"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { PartnerProfile } from "@/lib/fna/types";
import { formatCurrency, parseNumberInput } from "@/lib/utils";
import {
  Users,
  Heart,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Briefcase,
  Activity,
  CheckCircle2,
  DollarSign,
  Building2,
  Lock,
  Zap,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { PartnerMergeModal } from "./PartnerMergeModal";
import { FormulaModal, FormulaKey } from "./FormulaModal";

export const CouplePlannerView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { netWorth, cashFlow } = summary;

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  const partner: PartnerProfile = profile.partner || {
    isEnabled: true,
    name: "Chloe",
    currentAge: 24,
    targetRetirementAge: 58,
    monthlyIncome: 3600,
    monthlyPersonalExpenses: 800,
    personalDebts: 10000,
    monthlyDebtRepayment: 250,
    liquidSavings: 12000,
    investmentsValue: 8500,
    monthlyDCA: 200,
    deathBenefit: 300000,
    ciBenefit: 120000,
    cpfLifeEstimatedMonthlyToday: 1650,
  };

  const isCoupleEnabled = partner.isEnabled;

  // Stress-Test Simulation States
  const [testedScenario, setTestedScenario] = useState<"jobless" | "illness">("jobless");
  const [affectedPartner, setAffectedPartner] = useState<"user" | "partner">("partner");
  const [stressMonths, setStressMonths] = useState<number>(6);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<FormulaKey>("couple_burn_rate");
  const [isHedgingGuideOpen, setIsHedgingGuideOpen] = useState<boolean>(false);

  const updatePartner = (updates: Partial<PartnerProfile>) => {
    updateProfile((p) => ({
      ...p,
      partner: {
        ...(p.partner || partner),
        ...updates,
      },
    }));
  };

  // --- JOINT FINANCIAL CALCULATIONS ---
  const userIncome = cashFlow.totalMonthlyIncome;
  const partnerIncome = partner.monthlyIncome;
  const jointIncome = userIncome + (isCoupleEnabled ? partnerIncome : 0);

  const userExpenses = cashFlow.totalMonthlyExpenses;
  const partnerExpenses = partner.monthlyPersonalExpenses + partner.monthlyDebtRepayment;
  const jointExpenses = userExpenses + (isCoupleEnabled ? partnerExpenses : 0);

  const userDCA = cashFlow.totalMonthlyDCAInvestments;
  const partnerDCA = partner.monthlyDCA;
  const jointDCA = userDCA + (isCoupleEnabled ? partnerDCA : 0);

  const jointNetSavings = jointIncome - jointExpenses - jointDCA;
  const jointSavingsRate = jointIncome > 0 ? Math.round(((jointNetSavings + jointDCA) / jointIncome) * 100) : 0;

  const userNetWorth = netWorth.netWorth;
  const partnerNetWorth = (partner.liquidSavings + partner.investmentsValue) - partner.personalDebts;
  const jointNetWorth = userNetWorth + (isCoupleEnabled ? partnerNetWorth : 0);

  const jointLiquidCash = netWorth.liquidAssets + (isCoupleEnabled ? partner.liquidSavings : 0);

  // Dual CPF LIFE Floor
  const userCpfLife = profile.cpfLife?.isEnabled !== false ? (profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) : 0;
  const partnerCpfLife = isCoupleEnabled ? partner.cpfLifeEstimatedMonthlyToday : 0;
  const jointCpfLifeFloor = userCpfLife + partnerCpfLife;

  // --- STRESS-TEST ENGINE ---
  // Scenario 1: One Partner Loses Job (Income drops to 0)
  const survivingIncome = affectedPartner === "partner" ? userIncome : partnerIncome;
  const survivingMonthlyBurn = jointExpenses + (affectedPartner === "partner" ? 0 : 0);
  const survivingMonthlySurplusDeficit = survivingIncome - survivingMonthlyBurn;
  const isSurvivingDeficit = survivingMonthlySurplusDeficit < 0;

  const monthlyCashDrain = Math.abs(survivingMonthlySurplusDeficit);
  const coupleRunwayMonths = isSurvivingDeficit
    ? Math.round((jointLiquidCash / (monthlyCashDrain || 1)) * 10) / 10
    : 99;

  // Scenario 2: One Partner Falls Critically Ill (3 Years Income Loss)
  const illPartnerName = affectedPartner === "partner" ? partner.name : (profile.name || "You");
  const illPartnerMonthlyIncome = affectedPartner === "partner" ? partnerIncome : userIncome;
  const illPartnerCiCover = affectedPartner === "partner"
    ? partner.ciBenefit
    : profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.majorCiBenefit) || 0), 0);

  const threeYearLostIncome = illPartnerMonthlyIncome * 12 * 3;
  const ciInsuranceGap = Math.max(0, threeYearLostIncome - illPartnerCiCover);
  const ciCoverageRatio = threeYearLostIncome > 0 ? Math.min(150, Math.round((illPartnerCiCover / threeYearLostIncome) * 100)) : 100;

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Toggle */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Couple Financial Planning & Retiring Together
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plan joint wealth, combine dual CPF LIFE floors, and stress-test what happens if one partner falls ill or loses a job.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMergeModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>Merge Profile</span>
            </button>

            <button
              type="button"
              onClick={() => updatePartner({ isEnabled: !isCoupleEnabled })}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 border ${
                isCoupleEnabled
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {isCoupleEnabled ? "👫 Couple Active" : "👤 Enable Couple"}
            </button>
          </div>
        </div>
      </div>

      <PartnerMergeModal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} />

      {!isCoupleEnabled ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Heart className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Planning with a Partner or Spouse?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enable Couple Mode to combine your incomes, track separate debts, plan joint early retirement, and simulate sole-breadwinner scenarios.
          </p>
          <button
            onClick={() => updatePartner({ isEnabled: true })}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Enable Couple Planning
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Joint Household Overview Hero Card */}
          <div className="fin-card p-4 sm:p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> Joint Household Balance Sheet
              </span>
              <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-200">
                {profile.name || "You"} & {partner.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Joint Income</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 block mt-0.5">
                  {formatCurrency(jointIncome, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">{currency} {userIncome.toLocaleString()} + {currency} {partnerIncome.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Joint Expenses</span>
                <span className="text-sm sm:text-base font-black text-rose-400 block mt-0.5">
                  {formatCurrency(jointExpenses, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">Bills, rent & personal loans</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Combined Net Worth</span>
                <span className="text-sm sm:text-base font-black text-indigo-300 block mt-0.5">
                  {formatCurrency(jointNetWorth, currency)}
                </span>
                <span className="text-[9px] text-slate-400">Assets minus all debts</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Joint Savings Rate</span>
                <span className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">
                  {jointSavingsRate}%
                </span>
                <span className="text-[9px] text-slate-400">Saving {formatCurrency(jointNetSavings + jointDCA, currency)}/mo</span>
              </div>
            </div>

            {/* Dual CPF LIFE Super-Floor Callout */}
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-300 block">Dual CPF LIFE Guaranteed Annuity Floor</strong>
                  <span className="text-slate-300 text-[11px]">
                    At Age 65, both CPF payouts combine to give you a guaranteed <strong>{formatCurrency(jointCpfLifeFloor, currency)}/month for life</strong>!
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFormulaKey("dual_cpf_life");
                  setIsFormulaModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-[10px] shrink-0 transition-colors flex items-center gap-1"
              >
                <Calculator className="w-3 h-3" />
                <span>Formula</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* EDUCATIONAL & HEDGING FRAMEWORK: THE 4 COUPLE SAFETY SHIELDS */}
          {/* ========================================================================= */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    How Couple Values Are Captured & Hedged Against Uncertainties
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    The 4 financial safety shields protecting your joint household
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHedgingGuideOpen(!isHedgingGuideOpen)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline p-1"
              >
                <span>{isHedgingGuideOpen ? "Hide Framework" : "Explore 4 Shields"}</span>
                {isHedgingGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible 4 Shields Grid */}
            {isHedgingGuideOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" /> 1. Job Loss / Breadwinner Shield
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">6-12 Mo Runway</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Hedge:</strong> Maintain a joint emergency bank buffer equal to 6 months of combined living bills + debt repayments. If one partner loses a job, the household never defaults on mortgages.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> 2. Critical Illness & Health Shield
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">3-5 Yrs Income</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Hedge:</strong> Ensure each partner holds Critical Illness insurance paying 3–5 years of gross salary lump sum so joint retirement investments are never liquidated during medical treatments.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" /> 3. Mortgage & HPS Protection
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Debt → $0</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Hedge:</strong> Under Singapore's Home Protection Scheme (HPS) or joint mortgage term insurance, if either spouse passes away, the outstanding loan is wiped clean, leaving $0 debt for the surviving partner.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 4. Dual Longevity Annuity (CPF)
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Lifelong Floor</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Hedge:</strong> Dual CPF LIFE payouts ($3,300/mo combined) guarantee that no matter how long either partner lives (even past age 95+), fundamental living expenses are guaranteed by the government.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION: THE SOLE BREADWINNER / ILLNESS STRESS-TESTER */}
          {/* ========================================================================= */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  "What-If One of Us is Sick or Jobless?" Stress-Test
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate what happens if one partner has to stop working or carry the household alone.
                </p>
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTestedScenario("jobless")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  testedScenario === "jobless"
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold block flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-rose-500" /> 1. Job Loss / Retrenchment
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  One partner's salary drops to $0
                </span>
              </button>

              <button
                onClick={() => setTestedScenario("illness")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  testedScenario === "illness"
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold block flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-500" /> 2. Major Critical Illness
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  3 years off work for recovery
                </span>
              </button>
            </div>

            {/* Switch Affected Partner */}
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">Who stops working in this simulation?</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setAffectedPartner("partner")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    affectedPartner === "partner"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  {partner.name}
                </button>
                <button
                  onClick={() => setAffectedPartner("user")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    affectedPartner === "user"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  {profile.name || "You"}
                </button>
              </div>
            </div>

            {/* SCENARIO 1 OUTCOME: JOB LOSS / SOLE BREADWINNER */}
            {testedScenario === "jobless" && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isSurvivingDeficit
                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                    : "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {affectedPartner === "partner" ? `${partner.name}'s Salary Drops to $0` : `Your Salary Drops to $0`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSurvivingDeficit
                        ? "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
                        : "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                    }`}
                  >
                    {isSurvivingDeficit ? "Monthly Cashflow Deficit" : "Surviving on 1 Income!"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Remaining Household Income</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                      {formatCurrency(survivingIncome, currency)}/mo
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Total Bills + Partner Debts</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                      {formatCurrency(survivingMonthlyBurn, currency)}/mo
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-xs">
                  <div className="text-xs leading-relaxed flex-1">
                    {isSurvivingDeficit ? (
                      <p>
                        ⚠️ <strong>Cashflow Drain:</strong> The remaining income leaves a monthly gap of <strong>-{formatCurrency(monthlyCashDrain, currency)}/month</strong>. Your combined liquid savings of <strong>{formatCurrency(jointLiquidCash, currency)}</strong> will sustain the household for <strong>{coupleRunwayMonths} months</strong> before cash runs out.
                      </p>
                    ) : (
                      <p>
                        🎉 <strong>Immense Resilience:</strong> One income of <strong>{formatCurrency(survivingIncome, currency)}/mo</strong> is sufficient to cover 100% of joint living costs and all debt repayments, still leaving <strong>+{formatCurrency(survivingMonthlySurplusDeficit, currency)}/month</strong> in surplus!
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormulaKey("couple_burn_rate");
                      setIsFormulaModalOpen(true);
                    }}
                    className="ml-2 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-50 transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Formula</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO 2 OUTCOME: MAJOR ILLNESS & CI INSURANCE CHECK */}
            {testedScenario === "illness" && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  ciCoverageRatio >= 100
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200"
                    : "bg-amber-50/80 dark:amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {illPartnerName}'s Critical Illness Coverage Check
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ciCoverageRatio >= 100
                        ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                        : "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                    }`}
                  >
                    {ciCoverageRatio}% Salary Replaced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">3-Year Income to Protect</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                      {formatCurrency(threeYearLostIncome, currency)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Current CI Payout Insurance</span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {formatCurrency(illPartnerCiCover, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-xs">
                  <div className="text-xs leading-relaxed flex-1">
                    {ciInsuranceGap > 0 ? (
                      <p>
                        🛡️ <strong>Insurance Buffer:</strong> {illPartnerName}'s Critical Illness policy will pay out <strong>{formatCurrency(illPartnerCiCover, currency)}</strong> cash, covering {ciCoverageRatio}% of lost salary so the healthy partner is not forced to bear all personal loans and medical recovery costs alone. Adding <strong>{formatCurrency(ciInsuranceGap, currency)}</strong> in CI coverage would achieve 100% income replacement.
                      </p>
                    ) : (
                      <p>
                        🎉 <strong>Fully Protected:</strong> {illPartnerName} has <strong>{formatCurrency(illPartnerCiCover, currency)}</strong> in Critical Illness coverage, fully replacing 3 years of income with zero financial stress on the surviving partner!
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormulaKey("critical_illness");
                      setIsFormulaModalOpen(true);
                    }}
                    className="ml-2 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-50 transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Formula</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Partner Parameters Customization Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {partner.name}'s Financial Profile Inputs
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Partner's Name</label>
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => updatePartner({ name: e.target.value })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Monthly Take-Home Pay ({currency})</label>
                <input
                  type="number"
                  value={partner.monthlyIncome || ""}
                  onChange={(e) => updatePartner({ monthlyIncome: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Personal Debts ({currency})</label>
                <input
                  type="number"
                  value={partner.personalDebts || ""}
                  onChange={(e) => updatePartner({ personalDebts: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-rose-600 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Personal Expenses & Loans ({currency}/mo)</label>
                <input
                  type="number"
                  value={partner.monthlyPersonalExpenses || ""}
                  onChange={(e) => updatePartner({ monthlyPersonalExpenses: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Liquid Bank Cash ({currency})</label>
                <input
                  type="number"
                  value={partner.liquidSavings || ""}
                  onChange={(e) => updatePartner({ liquidSavings: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Investments & Stocks ({currency})</label>
                <input
                  type="number"
                  value={partner.investmentsValue || ""}
                  onChange={(e) => updatePartner({ investmentsValue: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Monthly Auto-DCA ({currency}/mo)</label>
                <input
                  type="number"
                  value={partner.monthlyDCA || ""}
                  onChange={(e) => updatePartner({ monthlyDCA: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Critical Illness Cover ({currency})</label>
                <input
                  type="number"
                  value={partner.ciBenefit || ""}
                  onChange={(e) => updatePartner({ ciBenefit: parseNumberInput(e.target.value) })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula & Derivation Guide Modal */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        initialKey={selectedFormulaKey}
      />
    </div>
  );
};
