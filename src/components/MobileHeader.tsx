"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { SyncStatusBadge } from "./SyncStatusBadge";
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
  Heart,
  X,
  MoreVertical,
  QrCode,
  Globe,
  HelpCircle,
  FolderLock,
  ArrowRight,
  BookOpen,
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
    setIsSyncModalOpen,
    setIsGuideModalOpen,
    setActiveTab,
  } = useFinancialStore();

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 space-y-2">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Active Profile Name (Tap to switch personas / view options) */}
        <button
          onClick={() => setIsOptionsOpen(true)}
          className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity group cursor-pointer"
          title="Click to switch profiles or plan settings"
        >
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
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Age {profile.currentAge} • Retire {profile.targetRetirementAge}
            </p>
          </div>
        </button>

        {/* Clean, Streamlined Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Visual User Guide Button */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
            title="Open Platform Guide & Tutorial"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Multi-Device Encrypted Sync Status Badge */}
          <SyncStatusBadge onOpenModal={() => setIsSyncModalOpen(true)} />

          {/* Financial Fitness Score Chip */}
          <button
            onClick={() => setActiveTab("shortfall")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.color} transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
            title="Financial Fitness Score (Click to view shortfalls)"
          >
            <Activity className="w-3 h-3" />
            <span>{summary.overallFinancialHealthScore}/100</span>
          </button>

          {/* More Options / Settings Menu Button */}
          <button
            onClick={() => setIsOptionsOpen(true)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="More Options, Currency, Proposal Export & Settings"
            aria-label="Open Plan Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Cadence & Planning Scope Control Bar */}
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Cadence Switcher: Monthly vs Yearly */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setPlanningCadence("monthly")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
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

      {/* Unified Mobile Action & Settings Modal */}
      {isOptionsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setIsOptionsOpen(false)}
          />

          <div className="fixed left-3 right-3 top-14 max-w-md mx-auto bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-400/40 rounded-3xl shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4 ring-4 ring-black/10 dark:ring-white/5 max-h-[85vh] overflow-y-auto">
            {/* Header with Title & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Plan Settings & Tools
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Preferences, exports, and profile options
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Quick Actions
              </div>

              {/* Currency Selector Row */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Currency</span>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="SGD">S$ (SGD)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="MYR">RM (MYR)</option>
                  <option value="AUD">A$ (AUD)</option>
                  <option value="EUR">€ (EUR)</option>
                  <option value="GBP">£ (GBP)</option>
                </select>
              </div>

              {/* Export Full Proposal Button */}
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Download Proposal Report
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Full printable client money analysis
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              {/* Multi-Device QR Sync Button */}
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsSyncModalOpen(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Multi-Device Cloud Sync & QR
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      End-to-end encrypted live device pairing
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* Visual Platform Guide & Tutorial */}
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsGuideModalOpen(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      How to Use This Platform (Visual Guide)
                    </div>
                    <div className="text-[10px] text-indigo-700/80 dark:text-indigo-400">
                      Step-by-step walkthrough with visual examples
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700 transition-colors" />
              </button>

              {/* Getting Started Guide */}
              <button
                onClick={() => {
                  setWelcomeGuideDismissed(false);
                  setIsOptionsOpen(false);
                }}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      New User Guided Walkthrough
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Reopen the getting started banner
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </button>

            </div>

            {/* Life Stage Templates */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Load Life Stage Preset
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {Object.entries(SAMPLE_PROFILES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      loadPreset(key);
                      setIsOptionsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Start Clean / Close */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
              <button
                onClick={() => {
                  if (window.confirm("Start with a clean blank slate?")) {
                    resetProfile();
                    setIsOptionsOpen(false);
                  }
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start Clean (Blank)
              </button>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
