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

      {/* Preset & Profile Switcher Dropdown */}
      {isDropdownOpen && (
        <div className="absolute left-4 right-4 top-16 max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Choose a Sample Life Stage
          </div>
          <div className="space-y-1.5 mt-1">
            {Object.entries(SAMPLE_PROFILES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => {
                  loadPreset(key);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {item.description}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
            <button
              onClick={() => {
                resetProfile();
                setIsDropdownOpen(false);
              }}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset / Start Fresh
            </button>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
