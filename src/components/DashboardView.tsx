"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import { NetWorthDonut } from "./Charts/NetWorthDonut";
import { CashflowBreakdown } from "./Charts/CashflowBreakdown";
import { ShortfallRadar } from "./Charts/ShortfallRadar";
import { InvestmentGrowthChart } from "./Charts/InvestmentGrowthChart";
import { LoanRundownChart } from "./Charts/LoanRundownChart";
import { GoalPlannerView } from "./GoalPlannerView";
import { ExpenseTrackerView } from "./ExpenseTrackerView";
import { LoanRefinanceView } from "./LoanRefinanceView";
import { CouplePlannerView } from "./CouplePlannerView";
import { EducationPlannerView } from "./EducationPlannerView";
import { MonthlyHistoryModal } from "./MonthlyHistoryModal";
import { QuickMonthlyCheckinModal } from "./QuickMonthlyCheckinModal";
import { FormulaModal, FormulaKey } from "./FormulaModal";
import { GettingStartedBanner } from "./GettingStartedBanner";
import { CollapsibleSection } from "./ui/CollapsibleSection";
import {
  Sparkles,
  ArrowRight,
  Sliders,
  Wallet,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  CreditCard,
  PieChart,
  Target,
  Percent,
  Receipt,
  Users,
  Heart,
  GraduationCap,
  Layers,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Zap,
  CheckCircle2,
  History,
  Clock,
  Calculator,
  ListOrdered,
  Wand2,
  Edit3,
  Info,
  ChevronsUpDown,
} from "lucide-react";
import { InvestmentReturnCalculatorModal } from "./InvestmentReturnCalculatorModal";

type MainDashboardTab = "overview" | "goals" | "invest" | "debts" | "couple";

export const DashboardView: React.FC = () => {
  const {
    summary,
    profile,
    currency,
    setActiveTab,
    goToWizardStep,
    isQuickCheckinOpen,
    setIsQuickCheckinOpen,
    setIsReportModalOpen,
    logMonthlyCashflow,
    closeMonthAndRollNext,
    captureYearlySnapshot,
    setPlanningCadence,
  } = useFinancialStore();
  
  const [loggedToast, setLoggedToast] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isInvestCalcOpen, setIsInvestCalcOpen] = useState(false);
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<FormulaKey>("retirement_nest_egg");

  // Inner collapsible card states
  const [isPaycheckOpen, setIsPaycheckOpen] = useState<boolean>(true);
  const [isAssetsOpen, setIsAssetsOpen] = useState<boolean>(true);
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(false);
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(true);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);

  const areAllExpanded = isPaycheckOpen && isAssetsOpen && isRadarOpen && isActionsOpen && isToolsOpen;
  const toggleExpandAll = () => {
    const nextState = !areAllExpanded;
    setIsPaycheckOpen(nextState);
    setIsAssetsOpen(nextState);
    setIsRadarOpen(nextState);
    setIsActionsOpen(nextState);
    setIsToolsOpen(nextState);
  };

  const {
    netWorth,
    cashFlow,
    shortfalls,
    keyActionItems,
    investmentGrowthTrajectory,
    loanPayoffTrajectory,
    totalLoanInterestLifetime,
    computedGoals,
  } = summary;

  const [activeTab, setActiveMainTab] = useState<MainDashboardTab>("overview");
  
  // Secondary sub-tab states inside each category
  const [goalsSubTab, setGoalsSubTab] = useState<"milestones" | "education">("milestones");
  const [investSubTab, setInvestSubTab] = useState<"dca_growth" | "expense_audit">("dca_growth");
  const [debtSubTab, setDebtSubTab] = useState<"rundown" | "refinance">("rundown");

  const criticalCount = shortfalls.filter((s) => s.status === "critical").length;
  const childCount = profile.dependents.filter((d) => d.relationship === "child").length;
  const isCoupleEnabled = profile.partner?.isEnabled;

  const activeMonthYear = profile.activePlanningMonthYear || "2026-08";
  const [yStr, mStr] = activeMonthYear.split("-");
  const activeDate = new Date(parseInt(yStr || "2026", 10), parseInt(mStr || "8", 10) - 1, 1);
  const activeMonthLabel = activeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let nextMonthNum = parseInt(mStr || "8", 10) + 1;
  let nextYearNum = parseInt(yStr || "2026", 10);
  if (nextMonthNum > 12) {
    nextMonthNum = 1;
    nextYearNum += 1;
  }
  const nextDate = new Date(nextYearNum, nextMonthNum - 1, 1);
  const nextMonthLabel = nextDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Net Worth Hero Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-black tracking-wider text-indigo-200">
                Your Net Worth
              </span>
              {isCoupleEnabled && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" /> Couple ({profile.partner?.name || "Partner"})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => goToWizardStep(3)}
              className="flex items-center gap-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full border border-white/20 transition-all cursor-pointer shadow-sm"
              title="Edit your bank savings, investments & debts in Step 3"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {formatCurrency(netWorth.netWorth, currency)}
          </div>

          {/* Asset vs Liability Split */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
            <div>
              <div className="text-[11px] text-slate-300 font-medium">What You Own (Assets)</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">
                {formatCurrency(netWorth.totalAssets, currency)}
              </div>
              <div className="text-[10px] text-indigo-200 mt-0.5">
                Auto-Invest: {formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency)}/mo
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-300 font-medium">What You Owe (Debts)</div>
              <div className="text-sm sm:text-base font-extrabold text-rose-400 mt-0.5">
                {formatCurrency(netWorth.totalLiabilities, currency)}
              </div>
              <div className="text-[10px] text-indigo-200 mt-0.5">
                Monthly Debt: {cashFlow.debtToIncomeRatio}% of pay
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar - Clean, uncluttered 4 to 5 Pillar Tabs */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveMainTab("overview")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "overview"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <PieChart className="w-3.5 h-3.5 shrink-0" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveMainTab("goals")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "goals"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span>Goals</span>
          {childCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveMainTab("invest")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "invest"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>Invest</span>
        </button>

        <button
          onClick={() => setActiveMainTab("debts")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "debts"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0" />
          <span>Debts</span>
        </button>

        {isCoupleEnabled && (
          <button
            onClick={() => setActiveMainTab("couple")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "couple"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0 fill-current" />
            <span>Couple</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PILLAR 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Welcome & Getting Started Onboarding Banner for New Users */}
          <GettingStartedBanner />

          {/* Toast Notification */}
          {loggedToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {loggedToast}
              </span>
              <button onClick={() => setLoggedToast(null)} className="text-white/80 hover:text-white text-xs font-black ml-2">
                ✕
              </button>
            </div>
          )}

          {/* High-Contrast Cadence Status & Monthly Lifecycle Card */}
          {(profile.planningCadence || "monthly") === "monthly" ? (
            <div className="fin-card p-4 bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/40 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Monthly Pulse
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {activeMonthLabel} (Active)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Past Snapshots ({profile.monthlyLogs?.length || 0})</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                    {activeMonthLabel} Net Cashflow:
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    +{formatCurrency(cashFlow.monthlyNetSavings, currency)} / month
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                    Monthly Savings Rate:
                  </span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                    {cashFlow.savingsRatePercentage}% of pay
                  </span>
                </div>
              </div>

              {/* Monthly Transition Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickCheckinOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-slate-950" />
                  <span>1-Click Monthly Check-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logMonthlyCashflow();
                    setLoggedToast(`Recorded ${activeMonthLabel} milestone snapshot!`);
                    setTimeout(() => setLoggedToast(null), 3000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Archive current month numbers into Vault history without rolling the calendar"
                >
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Log Snapshot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeMonthAndRollNext();
                    setLoggedToast(`Archived ${activeMonthLabel} snapshot & advanced to ${nextMonthLabel}!`);
                    setTimeout(() => setLoggedToast(null), 4000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Close &amp; Start {nextMonthLabel.split(" ")[0]}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="fin-card p-4 bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-500/40 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" /> Annual Review
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    ⏳ 11 Months to Next Review
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  {profile.yearlySnapshots?.length || 0} Annual Records
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                    Annual Savings Created:
                  </span>
                  <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                    +{formatCurrency(cashFlow.monthlyNetSavings * 12, currency)} / year
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                    Savings Rate:
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {cashFlow.savingsRatePercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    captureYearlySnapshot();
                    setLoggedToast(`Captured ${new Date().getFullYear()} Annual Snapshot!`);
                    setTimeout(() => setLoggedToast(null), 3000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Capture {new Date().getFullYear()} Snapshot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("wizard")}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Full Annual Check-In</span>
                </button>
              </div>
            </div>
          )}

          {/* Overview Section Controls / Compact Toggle */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Financial Breakdown ({[isPaycheckOpen, isAssetsOpen, isRadarOpen, isActionsOpen, isToolsOpen].filter(Boolean).length}/5 Open)
            </span>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-xs"
            >
              <ChevronsUpDown className="w-3 h-3" />
              <span>{areAllExpanded ? "Collapse All (Compact)" : "Expand All"}</span>
            </button>
          </div>

          {/* Card 1: Monthly Paycheck Split */}
          <CollapsibleSection
            variant="card"
            title="Monthly Paycheck Split"
            subtitle="Income vs Living Bills vs Savings"
            icon={<Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            isOpenControlled={isPaycheckOpen}
            onToggleControlled={setIsPaycheckOpen}
            collapsedSummary={
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                +{formatCurrency(cashFlow.monthlyNetSavings, currency)}/mo ({cashFlow.savingsRatePercentage}% saved)
              </span>
            }
            badge={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToWizardStep(2);
                }}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800"
              >
                <Edit3 className="w-2.5 h-2.5" /> Edit
              </button>
            }
          >
            <div className="pt-2">
              <CashflowBreakdown
                income={cashFlow.totalMonthlyIncome}
                expenses={cashFlow.totalMonthlyExpenses}
                savings={cashFlow.monthlyNetSavings}
                savingsRate={cashFlow.savingsRatePercentage}
                currency={currency}
              />
            </div>
          </CollapsibleSection>

          {/* Card 2: Where Your Money Lives */}
          <CollapsibleSection
            variant="card"
            title="Where Your Money Lives"
            subtitle="Cash, stocks, property & retirement"
            icon={<Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            isOpenControlled={isAssetsOpen}
            onToggleControlled={setIsAssetsOpen}
            collapsedSummary={
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                Assets: {formatCurrency(netWorth.totalAssets, currency)}
              </span>
            }
            badge={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToWizardStep(3);
                }}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800"
              >
                <Edit3 className="w-2.5 h-2.5" /> Edit
              </button>
            }
          >
            <div className="pt-2">
              <NetWorthDonut
                assets={profile.assets}
                insurancePolicies={profile.insurancePolicies}
                currency={currency}
              />
            </div>
          </CollapsibleSection>

          {/* Card 3: Safety Net & Goal Health */}
          <CollapsibleSection
            variant="card"
            title="Safety Net & Goal Health"
            subtitle="Emergency fund, critical illness & retirement"
            icon={<ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            isOpenControlled={isRadarOpen}
            onToggleControlled={setIsRadarOpen}
            collapsedSummary={
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                Health Score: {summary.overallFinancialHealthScore}/100
              </span>
            }
            badge={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToWizardStep(4);
                }}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800"
              >
                <Edit3 className="w-2.5 h-2.5" /> Edit
              </button>
            }
          >
            <div className="pt-2">
              <ShortfallRadar
                shortfalls={shortfalls}
                currency={currency}
                onSelectCategory={() => setActiveTab("shortfall")}
              />
            </div>
          </CollapsibleSection>

          {/* Card 4: Recommended Next Steps */}
          <CollapsibleSection
            variant="card"
            title="Recommended Next Steps"
            subtitle="Automated guidance for your plan"
            icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
            isOpenControlled={isActionsOpen}
            onToggleControlled={setIsActionsOpen}
            collapsedSummary={
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                {keyActionItems.length} Action Steps
              </span>
            }
          >
            <div className="space-y-2 pt-2">
              {keyActionItems.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>

            {/* Advisory Suggestion Disclaimer */}
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Suggestion Disclaimer:</strong> These recommended next steps are automated guidance ideas based on your inputs and assumptions. They are helpful suggestions to consider, not mandatory requirements to follow.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => goToWizardStep(1)}
                className="py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                title="Open the 5-step guided financial setup"
              >
                <Wand2 className="w-3.5 h-3.5" /> Setup
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("simulator")}
                className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" /> What-If
              </button>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Proposal
              </button>
            </div>
          </CollapsibleSection>

          {/* Planning Tools */}
          <CollapsibleSection
            variant="card"
            title="Interactive Planning Tools"
            subtitle="What-if simulations, loan refinance & calculators"
            icon={<Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            isOpenControlled={isToolsOpen}
            onToggleControlled={setIsToolsOpen}
            collapsedSummary={
              <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">
                6 Calculators
              </span>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div
                onClick={() => setActiveTab("shortfall")}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Safety Gaps</span>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {criticalCount > 0 ? `${criticalCount} gap(s) to patch` : "100% Protected"}
                </p>
              </div>

              <div
                onClick={() => {
                  setActiveMainTab("goals");
                  setGoalsSubTab("milestones");
                }}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Milestone Goals</span>
                  <Target className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {computedGoals.length} milestones active
                </p>
              </div>

              <div
                onClick={() => {
                  setActiveMainTab("invest");
                  setInvestSubTab("expense_audit");
                }}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Spending Audit</span>
                  <Receipt className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Find leaky buckets
                </p>
              </div>

              <div
                onClick={() => setActiveMainTab("couple")}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Couple & Joint</span>
                  <Heart className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {isCoupleEnabled ? `Active: ${profile.partner?.name}` : "Retire together"}
                </p>
              </div>

              {childCount > 0 && (
                <div
                  onClick={() => {
                    setActiveMainTab("goals");
                    setGoalsSubTab("education");
                  }}
                  className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Kids Education</span>
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {childCount} child university funds
                  </p>
                </div>
              )}

              <div
                onClick={() => {
                  setActiveMainTab("debts");
                  setDebtSubTab("refinance");
                }}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interest Killer</span>
                  <Percent className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Refinance & early payoff
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedFormulaKey("retirement_nest_egg");
                  setIsFormulaModalOpen(true);
                }}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Formula Guide</span>
                  <Calculator className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Transparent math & derivations
                </p>
              </div>

              <div
                onClick={() => setActiveTab("priorities")}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Priority Roadmap</span>
                  <ListOrdered className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Phased budget action plan
                </p>
              </div>

              <div
                onClick={() => setIsInvestCalcOpen(true)}
                className="fin-card fin-card-interactive p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Actual % Return</span>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Calculate CAGR from DCA
                </p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: GOALS & KIDS EDUCATION */}
      {/* ========================================================================= */}
      {activeTab === "goals" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub-Switch: 3-Bucket Milestones vs. Kids Education */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setGoalsSubTab("milestones")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                goalsSubTab === "milestones"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>3-Bucket Life Goals ({computedGoals.length})</span>
            </button>

            <button
              onClick={() => setGoalsSubTab("education")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                goalsSubTab === "education"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Kids' University Fund ({childCount})</span>
            </button>
          </div>

          {goalsSubTab === "milestones" ? <GoalPlannerView /> : <EducationPlannerView />}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 3: INVEST & EXPENSE AUDIT */}
      {/* ========================================================================= */}
      {activeTab === "invest" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub-Switch: Robos & DCA vs. Expense Audit */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setInvestSubTab("dca_growth")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                investSubTab === "dca_growth"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Robo-Advisors & DCA Growth</span>
            </button>

            <button
              onClick={() => setInvestSubTab("expense_audit")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                investSubTab === "expense_audit"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Spending Audit & Leaky Buckets</span>
            </button>
          </div>

          {investSubTab === "dca_growth" ? (
            <div className="space-y-4">
              <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Robo-Advisor & Dollar-Cost Averaging (DCA) Growth
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tracking your regular monthly contributions (e.g. $100/mo into Syfe, Endowus, or Retirement Insurance) and projecting your compounded future value at age {profile.targetRetirementAge}.
                </p>
              </div>

              <InvestmentGrowthChart
                trajectory={investmentGrowthTrajectory}
                assets={profile.assets}
                insurancePolicies={profile.insurancePolicies}
                currency={currency}
                retirementAge={profile.targetRetirementAge}
              />
            </div>
          ) : (
            <ExpenseTrackerView />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 4: DEBTS & REFINANCING */}
      {/* ========================================================================= */}
      {activeTab === "debts" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub-Switch: Run-Down vs. Refinancing */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDebtSubTab("rundown")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                debtSubTab === "rundown"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Loan Amortization Run-Down</span>
            </button>

            <button
              onClick={() => setDebtSubTab("refinance")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                debtSubTab === "refinance"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Refinance & Early Payoff Savings</span>
            </button>
          </div>

          {debtSubTab === "rundown" ? (
            <LoanRundownChart
              trajectory={loanPayoffTrajectory}
              liabilities={profile.liabilities}
              currency={currency}
              totalLifetimeInterest={totalLoanInterestLifetime}
            />
          ) : (
            <LoanRefinanceView />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 5: COUPLE & JOINT HOUSEHOLD PLAN */}
      {/* ========================================================================= */}
      {activeTab === "couple" && (
        <div className="animate-in fade-in duration-200">
          <CouplePlannerView />
        </div>
      )}

      {/* Monthly Historical Snapshots Modal */}
      <MonthlyHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* 1-Click Streamlined Monthly Check-In Modal */}
      <QuickMonthlyCheckinModal
        isOpen={isQuickCheckinOpen}
        onClose={() => setIsQuickCheckinOpen(false)}
        onSuccessToast={(msg) => {
          setLoggedToast(msg);
          setTimeout(() => setLoggedToast(null), 4000);
        }}
      />

      {/* Formula & Derivation Guide Modal */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        initialKey={selectedFormulaKey}
      />

      {/* Actual % Investment Return (CAGR / IRR) Modal */}
      <InvestmentReturnCalculatorModal
        isOpen={isInvestCalcOpen}
        onClose={() => setIsInvestCalcOpen(false)}
      />
    </div>
  );
};
