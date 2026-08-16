"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { Dependent, EducationDestinationPreset } from "@/lib/fna/types";
import { formatCurrency, generateId } from "@/lib/utils";
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Plane,
  Heart,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const UNI_PRESETS: {
  [key in EducationDestinationPreset]: { label: string; todayCost: number; icon: any; desc: string };
} = {
  local_public: {
    label: "🇸🇬 Local Public Uni (NUS / NTU / SMU)",
    todayCost: 45000,
    icon: Building,
    desc: "4-Year tuition fees + living allowance in Singapore",
  },
  local_medicine: {
    label: "🩺 Local Medicine / Dentistry",
    todayCost: 160000,
    icon: ShieldCheck,
    desc: "5-Year specialized medical tuition at NUS / NTU",
  },
  overseas_aus_uk: {
    label: "🇦🇺 / 🇬🇧 Australia or UK University",
    todayCost: 220000,
    icon: Plane,
    desc: "3-4 Years international tuition, rent & flights",
  },
  overseas_us: {
    label: "🇺🇸 US Private / Top Tier University",
    todayCost: 400000,
    icon: Plane,
    desc: "4-Year tuition + room & board in United States",
  },
  custom: {
    label: "✏️ Custom Amount",
    todayCost: 50000,
    icon: BookOpen,
    desc: "Your customized tertiary education target",
  },
};

export const EducationPlannerView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { assumptions } = profile;

  const children = profile.dependents.filter((d) => d.relationship === "child");
  const eduInflationRate = (assumptions.educationInflationRate || 5.0) / 100;
  const investmentReturnRate = (assumptions.investmentReturnRate || 6.5) / 100;

  // Add Child
  const handleAddChild = () => {
    const newChild: Dependent = {
      id: generateId("child"),
      name: `Child ${children.length + 1}`,
      relationship: "child",
      age: 2,
      yearsOfSupportNeeded: 18,
      monthlySupportAmount: 600,
      tertiaryEducationTarget: 45000,
      yearsToTertiary: 16,
      educationDestinationPreset: "local_public",
      currentEducationSavingsAssigned: 5000,
      monthlyEducationSavings: 150,
    };
    updateProfile((p) => ({ ...p, dependents: [...p.dependents, newChild] }));
  };

  const removeChild = (id: string) => {
    updateProfile((p) => ({ ...p, dependents: p.dependents.filter((d) => d.id !== id) }));
  };

  const updateChild = (id: string, updates: Partial<Dependent>) => {
    updateProfile((p) => ({
      ...p,
      dependents: p.dependents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  // Calculations across all children
  const calculateChildFutureEduCost = (child: Dependent) => {
    const todayCost = Number(child.tertiaryEducationTarget) || 45000;
    const years = Math.max(1, Number(child.yearsToTertiary) || Math.max(1, 18 - (child.age || 0)));
    return Math.round(todayCost * Math.pow(1 + eduInflationRate, years));
  };

  const calculateMonthlyDcaNeeded = (futureCost: number, savedSoFar: number, years: number) => {
    if (years <= 0) return 0;
    const remainingToFund = Math.max(0, futureCost - savedSoFar * Math.pow(1 + investmentReturnRate, years));
    if (remainingToFund <= 0) return 0;

    const r = investmentReturnRate / 12;
    const n = years * 12;
    // Sinking fund formula: PMT = FV * r / [(1+r)^n - 1]
    const pmt = (remainingToFund * r) / (Math.pow(1 + r, n) - 1);
    return Math.round(pmt);
  };

  const totalFutureCostAllChildren = children.reduce((sum, c) => sum + calculateChildFutureEduCost(c), 0);
  const totalAssignedSavingsAll = children.reduce((sum, c) => sum + (Number(c.currentEducationSavingsAssigned) || 0), 0);
  const totalMonthlyDcaNeededAll = children.reduce((sum, c) => {
    const fCost = calculateChildFutureEduCost(c);
    const saved = Number(c.currentEducationSavingsAssigned) || 0;
    const yrs = Math.max(1, Number(c.yearsToTertiary) || Math.max(1, 18 - (c.age || 0)));
    return sum + calculateMonthlyDcaNeeded(fCost, saved, yrs);
  }, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Children's Tertiary Education Fund Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Compound university tuition fees with <strong>{assumptions.educationInflationRate}% education inflation</strong> and build dedicated sinking funds so your kids graduate debt-free.
            </p>
          </div>
          <button
            onClick={handleAddChild}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child</span>
          </button>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <GraduationCap className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Children Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Planning for a future child or current kids? Add a child profile to calculate future university costs and calculate your monthly ETF/Endowment savings target.
          </p>
          <button
            onClick={handleAddChild}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Add Your First Child Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Total Education Summary Hero Card */}
          <div className="fin-card p-4 sm:p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Total Children's University Goal
              </span>
              <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-200">
                {children.length} {children.length === 1 ? "Child" : "Children"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Future University Cost</span>
                <span className="text-sm sm:text-base font-black text-amber-400 block mt-0.5">
                  {formatCurrency(totalFutureCostAllChildren, currency)}
                </span>
                <span className="text-[9px] text-slate-400">Inflated at {assumptions.educationInflationRate}% p.a.</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Current Funds Saved</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 block mt-0.5">
                  {formatCurrency(totalAssignedSavingsAll, currency)}
                </span>
                <span className="text-[9px] text-slate-400">CDA + Endowments + Robos</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-bold">Recommended Monthly DCA</span>
                <span className="text-sm sm:text-base font-black text-indigo-300 block mt-0.5">
                  {formatCurrency(totalMonthlyDcaNeededAll, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">At {assumptions.investmentReturnRate}% compounding</span>
              </div>
            </div>
          </div>

          {/* Child-by-Child Cards */}
          <div className="space-y-4">
            {children.map((child, idx) => {
              const yearsLeft = Math.max(1, Number(child.yearsToTertiary) || Math.max(1, 18 - (child.age || 0)));
              const futureCost = calculateChildFutureEduCost(child);
              const saved = Number(child.currentEducationSavingsAssigned) || 0;
              const monthlyDca = calculateMonthlyDcaNeeded(futureCost, saved, yearsLeft);
              const progressPct = futureCost > 0 ? Math.min(100, Math.round((saved / futureCost) * 100)) : 0;

              return (
                <div
                  key={child.id}
                  className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => updateChild(child.id, { name: e.target.value })}
                          className="text-sm font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none"
                        />
                        <div className="text-[10px] text-slate-400">
                          Current Age: {child.age} yrs • Starts University in <strong>{yearsLeft} Years</strong> (Age 18)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeChild(child.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove child"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* University Destination Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Select Target University:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(Object.keys(UNI_PRESETS) as EducationDestinationPreset[]).map((key) => {
                        const preset = UNI_PRESETS[key];
                        const isSelected = child.educationDestinationPreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              updateChild(child.id, {
                                educationDestinationPreset: key,
                                tertiaryEducationTarget: preset.todayCost,
                              })
                            }
                            className={`p-2.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="font-bold text-[11px] block">{preset.label}</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5 block">
                              {formatCurrency(preset.todayCost, currency)} in today's $
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Child Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Future Compounded Cost</span>
                      <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                        {formatCurrency(futureCost, currency)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Funds Earmarked</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{currency}</span>
                        <input
                          type="number"
                          value={child.currentEducationSavingsAssigned || 0}
                          onChange={(e) =>
                            updateChild(child.id, { currentEducationSavingsAssigned: Number(e.target.value) || 0 })
                          }
                          className="w-16 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Monthly Auto-DCA Target</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {formatCurrency(monthlyDca, currency)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Funded Progress: {progressPct}%</span>
                      <span>Target: {formatCurrency(futureCost, currency)} in {yearsLeft} yrs</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div style={{ width: `${progressPct}%` }} className="bg-indigo-600 h-full rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
