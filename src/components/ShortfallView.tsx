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
  Calculator,
  AlertTriangle,
  ListOrdered,
} from "lucide-react";
import { FormulaModal, FormulaKey } from "./FormulaModal";

export const ShortfallView: React.FC = () => {
  const { summary, currency, setActiveTab } = useFinancialStore();
  const { shortfalls } = summary;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<FormulaKey>("retirement_nest_egg");

  const getFormulaKey = (category: string): FormulaKey => {
    switch (category) {
      case "emergency_fund":
        return "emergency_fund";
      case "life_protection":
        return "life_protection";
      case "critical_illness":
        return "critical_illness";
      case "retirement":
        return "retirement_nest_egg";
      case "education":
        return "education_compounding";
      default:
        return "retirement_nest_egg";
    }
  };

  const getWhyPlanReason = (category: string): string => {
    switch (category) {
      case "emergency_fund":
        return "Without a 6-month liquid cushion, sudden retrenchment or a $5,000 emergency forces you to rack up 24% interest credit card debt or panic-sell your long-term investments at a market loss.";
      case "life_protection":
        return "If you pass away or suffer permanent disability, who pays off your remaining mortgages? Your spouse and aged parents could face eviction and lose their baseline monthly living allowance.";
      case "critical_illness":
        return "Cancer, stroke, or heart attack requires 3–5 years of treatment. While hospital insurance pays doctor bills, it DOES NOT replace your lost salary to pay rent, groceries, and living costs.";
      case "retirement":
        return "Compounding requires time. Every 5 years you delay starting your retirement savings doubles the out-of-pocket monthly dollars you will need to save later in life.";
      case "education":
        return "University tuition inflates at 5.0% annually—almost double general inflation. Funding early lets investment returns pay 60% of the tuition instead of taking expensive bank loans.";
      default:
        return "Planning early prevents sudden life disruptions and secures your financial freedom.";
    }
  };

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
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Your Safety Net & Goal Gaps
          </h2>
          <button
            onClick={() => setActiveTab("priorities")}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all flex items-center gap-1"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Priority Sequencer</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Here is a simple check of where your money and insurance stand today versus what you need. If budget is limited, use the <strong>Priority Sequencer</strong> to solve one milestone at a time without financial stress.
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

                  {/* Danger of Ignoring This Gap & Why You Must Plan */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 dark:text-amber-300 block text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      Why You Must Plan For This Area (The Danger of Ignoring It):
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {getWhyPlanReason(item.category)}
                    </p>
                  </div>

                  {/* Breakdown Items */}
                  {item.breakdown && item.breakdown.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          How We Calculated This
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormulaKey(getFormulaKey(item.category));
                            setIsFormulaModalOpen(true);
                          }}
                          className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>See Exact Math Formula</span>
                        </button>
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
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${theme.bg} ${theme.border} border flex items-start justify-between gap-2`}>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> What to do next:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">{item.recommendation}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormulaKey(getFormulaKey(item.category));
                        setIsFormulaModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold shrink-0 hover:bg-indigo-50 transition-colors"
                    >
                      Formula 💡
                    </button>
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

      {/* Formula Explanation Modal */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        initialKey={selectedFormulaKey}
      />
    </div>
  );
};
