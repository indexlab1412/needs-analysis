"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { FinancialGoal, GoalCategory, GoalHorizonBucket } from "@/lib/fna/types";
import { formatCurrency, generateId } from "@/lib/utils";
import {
  Target,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Heart,
  Home,
  Plane,
  Car,
  GraduationCap,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { RiskProfilerModal, RISK_PROFILES_META } from "./RiskProfilerModal";

const GOAL_TEMPLATES: {
  name: string;
  category: GoalCategory;
  horizonBucket: GoalHorizonBucket;
  targetYears: number;
  defaultAmount: number;
  icon: any;
  recommendedVehicle: string;
}[] = [
  {
    name: "Wedding & Honeymoon",
    category: "wedding",
    horizonBucket: "short_term",
    targetYears: 2,
    defaultAmount: 25000,
    icon: Heart,
    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
  },
  {
    name: "BTO / Home Downpayment",
    category: "property",
    horizonBucket: "mid_term",
    targetYears: 4,
    defaultAmount: 50000,
    icon: Home,
    recommendedVehicle: "Balanced Robo-Advisor (4.5%)",
  },
  {
    name: "Home Renovation & Furnishing",
    category: "renovation",
    horizonBucket: "short_term",
    targetYears: 3,
    defaultAmount: 30000,
    icon: Sparkles,
    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
  },
  {
    name: "Dream Vacation / Sabbatical",
    category: "travel",
    horizonBucket: "short_term",
    targetYears: 1.5,
    defaultAmount: 8000,
    icon: Plane,
    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
  },
  {
    name: "Car Downpayment",
    category: "car",
    horizonBucket: "mid_term",
    targetYears: 3,
    defaultAmount: 20000,
    icon: Car,
    recommendedVehicle: "Balanced Portfolio / T-Bills (4.0%)",
  },
  {
    name: "Children University Tuition",
    category: "education",
    horizonBucket: "long_term",
    targetYears: 15,
    defaultAmount: 90000,
    icon: GraduationCap,
    recommendedVehicle: "Global Equity ETFs (7.0%)",
  },
];

export const GoalPlannerView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { computedGoals, retirementDetails } = summary;

  const [activeBucketFilter, setActiveBucketFilter] = useState<"all" | "short_term" | "mid_term" | "long_term">("all");
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);

  const currentRiskMeta = RISK_PROFILES_META[profile.riskProfile || "balanced"] || RISK_PROFILES_META.balanced;

  const addGoalFromTemplate = (tmpl: (typeof GOAL_TEMPLATES)[0]) => {
    const newGoal: FinancialGoal = {
      id: generateId("goal"),
      name: tmpl.name,
      category: tmpl.category,
      horizonBucket: tmpl.horizonBucket,
      targetYearsFromNow: tmpl.targetYears,
      targetAmount: tmpl.defaultAmount,
      currentSavingsAssigned: 0,
      recommendedVehicle: tmpl.recommendedVehicle,
    };
    updateProfile((p) => ({ ...p, goals: [...p.goals, newGoal] }));
  };

  const removeGoal = (id: string) => {
    updateProfile((p) => ({ ...p, goals: p.goals.filter((g) => g.id !== id) }));
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    updateProfile((p) => ({
      ...p,
      goals: p.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const filteredGoals = computedGoals.filter((cg) => {
    if (activeBucketFilter === "all") return true;
    return cg.goal.horizonBucket === activeBucketFilter;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Goal-Based Money Planner (3-Bucket Framework)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Short and mid-term goals need safe cash or conservative growth, while long-term goals use compounding equities.
            </p>
          </div>
          <button
            onClick={() => setIsRiskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Risk: {currentRiskMeta.expectedReturn}%</span>
          </button>
        </div>
      </div>

      {/* 3-Bucket Filter Pills */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700 text-xs">
        <button
          onClick={() => setActiveBucketFilter("all")}
          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all ${
            activeBucketFilter === "all"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          All ({computedGoals.length})
        </button>
        <button
          onClick={() => setActiveBucketFilter("short_term")}
          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all ${
            activeBucketFilter === "short_term"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          ⚡ Short (0-3y)
        </button>
        <button
          onClick={() => setActiveBucketFilter("mid_term")}
          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all ${
            activeBucketFilter === "mid_term"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          🚀 Mid (3-7y)
        </button>
        <button
          onClick={() => setActiveBucketFilter("long_term")}
          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all ${
            activeBucketFilter === "long_term"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          🏖️ Long (7y+)
        </button>
      </div>

      {/* Goal Cards List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No goals in this bucket yet. Pick from the 1-tap templates below!
          </div>
        ) : (
          filteredGoals.map(({ goal, targetAmountFuture, monthlySavingsNeeded, progressPercentage, recommendedStrategy }) => {
            const isShort = goal.horizonBucket === "short_term";
            const isMid = goal.horizonBucket === "mid_term";

            const bucketBadge = () => {
              if (isShort) {
                return (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    ⚡ Short-Term (0-3 yrs) • Safe Cash
                  </span>
                );
              }
              if (isMid) {
                return (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    🚀 Mid-Term (3-7 yrs) • Balanced Growth
                  </span>
                );
              }
              return (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  🏖️ Long-Term (7+ yrs) • Equities & FIRE
                </span>
              );
            };

            return (
              <div
                key={goal.id}
                className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {goal.name}
                      </h4>
                      {bucketBadge()}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Target: in <strong>{goal.targetYearsFromNow} years</strong> • Recommended: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{recommendedStrategy}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Target Today</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Saved So Far</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {formatCurrency(goal.currentSavingsAssigned, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Save Each Month</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {monthlySavingsNeeded > 0 ? `${formatCurrency(monthlySavingsNeeded, currency)}/mo` : "Funded 🎉"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>Funding Progress</span>
                    <span>{progressPercentage}% Funded</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercentage >= 100
                          ? "bg-emerald-500"
                          : isShort
                          ? "bg-amber-500"
                          : isMid
                          ? "bg-blue-500"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Edit Inputs */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Target Amount ({currency})</label>
                    <input
                      type="number"
                      value={goal.targetAmount}
                      onChange={(e) => updateGoal(goal.id, { targetAmount: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Years to Target</label>
                    <input
                      type="number"
                      step="0.5"
                      value={goal.targetYearsFromNow}
                      onChange={(e) => updateGoal(goal.id, { targetYearsFromNow: Number(e.target.value) || 1 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Saved in Bank ({currency})</label>
                    <input
                      type="number"
                      value={goal.currentSavingsAssigned}
                      onChange={(e) => updateGoal(goal.id, { currentSavingsAssigned: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1-Tap Quick Goal Templates */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> 1-Tap Goal Templates
        </h3>
        <p className="text-[11px] text-slate-500">Add common life milestones with pre-set timelines and strategies:</p>

        <div className="grid grid-cols-2 gap-2">
          {GOAL_TEMPLATES.map((tmpl, idx) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={idx}
                onClick={() => addGoalFromTemplate(tmpl)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tmpl.targetYears} yrs • {formatCurrency(tmpl.defaultAmount, currency)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <RiskProfilerModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} />
    </div>
  );
};
