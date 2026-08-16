"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Clock,
  GraduationCap,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export const ShortfallView: React.FC = () => {
  const { summary, currency, setActiveTab } = useFinancialStore();
  const { shortfalls } = summary;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getIcon = (category: string) => {
    switch (category) {
      case "emergency_fund":
        return Sparkles;
      case "life_protection":
        return ShieldAlert;
      case "critical_illness":
        return HeartPulse;
      case "retirement":
        return Clock;
      case "education":
        return GraduationCap;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Info */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Your Safety Net & Goal Gaps
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Here is a simple check of where your money and insurance stand today versus what you need to stay fully protected and reach financial freedom.
        </p>
      </div>

      {/* Shortfall Detail Accordion / Cards */}
      <div className="space-y-3">
        {shortfalls.map((item, idx) => {
          const Icon = getIcon(item.category);
          const isExpanded = expandedIndex === idx;
          const isDeficit = item.shortfallAmount > 0;
          const progressClamped = Math.min(100, item.coverageRatio);

          const getThemeClasses = () => {
            if (item.status === "critical") {
              return {
                bg: "bg-rose-50/50 dark:bg-rose-950/20",
                border: "border-rose-200 dark:border-rose-900/60",
                badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
                progress: "bg-rose-500",
              };
            }
            if (item.status === "warning") {
              return {
                bg: "bg-amber-50/50 dark:bg-amber-950/20",
                border: "border-amber-200 dark:border-amber-900/60",
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
                progress: "bg-amber-500",
              };
            }
            return {
              bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
              border: "border-emerald-200 dark:border-emerald-900/60",
              badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
              progress: "bg-emerald-500",
            };
          };

          const theme = getThemeClasses();

          return (
            <div
              key={item.category}
              className={`fin-card transition-all duration-200 bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden ${
                isExpanded ? "ring-2 ring-indigo-500/20 " + theme.border : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Card Header (Clickable) */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.status === "critical"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                        : item.status === "warning"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-extrabold ${
                        isDeficit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isDeficit ? `-${formatCurrency(item.shortfallAmount, currency)}` : "Fully Covered"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">{item.coverageRatio}% Ready</div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Progress Bar Strip */}
              <div className="px-4 pb-2">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                    style={{ width: `${progressClamped}%` }}
                  />
                </div>
              </div>

              {/* Expanded Breakdown & Formula */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                  {/* Numbers Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Ideal Safety Target
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                        {formatCurrency(item.requiredAmount, currency)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        What You Have Today
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                        {formatCurrency(item.existingAmount, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Items */}
                  {item.breakdown && item.breakdown.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        How We Calculated This
                      </div>
                      {item.breakdown.map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>{b.label}</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {typeof b.value === "number" && b.value > 100
                              ? formatCurrency(b.value, currency)
                              : b.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendation Callout */}
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${theme.bg} ${theme.border} border`}>
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> What to do next:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{item.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulator Link Card */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-bold">Try Different Scenarios</h4>
          <p className="text-[11px] text-indigo-100 mt-0.5">
            Slide and see how retiring earlier or investing $200 more a month changes your numbers!
          </p>
        </div>
        <button
          onClick={() => setActiveTab("simulator")}
          className="px-3 py-2 rounded-xl bg-white text-indigo-600 font-bold text-xs shrink-0 hover:bg-indigo-50 transition-colors shadow-sm"
        >
          Open Simulator
        </button>
      </div>
    </div>
  );
};
