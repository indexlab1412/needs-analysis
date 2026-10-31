"use client";

import React, { useState } from "react";
import { useFinancialStore, DashboardFocusArea, CashflowSubTab, NetWorthSubTab, SafetySubTab, GoalsSubTab } from "@/context/financial-store";
import { formatCurrency, generateId } from "@/lib/utils";
import { IncomeItem } from "@/lib/fna/types";
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
import { PriorityPlannerView } from "./PriorityPlannerView";
import { IllnessShieldCard } from "./IllnessShieldCard";
import { MonthlyHistoryModal } from "./MonthlyHistoryModal";
import { QuickMonthlyCheckinModal } from "./QuickMonthlyCheckinModal";
import { FormulaModal, FormulaKey } from "./FormulaModal";
import { InvestmentReturnCalculatorModal } from "./InvestmentReturnCalculatorModal";
import { DividendSnowballView } from "./DividendSnowballView";
import { GettingStartedBanner } from "./GettingStartedBanner";
import { BackupReminderBanner } from "./BackupReminderBanner";
import { CollapsibleSection } from "./ui/CollapsibleSection";
import { NumericInput } from "./ui/NumericInput";
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
  ChevronLeft,
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
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  LayoutGrid,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const {
    summary,
    profile,
    updateProfile,
    currency,
    isPrivacyMode,
    togglePrivacyMode,
    setActiveTab,
    goToWizardStep,
    isQuickCheckinOpen,
    setIsQuickCheckinOpen,
    setIsReportModalOpen,
    logMonthlyCashflow,
    closeMonthAndRollNext,
    captureYearlySnapshot,
    dashboardFocusArea,
    setDashboardFocusArea,
    cashflowSubTab,
    setCashflowSubTab,
    netWorthSubTab,
    setNetWorthSubTab,
    safetySubTab,
    setSafetySubTab,
    goalsSubTab,
    setGoalsSubTab,
    dashboardInvestSubTab,
    setDashboardInvestSubTab,
  } = useFinancialStore();

  const [loggedToast, setLoggedToast] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isInvestCalcOpen, setIsInvestCalcOpen] = useState(false);
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<FormulaKey>("savings_rate");

  // Inner collapsible states for overview widgets
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

  const discretionaryExpenses = Math.max(0, cashFlow.totalMonthlyExpenses - cashFlow.essentialMonthlyExpenses);

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

  // Inline income editing helpers for Monthly Cashflow
  const handleAddIncome = () => {
    const newItem: IncomeItem = {
      id: generateId("inc"),
      category: "employment",
      description: "Additional Income",
      monthlyAmount: 500,
    };
    updateProfile((p) => ({ ...p, incomes: [newItem, ...p.incomes] }));
  };

  const handleUpdateIncome = (id: string, updates: Partial<IncomeItem>) => {
    updateProfile((p) => ({
      ...p,
      incomes: p.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  };

  const handleRemoveIncome = (id: string) => {
    updateProfile((p) => ({
      ...p,
      incomes: p.incomes.filter((i) => i.id !== id),
    }));
  };

  const openFormula = (key: FormulaKey) => {
    setSelectedFormulaKey(key);
    setIsFormulaModalOpen(true);
  };

  // Focus Area Definitions
  const focusAreas: {
    id: DashboardFocusArea;
    label: string;
    shortLabel: string;
    icon: any;
    color: string;
    accentBg: string;
    accentBorder: string;
    primaryMetric: string;
    secondaryMetric: string;
    statusBadge: string;
    subpagesLabel: string;
    formulaKey: FormulaKey;
    wizardStep: number;
  }[] = [
    {
      id: "cashflow",
      label: "Monthly Cashflow & Spending",
      shortLabel: "Cashflow",
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      primaryMetric: `+${formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}/mo`,
      secondaryMetric: `${cashFlow.savingsRatePercentage}% of income saved`,
      statusBadge: cashFlow.savingsRatePercentage >= 20 ? "Healthy Savings" : "Tight Buffer",
      subpagesLabel: "Paycheck Split • Spending Audit • Check-In",
      formulaKey: "savings_rate",
      wizardStep: 2,
    },
    {
      id: "net_worth",
      label: "Net Worth, Assets & Loans",
      shortLabel: "Net Worth",
      icon: Wallet,
      color: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      primaryMetric: formatCurrency(netWorth.netWorth, currency, 0, isPrivacyMode),
      secondaryMetric: `Assets: ${formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode)} • Debts: ${formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode)}`,
      statusBadge: netWorth.netWorth >= 0 ? "Positive Equity" : "Debt Heavy",
      subpagesLabel: "Balance Sheet • Loan Run-Down • Refinance",
      formulaKey: "net_worth",
      wizardStep: 3,
    },
    {
      id: "invest",
      label: "Investments & Wealth Engine",
      shortLabel: "Investments",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      accentBg: "bg-indigo-500/10",
      accentBorder: "border-indigo-500/30",
      primaryMetric: `${formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency, 0, isPrivacyMode)}/mo DCA`,
      secondaryMetric: `Retire Target Age ${profile.targetRetirementAge}`,
      statusBadge: cashFlow.totalMonthlyDCAInvestments > 0 ? "Compounding Active" : "No Regular DCA",
      subpagesLabel: "Robo DCA Growth • Dividend Snowball • IRR Return",
      formulaKey: "retirement_nest_egg",
      wizardStep: 3,
    },
    {
      id: "safety",
      label: "Safety Net & Gaps",
      shortLabel: "Safety Net",
      icon: ShieldCheck,
      color: "text-blue-600 dark:text-blue-400",
      accentBg: "bg-blue-500/10",
      accentBorder: "border-blue-500/30",
      primaryMetric: `${summary.overallFinancialHealthScore}/100 Health`,
      secondaryMetric: criticalCount > 0 ? `${criticalCount} Critical Gaps to Patch` : "100% Core Protected",
      statusBadge: criticalCount > 0 ? "Gaps Present" : "Optimal Cover",
      subpagesLabel: "Radar Gaps • Illness Shield • Priority Sequencer",
      formulaKey: "emergency_fund",
      wizardStep: 4,
    },
    {
      id: "goals",
      label: "Life Goals & Education",
      shortLabel: "Goals",
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
      accentBg: "bg-purple-500/10",
      accentBorder: "border-purple-500/30",
      primaryMetric: `${computedGoals.length} Active Goals`,
      secondaryMetric: childCount > 0 ? `${childCount} Children University Funds` : "Target Milestones",
      statusBadge: computedGoals.length > 0 ? "Tracked" : "Add Milestones",
      subpagesLabel: "3-Bucket Milestones • Kids' University Fund",
      formulaKey: "goal_sinking_fund",
      wizardStep: 5,
    },
    {
      id: "couple",
      label: "Couple & Joint Plan",
      shortLabel: "Couple Plan",
      icon: Heart,
      color: "text-rose-600 dark:text-rose-400",
      accentBg: "bg-rose-500/10",
      accentBorder: "border-rose-500/30",
      primaryMetric: isCoupleEnabled ? `${profile.partner?.name || "Partner"}` : "Solo Plan",
      secondaryMetric: isCoupleEnabled ? "Joint Cashflow & Dual CPF" : "Enable Joint Household",
      statusBadge: isCoupleEnabled ? "Joint Enabled" : "Optional",
      subpagesLabel: "Combined Cashflow • Dual CPF • 1-Salary Runway",
      formulaKey: "couple_burn_rate",
      wizardStep: 1,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Face-to-Face Privacy Shield Notice Banner (When Active) */}
      {isPrivacyMode && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 min-w-0">
            <span className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
              <EyeOff className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <strong className="font-extrabold text-emerald-950 dark:text-emerald-100">
                Face-to-Face Privacy Shield Active:
              </strong>{" "}
              <span className="text-emerald-800/90 dark:text-emerald-300/90">
                Monthly income, net worth &amp; sensitive balances are masked with ••••••
              </span>
            </div>
          </div>
          <button
            onClick={togglePrivacyMode}
            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Reveal / Unmask
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {loggedToast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {loggedToast}
          </span>
          <button
            onClick={() => setLoggedToast(null)}
            className="text-white/80 hover:text-white text-xs font-black ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP & MOBILE TOP AREA SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <button
          type="button"
          onClick={() => setDashboardFocusArea("hub")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            dashboardFocusArea === "hub"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Command Hub</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-1" />

        {focusAreas.map((area) => {
          const Icon = area.icon;
          const isActive = dashboardFocusArea === area.id;

          if (area.id === "couple" && !isCoupleEnabled) return null;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setDashboardFocusArea(area.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{area.shortLabel}</span>
              {area.id === "safety" && criticalCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COMMAND HUB (High-Impact Scannable Launchpad) */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "hub" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Welcome & Getting Started Onboarding Banner */}
          <GettingStartedBanner />

          {/* Smart Local Backup Reminder */}
          <BackupReminderBanner />

          {/* 1. Full-Width Monthly Pulse Hero Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Active Cadence
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  {activeMonthLabel} Monthly Pulse
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200">
                  {summary.overallFinancialHealthScore}/100 Health Score
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Retaining <strong className="text-emerald-400">+{formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}/mo</strong> ({cashFlow.savingsRatePercentage}% savings rate) from {formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode)} income. Tap any section below to focus and review.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickCheckinOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>1-Click Monthly Check-In</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                title="View past snapshots"
              >
                <History className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">History ({profile.monthlyLogs?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Focus Launchpad 6-Card Grid (Full Desktop Canvas) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Financial Areas (Tap to focus &amp; work)
              </h2>
              <span className="text-[11px] text-slate-400">
                Click any domain to review calculations &amp; subpages
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {focusAreas.map((area) => {
                const Icon = area.icon;

                if (area.id === "couple" && !isCoupleEnabled) {
                  return (
                    <div
                      key={area.id}
                      onClick={() => {
                        updateProfile((p) => ({
                          ...p,
                          planningScope: "joint",
                          partner: {
                            isEnabled: true,
                            name: "Partner",
                            currentAge: p.currentAge,
                            targetRetirementAge: p.targetRetirementAge,
                            monthlyIncome: 3500,
                            monthlyPersonalExpenses: 800,
                            personalDebts: 0,
                            monthlyDebtRepayment: 0,
                            liquidSavings: 15000,
                            investmentsValue: 10000,
                            monthlyDCA: 200,
                            deathBenefit: 300000,
                            ciBenefit: 150000,
                            cpfLifeEstimatedMonthlyToday: 1650,
                          },
                        }));
                        setDashboardFocusArea("couple");
                      }}
                      className="p-5 bg-white dark:bg-slate-900 border border-dashed border-rose-300 dark:border-rose-800/60 rounded-3xl p-5 hover:border-rose-500 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                              <Heart className="w-4 h-4" />
                            </span>
                            <span className="text-xs uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">
                              Couple &amp; Joint Plan
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Optional
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                          Planning together with a partner?
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Enable couple mode to simulate joint household cashflow, single-salary job-loss runway, and dual CPF LIFE floors.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:underline">
                        <span>Activate Couple Planner</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={area.id}
                    onClick={() => setDashboardFocusArea(area.id)}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-xl ${area.accentBg} ${area.color} flex items-center justify-center font-bold`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-xs uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                            {area.label}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${area.accentBg} ${area.color}`}>
                          {area.statusBadge}
                        </span>
                      </div>

                      {/* Primary Value */}
                      <div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {area.primaryMetric}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {area.secondaryMetric}
                        </div>
                      </div>

                      {/* Subpages Badge */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{area.subpagesLabel}</span>
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFormula(area.formulaKey);
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                        title="View mathematical derivation"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Formula</span>
                      </button>

                      <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Focus on Area</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Bottom Next Steps & Full Setup Launcher */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Recommended Action Steps
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Automated guidance
                  </span>
                </div>

                <div className="space-y-2">
                  {keyActionItems.slice(0, 3).map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-3">
              <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-300" />
                  <h3 className="text-xs uppercase font-black tracking-wider text-indigo-200">
                    Holistic Setup Wizard
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Need to update your baseline family details, insurance policies, or retirement targets? Run through the 5-step guided wizard anytime.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToWizardStep(1, "hub")}
                    className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-sm hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Open Setup Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: MONTHLY CASHFLOW */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "cashflow" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Workspace Sticky Header */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardFocusArea("hub")}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Return to Command Hub"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Monthly Cashflow &amp; Spending Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                Focus strictly on monthly paycheck retention, 50/30/20 budget allocations, and spending audit.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-9 md:pl-0">
              <button
                type="button"
                onClick={() => openFormula("savings_rate")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>How It's Calculated</span>
              </button>

              <button
                type="button"
                onClick={() => goToWizardStep(2, "cashflow")}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Wizard Step 2</span>
              </button>
            </div>
          </div>

          {/* Subpages Segmented Bar */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCashflowSubTab("split")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                cashflowSubTab === "split"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>1. Paycheck Split &amp; Calculations</span>
            </button>

            <button
              type="button"
              onClick={() => setCashflowSubTab("audit")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                cashflowSubTab === "audit"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>2. Spending Audit &amp; Bills ({profile.expenses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCashflowSubTab("history")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                cashflowSubTab === "history"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              <span>3. Check-In &amp; Past Logs ({profile.monthlyLogs?.length || 0})</span>
            </button>
          </div>

          {/* Subpage 1: Paycheck Split & Interactive Calculation Trace */}
          {cashflowSubTab === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
              {/* Left Column: Visual Split Chart & Key Metrics */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Monthly Paycheck Flow
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Inflow vs Living Expenses vs Free Retained Savings
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {cashFlow.savingsRatePercentage}% Retained
                    </span>
                  </div>

                  <CashflowBreakdown
                    income={cashFlow.totalMonthlyIncome}
                    expenses={cashFlow.totalMonthlyExpenses}
                    savings={cashFlow.monthlyNetSavings}
                    savingsRate={cashFlow.savingsRatePercentage}
                    currency={currency}
                  />
                </div>

                {/* 50 / 30 / 20 Rule Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      50 / 30 / 20 Budget Health
                    </span>
                    <button
                      type="button"
                      onClick={() => setCashflowSubTab("audit")}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Audit Bills &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">
                        Needs (Target 50%)
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        {formatCurrency(cashFlow.essentialMonthlyExpenses, currency, 0, isPrivacyMode)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cashFlow.totalMonthlyIncome > 0 ? Math.round((cashFlow.essentialMonthlyExpenses / cashFlow.totalMonthlyIncome) * 100) : 0}% of pay
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                      <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block">
                        Wants (Target 30%)
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        {formatCurrency(discretionaryExpenses, currency, 0, isPrivacyMode)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cashFlow.totalMonthlyIncome > 0 ? Math.round((discretionaryExpenses / cashFlow.totalMonthlyIncome) * 100) : 0}% of pay
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                        Save/Invest (20%)
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        {formatCurrency(cashFlow.monthlyNetSavings + cashFlow.totalMonthlyDCAInvestments, currency, 0, isPrivacyMode)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {cashFlow.savingsRatePercentage}% achieved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Calculation Lineage Trace + Inline Income Editor */}
              <div className="lg:col-span-6 space-y-6">
                {/* Mathematical Lineage Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4" /> How These Numbers Are Calculated
                    </span>
                    <button
                      type="button"
                      onClick={() => openFormula("savings_rate")}
                      className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      Formula Details &rarr;
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Total Monthly Income</span>
                        <span className="text-[10px] text-slate-400">Sum of {profile.incomes.length} active income stream(s)</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +{formatCurrency(cashFlow.totalMonthlyIncome, currency, 0, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">2. Total Living Expenses</span>
                        <span className="text-[10px] text-slate-400">Needs ({formatCurrency(cashFlow.essentialMonthlyExpenses, currency, 0, isPrivacyMode)}) + Wants ({formatCurrency(discretionaryExpenses, currency, 0, isPrivacyMode)})</span>
                      </div>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                        -{formatCurrency(cashFlow.totalMonthlyExpenses, currency, 0, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                      <div>
                        <span className="font-black text-indigo-950 dark:text-indigo-200 block">3. Monthly Net Savings (1 - 2)</span>
                        <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300">Free surplus cash retained before DCA</span>
                      </div>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
                        +{formatCurrency(cashFlow.monthlyNetSavings, currency, 0, isPrivacyMode)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Income Stream Quick-Editor */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        Inline Monthly Income Editor
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Edit take-home numbers directly without leaving this workspace
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddIncome}
                      className="py-1 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Stream</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {profile.incomes.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs"
                      >
                        <input
                          type="text"
                          value={inc.description}
                          onChange={(e) => handleUpdateIncome(inc.id, { description: e.target.value })}
                          className="flex-1 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                          placeholder="e.g. Salary / Freelance"
                        />

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold">{currency}</span>
                          <NumericInput
                            value={inc.monthlyAmount}
                            onChange={(val) => handleUpdateIncome(inc.id, { monthlyAmount: val })}
                            placeholder="0"
                            className="w-24 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-right text-emerald-600 dark:text-emerald-400"
                          />
                        </div>

                        {profile.incomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIncome(inc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove income stream"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subpage 2: Spending Audit & Itemized Bills */}
          {cashflowSubTab === "audit" && (
            <div className="animate-in fade-in duration-150">
              <ExpenseTrackerView />
            </div>
          )}

          {/* Subpage 3: Monthly Check-In, Close & History */}
          {cashflowSubTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Quick Check-In for {activeMonthLabel}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Update current month's take-home pay, bills, or irregular expenses in under 30 seconds.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQuickCheckinOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                    <span>Open 1-Click Monthly Check-In</span>
                  </button>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                      <span>Close Month &amp; Advance</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Archive {activeMonthLabel} numbers into your permanent financial history and roll forward to {nextMonthLabel}.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logMonthlyCashflow();
                        setLoggedToast(`Recorded ${activeMonthLabel} milestone snapshot!`);
                        setTimeout(() => setLoggedToast(null), 3000);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Log Snapshot
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeMonthAndRollNext();
                        setLoggedToast(`Archived ${activeMonthLabel} snapshot & advanced to ${nextMonthLabel}!`);
                        setTimeout(() => setLoggedToast(null), 4000);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      Close &amp; Roll
                    </button>
                  </div>
                </div>
              </div>

              {/* Monthly Historical Logs Table */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" />
                    Archived Monthly Snapshots ({profile.monthlyLogs?.length || 0})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Full History Modal &rarr;
                  </button>
                </div>

                {(!profile.monthlyLogs || profile.monthlyLogs.length === 0) ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No monthly snapshots archived yet. Complete a check-in or click "Log Snapshot" to start tracking.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.monthlyLogs.slice().reverse().map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {log.monthLabel || log.monthYear}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.keyNotes || "Monthly Snapshot"}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 block">
                            +{formatCurrency(log.netSavings, currency, 0, isPrivacyMode)}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.savingsRatePercentage}% saved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: NET WORTH, ASSETS & LOANS */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "net_worth" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardFocusArea("hub")}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Return to Command Hub"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Net Worth, Assets &amp; Loans Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                Manage your balance sheet, asset allocation, loan amortization, and refinancing savings.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-9 md:pl-0">
              <button
                type="button"
                onClick={() => openFormula("net_worth")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>How It's Calculated</span>
              </button>

              <button
                type="button"
                onClick={() => goToWizardStep(3, "net_worth")}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Wizard Step 3</span>
              </button>
            </div>
          </div>

          {/* Subpages Segmented Bar */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setNetWorthSubTab("balance_sheet")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                netWorthSubTab === "balance_sheet"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>1. Balance Sheet &amp; Asset Allocation</span>
            </button>

            <button
              type="button"
              onClick={() => setNetWorthSubTab("rundown")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                netWorthSubTab === "rundown"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>2. Loan Run-Down Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setNetWorthSubTab("refinance")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                netWorthSubTab === "refinance"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>3. Refinance &amp; Early Payoff</span>
            </button>
          </div>

          {netWorthSubTab === "balance_sheet" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Where Your Wealth Lives
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Total Assets: {formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode)}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {profile.assets.length} Assets
                    </span>
                  </div>

                  <NetWorthDonut
                    assets={profile.assets}
                    insurancePolicies={profile.insurancePolicies}
                    currency={currency}
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                {/* Balance Sheet Calculation Lineage */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4" /> Balance Sheet Math
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Total Assets</span>
                        <span className="text-[10px] text-slate-400">Liquid Cash + Investments + CPF + Real Estate</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +{formatCurrency(netWorth.totalAssets, currency, 0, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Total Liabilities</span>
                        <span className="text-[10px] text-slate-400">Mortgages, personal &amp; study loans ({profile.liabilities.length})</span>
                      </div>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                        -{formatCurrency(netWorth.totalLiabilities, currency, 0, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <span className="font-black text-emerald-950 dark:text-emerald-200 block">Current Net Worth</span>
                        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300">Equity free of debt</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrency(netWorth.netWorth, currency, 0, isPrivacyMode)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => goToWizardStep(3, "net_worth")}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Assets &amp; Liabilities in Wizard &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {netWorthSubTab === "rundown" && (
            <div className="animate-in fade-in duration-150">
              <LoanRundownChart
                trajectory={loanPayoffTrajectory}
                liabilities={profile.liabilities}
                currency={currency}
                totalLifetimeInterest={totalLoanInterestLifetime}
              />
            </div>
          )}

          {netWorthSubTab === "refinance" && (
            <div className="animate-in fade-in duration-150">
              <LoanRefinanceView />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: INVESTMENTS & WEALTH ENGINE */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "invest" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardFocusArea("hub")}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Return to Command Hub"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Investments &amp; Wealth Engine Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                Robo-advisor regular DCA compounding, dividend snowball passive income, and return calculators.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-9 md:pl-0">
              <button
                type="button"
                onClick={() => openFormula("retirement_nest_egg")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>How Nest Egg is Calculated</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInvestCalcOpen(true)}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Calculate IRR / CAGR</span>
              </button>
            </div>
          </div>

          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDashboardInvestSubTab("dca_growth")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                dashboardInvestSubTab === "dca_growth"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. Robos &amp; DCA Growth</span>
            </button>

            <button
              type="button"
              onClick={() => setDashboardInvestSubTab("dividends")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                dashboardInvestSubTab === "dividends"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>❄️</span>
              <span>2. Dividend Snowball ({profile.stockHoldings?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvestCalcOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40"
            >
              <Calculator className="w-4 h-4" />
              <span>3. Return Calculator (IRR)</span>
            </button>
          </div>

          {dashboardInvestSubTab === "dca_growth" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <InvestmentGrowthChart
                trajectory={investmentGrowthTrajectory}
                assets={profile.assets}
                insurancePolicies={profile.insurancePolicies}
                currency={currency}
                retirementAge={profile.targetRetirementAge}
              />
            </div>
          )}

          {dashboardInvestSubTab === "dividends" && (
            <div className="animate-in fade-in duration-150">
              <DividendSnowballView />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: SAFETY NET & GAPS */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "safety" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardFocusArea("hub")}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Return to Command Hub"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Safety Net &amp; Priority Protection Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                Audit insurance coverage gaps, Critical Illness salary replacement, and step-by-step priority sequencing.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-9 md:pl-0">
              <button
                type="button"
                onClick={() => openFormula("critical_illness")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>How Gap is Calculated</span>
              </button>

              <button
                type="button"
                onClick={() => goToWizardStep(4, "safety")}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Policies</span>
              </button>
            </div>
          </div>

          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSafetySubTab("gaps")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                safetySubTab === "gaps"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1. Radar Gaps &amp; Health</span>
            </button>

            <button
              type="button"
              onClick={() => setSafetySubTab("illness_shield")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                safetySubTab === "illness_shield"
                  ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Illness &amp; Income Shield</span>
            </button>

            <button
              type="button"
              onClick={() => setSafetySubTab("priorities")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                safetySubTab === "priorities"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>3. Priority Sequencer</span>
            </button>
          </div>

          {safetySubTab === "gaps" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Safety Radar
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Coverage across 5 financial pillars
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Score: {summary.overallFinancialHealthScore}/100
                    </span>
                  </div>

                  <ShortfallRadar
                    shortfalls={shortfalls}
                    currency={currency}
                    onSelectCategory={() => {}}
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {shortfalls.map((item) => (
                  <div
                    key={item.category}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.status === "critical"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : item.status === "warning"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}>
                        {item.coverageRatio}% Covered
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Required</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(item.requiredAmount, currency, 0, isPrivacyMode)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Existing</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(item.existingAmount, currency, 0, isPrivacyMode)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Shortfall</span>
                        <span className={`font-black ${item.shortfallAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {item.shortfallAmount > 0 ? `-${formatCurrency(item.shortfallAmount, currency, 0, isPrivacyMode)}` : "None 🎉"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl mt-1">
                      {item.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {safetySubTab === "illness_shield" && (
            <div className="animate-in fade-in duration-150">
              <IllnessShieldCard />
            </div>
          )}

          {safetySubTab === "priorities" && (
            <div className="animate-in fade-in duration-150">
              <PriorityPlannerView />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: LIFE GOALS & KIDS */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "goals" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardFocusArea("hub")}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Return to Command Hub"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Life Goals &amp; Kids' Education Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                Time-horizon bucketed sinking funds, inflation compounding, and children's university funds.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-9 md:pl-0">
              <button
                type="button"
                onClick={() => openFormula("goal_sinking_fund")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>How Sinking Fund is Calculated</span>
              </button>

              <button
                type="button"
                onClick={() => goToWizardStep(5, "goals")}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setGoalsSubTab("milestones")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                goalsSubTab === "milestones"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>1. 3-Bucket Milestones ({computedGoals.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setGoalsSubTab("education")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                goalsSubTab === "education"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>2. Kids' University Fund ({childCount})</span>
            </button>
          </div>

          {goalsSubTab === "milestones" ? <GoalPlannerView /> : <EducationPlannerView />}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED AREA WORKSPACE: COUPLE PLAN */}
      {/* ========================================================================= */}
      {dashboardFocusArea === "couple" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDashboardFocusArea("hub")}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Return to Command Hub"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-current" />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Couple &amp; Joint Household Workspace
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Retiring together with {profile.partner?.name || "Partner"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openFormula("couple_burn_rate")}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              <span>How Runway is Calculated</span>
            </button>
          </div>

          <CouplePlannerView />
        </div>
      )}

      {/* Historical Monthly Snapshots Modal */}
      <MonthlyHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* 1-Click Monthly Check-In Modal */}
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
