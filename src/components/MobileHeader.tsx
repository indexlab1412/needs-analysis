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
  HeartHandshake,
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
  } = useFinancialStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Active Profile Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Age {profile.currentAge} • Planning for Age {profile.targetRetirementAge} Freedom
            </p>
          </div>
        </div>

        {/* Action Controls & Health Score */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Financial Fitness Score Chip */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}
            title="Your Adulting / Financial Fitness Score out of 100"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{summary.overallFinancialHealthScore}/100</span>
          </div>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
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
            <FileText className="w-4 h-4" />
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
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-slate-800 transition-colors flex items-start gap-2.5 border border-transparent hover:border-indigo-100 dark:hover:border-slate-700"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{item.description}</div>
                </div>
              </button>
            ))}

            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 px-1">
              <button
                onClick={() => {
                  resetProfile();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start with Blank Canvas</span>
              </button>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold px-3 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
