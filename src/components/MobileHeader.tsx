"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { SAMPLE_PROFILES } from "@/lib/fna/sample-data";
import {
  Sparkles,
  FileText,
  RotateCcw,
  ChevronDown,
  Activity,
  Calendar,
  Zap,
  User,
  Users,
  Heart,
  X,
} from "lucide-react";

export const MobileHeader: React.FC = () => {
  const {
    profile,
    summary,
    loadPreset,
    resetProfile,
    currency,
    setCurrency,
    setIsReportModalOpen,
    setPlanningCadence,
    setPlanningScope,
    isSamplePreset,
    isWelcomeGuideDismissed,
    setWelcomeGuideDismissed,
  } = useFinancialStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cadence = profile.planningCadence || "monthly";
  const isJoint = profile.planningScope === "joint" || profile.partner?.isEnabled;

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        label: "Crushing It!",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
      };
    }
    if (score >= 60) {
      return {
        label: "On Track",
        color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
      };
    }
    return {
      label: "Needs Love",
      color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
    };
  };

  const badge = getScoreBadge(summary.overallFinancialHealthScore);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 space-y-2">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Active Profile Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {profile.name || "My Money Plan"}
              </h1>
              {isSamplePreset ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                  Sample
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  Custom
                </span>
              )}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
                title="Switch Personas or Start Fresh"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Age {profile.currentAge} • Retire at {profile.targetRetirementAge}
            </p>
          </div>
        </div>

        {/* Action Controls & Health Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reopen Getting Started Guide if dismissed */}
          {isWelcomeGuideDismissed && (
            <button
              onClick={() => setWelcomeGuideDismissed(false)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              title="Reopen New User Getting Started Guide"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* Financial Fitness Score Chip */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}
            title="Your Adulting / Financial Fitness Score out of 100"
          >
            <Activity className="w-3 h-3" />
            <span>{summary.overallFinancialHealthScore}/100</span>
          </div>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-1.5 py-1 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="SGD">S$ (SGD)</option>
            <option value="USD">$ (USD)</option>
            <option value="MYR">RM (MYR)</option>
            <option value="AUD">A$ (AUD)</option>
            <option value="EUR">€ (EUR)</option>
            <option value="GBP">£ (GBP)</option>
          </select>

          {/* Export Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-colors"
            title="Download Your Complete Money Summary Proposal"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cadence & Planning Scope Control Bar */}
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Cadence Switcher: Monthly vs Yearly */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setPlanningCadence("monthly")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cadence === "monthly"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
            title="Maintain money monthly with granular cashflow tracking & leaky bucket audits"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Monthly Pulse</span>
          </button>

          <button
            onClick={() => setPlanningCadence("yearly")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cadence === "yearly"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
            title="Update income, assets, debts & goals once a year at tax season or year-end"
          >
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span>Annual Review</span>
          </button>
        </div>

        {/* Scope Switcher: Solo vs Joint / Couple */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setPlanningScope("individual")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              !isJoint
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <User className="w-3 h-3" />
            <span>Solo</span>
          </button>

          <button
            onClick={() => setPlanningScope("joint")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              isJoint
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <Heart className="w-3 h-3 fill-current" />
            <span>Couple</span>
          </button>
        </div>
      </div>

      {/* Preset & Profile Switcher Dropdown Modal with Backdrop */}
      {isDropdownOpen && (
        <>
          {/* Backdrop overlay to prevent click-through and separate popup from underlying dark/light sections */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setIsDropdownOpen(false)}
          />

          <div className="fixed left-4 right-4 top-20 max-w-md mx-auto bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-400/50 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 ring-4 ring-black/10 dark:ring-white/5">
            {/* Header with Title & Close Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    Financial Plan Options
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Switch profiles or start guided setup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Life Stage Templates */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Or Load a Life Stage Template
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(SAMPLE_PROFILES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      loadPreset(key);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-indigo-50/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/90 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
              <button
                onClick={() => {
                  resetProfile();
                  setIsDropdownOpen(false);
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start Clean (Blank)
              </button>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
