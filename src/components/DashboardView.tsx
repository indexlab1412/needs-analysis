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
} from "lucide-react";

type MainDashboardTab = "overview" | "goals" | "invest" | "debts" | "couple";

export const DashboardView: React.FC = () => {
  const {
    summary,
    profile,
    currency,
    setActiveTab,
    setIsReportModalOpen,
    logMonthlyCashflow,
    closeMonthAndRollNext,
    captureYearlySnapshot,
    setPlanningCadence,
  } = useFinancialStore();
  const [loggedToast, setLoggedToast] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isQuickCheckinOpen, setIsQuickCheckinOpen] = useState(false);
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
      <div className="fin-card p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Your Net Worth
            </span>

            {/* Quick Couple / Solo Indicator Badge */}
            {isCoupleEnabled ? (
              <button
                onClick={() => setActiveMainTab("couple")}
                className="flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30 transition-all cursor-pointer"
              >
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                <span>Couple Active ({profile.partner?.name || "Partner"})</span>
              </button>
            ) : (
              <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-200 backdrop-blur-sm">
                Assets Minus Debts
              </span>
            )}
          </div>

          <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
            {formatCurrency(netWorth.netWorth, currency)}
          </div>

          {/* Asset vs Liability Split */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">What You Own (Assets)</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {formatCurrency(netWorth.totalAssets, currency)}
              </div>
              <div className="text-[10px] text-slate-400">
                Auto-Invest: {formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency)}/mo
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">What You Owe (Debts)</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5">
                {formatCurrency(netWorth.totalLiabilities, currency)}
              </div>
              <div className="text-[10px] text-slate-400">
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
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Monthly Pulse
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {activeMonthLabel} (Active)
                  </span>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl transition-colors"
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
                  onClick={() => setIsQuickCheckinOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 col-span-1 sm:col-span-1"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>1-Click Monthly Check-In</span>
                </button>

                <button
                  onClick={() => {
                    logMonthlyCashflow();
                    setLoggedToast(`Updated snapshot for ${activeMonthLabel}!`);
                    setTimeout(() => setLoggedToast(null), 3000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Quick Save</span>
                </button>

                <button
                  onClick={() => {
                    closeMonthAndRollNext();
                    setLoggedToast(`Archived ${activeMonthLabel} snapshot & advanced to ${nextMonthLabel}!`);
                    setTimeout(() => setLoggedToast(null), 4000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Close & Start {nextMonthLabel.split(" ")[0]}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="fin-card p-4 bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-500/40 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
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
                  onClick={() => {
                    captureYearlySnapshot();
                    setLoggedToast(`Captured ${new Date().getFullYear()} Annual Snapshot!`);
                    setTimeout(() => setLoggedToast(null), 3000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Capture {new Date().getFullYear()} Snapshot</span>
                </button>

                <button
                  onClick={() => setActiveTab("wizard")}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Full Annual Check-In</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Feature Hub Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div
              onClick={() => setActiveTab("shortfall")}
              className="fin-card fin-card-interactive p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Safety Gaps</span>
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    criticalCount > 0
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  {criticalCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {criticalCount > 0 ? `${criticalCount} gap(s) to patch` : "100% Protected"}
              </p>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                View safety gaps <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={() => {
                setActiveMainTab("goals");
                setGoalsSubTab("milestones");
              }}
              className="fin-card fin-card-interactive p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Milestone Goals</span>
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {computedGoals.length} milestones active
              </p>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                3-Bucket Plan <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={() => {
                setActiveMainTab("invest");
                setInvestSubTab("expense_audit");
              }}
              className="fin-card fin-card-interactive p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Spending Audit</span>
                <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Find leaky buckets
              </p>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                50/30/20 Split <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Couple Card (if not active, invites to connect) */}
            <div
              onClick={() => setActiveMainTab("couple")}
              className="fin-card fin-card-interactive p-3.5 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-2xl cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Couple & Joint</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                {isCoupleEnabled ? `Active: ${profile.partner?.name}` : "Retire together"}
              </p>
              <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                {isCoupleEnabled ? "Joint balance" : "Set up couple"} <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {childCount > 0 && (
              <div
                onClick={() => {
                  setActiveMainTab("goals");
                  setGoalsSubTab("education");
                }}
                className="fin-card fin-card-interactive p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Kids Education</span>
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                  {childCount} child university funds
                </p>
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Tuition Planner <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            <div
              onClick={() => {
                setActiveMainTab("debts");
                setDebtSubTab("refinance");
              }}
              className="fin-card fin-card-interactive p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interest Killer</span>
                <Percent className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Refinance & early payoff
              </p>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Save on loans <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Monthly Paycheck Flow Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Monthly Paycheck Split</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Income vs Living Bills vs Savings</p>
              </div>
              <button
                onClick={() => {
                  setActiveMainTab("invest");
                  setInvestSubTab("expense_audit");
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                Audit Items <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <CashflowBreakdown
              income={cashFlow.totalMonthlyIncome}
              expenses={cashFlow.totalMonthlyExpenses}
              savings={cashFlow.monthlyNetSavings}
              savingsRate={cashFlow.savingsRatePercentage}
              currency={currency}
            />
          </div>

          {/* Asset Breakdown */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Where Your Money Lives</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cash, robo-advisors & retirement funds</p>
              </div>
              <button
                onClick={() => {
                  setActiveMainTab("invest");
                  setInvestSubTab("dca_growth");
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                View Growth
              </button>
            </div>
            <NetWorthDonut
              assets={profile.assets}
              insurancePolicies={profile.insurancePolicies}
              currency={currency}
            />
          </div>

          {/* Shortfall Radar & Progress Cards */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Safety Net & Goal Health</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Emergency stash, illness cover & retirement progress</p>
              </div>
              <button
                onClick={() => setActiveTab("shortfall")}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Details
              </button>
            </div>
            <ShortfallRadar
              shortfalls={shortfalls}
              currency={currency}
              onSelectCategory={() => setActiveTab("shortfall")}
            />
          </div>

          {/* Action Steps */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Action Steps for Your 20s & 30s
            </h3>
            <div className="space-y-2">
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

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveTab("simulator")}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" /> What-If Simulator
              </button>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> View Proposal Report
              </button>
            </div>
          </div>
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
    </div>
  );
};
