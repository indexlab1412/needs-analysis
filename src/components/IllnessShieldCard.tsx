"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import {
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const IllnessShieldCard: React.FC = () => {
  const { summary, currency } = useFinancialStore();
  const { illnessShield } = summary;
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInflationModal, setShowInflationModal] = useState(false);
  const [activePillar, setActivePillar] = useState<"early" | "major" | "paycheck">("early");

  if (!illnessShield) return null;

  const {
    earlyStageRecovery,
    majorStageReset,
    monthlyPaycheckShield,
    medicalInflationProjection,
    plainSummaryTakeaway,
  } = illnessShield;

  const averageCoverageRatio = Math.round(
    (earlyStageRecovery.coverageRatio + majorStageReset.coverageRatio + monthlyPaycheckShield.coverageRatio) / 3
  );

  const getStatusBadge = (status: "critical" | "warning" | "on_track" | "surplus") => {
    switch (status) {
      case "on_track":
      case "surplus":
        return {
          label: "100% Protected",
          bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
          barBg: "bg-emerald-500",
        };
      case "warning":
        return {
          label: "Partial Buffer",
          bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-700",
          barBg: "bg-amber-500",
        };
      case "critical":
      default:
        return {
          label: "Attention Needed",
          bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-700",
          barBg: "bg-rose-500",
        };
    }
  };

  const earlyBadge = getStatusBadge(earlyStageRecovery.status);
  const majorBadge = getStatusBadge(majorStageReset.status);
  const paycheckBadge = getStatusBadge(monthlyPaycheckShield.status);

  const overallStatus: "critical" | "warning" | "on_track" | "surplus" =
    averageCoverageRatio >= 100 ? "on_track" : averageCoverageRatio >= 50 ? "warning" : "critical";
  const overallBadge = getStatusBadge(overallStatus);

  return (
    <div
      className={`fin-card transition-all duration-200 border-l-4 border-l-indigo-600 rounded-2xl overflow-hidden ${
        isExpanded
          ? "bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-4 ring-indigo-500/10"
          : "bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:bg-white dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-600 shadow-none"
      }`}
    >
      {/* Clickable Header Bar (Identical Accordion Interaction as Other Cards) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 cursor-pointer flex items-center justify-between gap-3 select-none transition-colors ${
          isExpanded
            ? "bg-indigo-50/40 dark:bg-indigo-950/20"
            : "hover:bg-slate-200/50 dark:hover:bg-slate-750/50"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              overallStatus === "critical"
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                : overallStatus === "warning"
                ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
            }`}
          >
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                The Illness & Income Shield
              </h3>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                3-Tier
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Early recovery, 5-yr family reset & paycheck protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            <div
              className={`text-xs sm:text-sm font-black ${
                averageCoverageRatio < 100
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {averageCoverageRatio}% Covered
            </div>
            <span
              className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${overallBadge.bg}`}
            >
              {overallBadge.label}
            </span>
          </div>

          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              isExpanded
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
            }`}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 animate-in fade-in duration-200">
          {/* Human Takeaway Box */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-3 flex items-start gap-2.5 mt-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
              {plainSummaryTakeaway}
            </p>
          </div>

          {/* 3 Pillar Segmented Selector (Mobile Touch Friendly) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActivePillar("early")}
              className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                activePillar === "early"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-750"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-[11px] leading-tight font-bold">1.5-Yr Recovery</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${earlyBadge.bg}`}>
                {earlyStageRecovery.monthsSupported} mo
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar("major")}
              className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                activePillar === "major"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-750"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-[11px] leading-tight font-bold">5-Yr Reset</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${majorBadge.bg}`}>
                {majorStageReset.yearsSupported} yrs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar("paycheck")}
              className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                activePillar === "paycheck"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-750"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-[11px] leading-tight font-bold">Paycheck Shield</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${paycheckBadge.bg}`}>
                {monthlyPaycheckShield.coverageRatio}%
              </span>
            </button>
          </div>

          {/* Active Pillar Details Card */}
          {activePillar === "early" && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>🩹 Early-Stage Recovery Buffer</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    18 months of gross salary to take time off and rest without financial anxiety
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${earlyBadge.bg}`}>
                  {earlyBadge.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Current: <strong>{formatCurrency(earlyStageRecovery.existing, currency)}</strong>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Target: {formatCurrency(earlyStageRecovery.needed, currency)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${earlyBadge.barBg} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, earlyStageRecovery.coverageRatio)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{earlyStageRecovery.coverageRatio}% Funded ({earlyStageRecovery.monthsSupported} months)</span>
                  {earlyStageRecovery.gap > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Gap: -{formatCurrency(earlyStageRecovery.gap, currency)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Fully Covered
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePillar === "major" && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏥 5-Year Family Safety Net</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    5 full years of household expenses + treatment/caregiver cushion for major conditions
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${majorBadge.bg}`}>
                  {majorBadge.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Current: <strong>{formatCurrency(majorStageReset.existing, currency)}</strong>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Target: {formatCurrency(majorStageReset.needed, currency)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${majorBadge.barBg} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, majorStageReset.coverageRatio)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{majorStageReset.coverageRatio}% Funded ({majorStageReset.yearsSupported} yrs)</span>
                  {majorStageReset.gap > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Gap: -{formatCurrency(majorStageReset.gap, currency)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Fully Covered
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePillar === "paycheck" && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>💼 Monthly Paycheck Replacement</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Guaranteed 75% monthly salary replacement if disability prevents working
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${paycheckBadge.bg}`}>
                  {paycheckBadge.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Current: <strong>{formatCurrency(monthlyPaycheckShield.existingMonthly, currency)}/mo</strong>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Target: {formatCurrency(monthlyPaycheckShield.neededMonthly, currency)}/mo
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${paycheckBadge.barBg} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, monthlyPaycheckShield.coverageRatio)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{monthlyPaycheckShield.coverageRatio}% Covered</span>
                  {monthlyPaycheckShield.gapMonthly > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Gap: -{formatCurrency(monthlyPaycheckShield.gapMonthly, currency)}/mo
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Fully Covered
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hospital Inflation Future Proofer Accordion */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <button
              type="button"
              onClick={() => setShowInflationModal(!showInflationModal)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Hospital Bill Future-Proofer (10% Medical Inflation)
              </span>
              {showInflationModal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showInflationModal && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Medical inflation averages <strong>{medicalInflationProjection.annualMedicalInflationRate}% per year</strong> (over double normal inflation). Here is what a standard surgical hospitalization bill will cost over time:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] text-slate-400 block">Today</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {formatCurrency(medicalInflationProjection.baseBillToday, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium">In 10 Years</span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs">
                      {formatCurrency(medicalInflationProjection.billIn10Years, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 shadow-sm">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">In 20 Years</span>
                    <span className="font-bold text-purple-900 dark:text-purple-200 text-xs">
                      {formatCurrency(medicalInflationProjection.billIn20Years, currency)}
                    </span>
                    <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold block mt-0.5">
                      ({medicalInflationProjection.estimatedMultiplierIn20Years}x cost)
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  💡 Tip: An Integrated Shield Plan with As-Charged hospital limits automatically scales with medical inflation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
