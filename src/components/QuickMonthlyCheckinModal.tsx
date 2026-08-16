"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency, parseNumberInput } from "@/lib/utils";
import {
  X,
  Zap,
  Wallet,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";

interface QuickMonthlyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const QuickMonthlyCheckinModal: React.FC<QuickMonthlyCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { profile, updateProfile, currency, summary, logMonthlyCashflow } = useFinancialStore();

  const activeMonthYear = profile.activePlanningMonthYear || "2026-08";
  const [yStr, mStr] = activeMonthYear.split("-");
  const activeDate = new Date(parseInt(yStr || "2026", 10), parseInt(mStr || "8", 10) - 1, 1);
  const activeMonthLabel = activeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [monthlyNotes, setMonthlyNotes] = useState("");
  const [stepTab, setStepTab] = useState<"review" | "done">("review");

  if (!isOpen) return null;

  const totalIncome = profile.incomes.reduce((sum, i) => sum + (Number(i.monthlyAmount) || 0), 0);
  const totalExpenses = profile.expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
  const totalDCA = profile.assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const handleCompleteCheckin = () => {
    logMonthlyCashflow(monthlyNotes || `Completed monthly check-in for ${activeMonthLabel}.`);
    if (onSuccessToast) {
      onSuccessToast(`🎉 ${activeMonthLabel} Monthly Check-In completed & saved!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                1-Click Monthly Check-In
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update your numbers for <strong>{activeMonthLabel}</strong> in under 60 seconds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick Summary Pill */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Inflow</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                +{formatCurrency(totalIncome, currency)}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Outflow</span>
              <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                -{formatCurrency(totalExpenses, currency)}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Net Savings</span>
              <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                +{formatCurrency(netSavings, currency)} ({savingsRate}%)
              </span>
            </div>
          </div>

          {/* Section 1: Income Adjustments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" /> 1. Monthly Paycheck & Inflow
              </span>
              <span className="text-[10px] text-slate-400">Did your salary or bonus change?</span>
            </div>

            <div className="space-y-1.5">
              {profile.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {inc.description}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{currency}</span>
                    <input
                      type="number"
                      value={inc.monthlyAmount || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          incomes: p.incomes.map((i) =>
                            i.id === inc.id ? { ...i, monthlyAmount: parseNumberInput(e.target.value) } : i
                          ),
                        }))
                      }
                      className="w-24 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Quick Spending Updates */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-500" /> 2. Monthly Expenses & Living Bills
              </span>
              <span className="text-[10px] text-slate-400">Adjust any line-items</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {profile.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {exp.description}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{currency}</span>
                    <input
                      type="number"
                      value={exp.monthlyAmount || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          expenses: p.expenses.map((ex) =>
                            ex.id === exp.id ? { ...ex, monthlyAmount: parseNumberInput(e.target.value) } : ex
                          ),
                        }))
                      }
                      className="w-24 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: DCA Auto-Invest Check */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> 3. Regular Auto-DCA Investments
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Total DCA: {formatCurrency(totalDCA, currency)}/mo
              </span>
            </div>

            <div className="space-y-1.5">
              {profile.assets
                .filter((a) => (a.monthlyContribution || 0) > 0)
                .map((ast) => (
                  <div
                    key={ast.id}
                    className="flex items-center justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs"
                  >
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200 truncate max-w-[140px]">
                      {ast.description}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-indigo-500 font-bold">{currency}</span>
                      <input
                        type="number"
                        value={ast.monthlyContribution || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            assets: p.assets.map((a) =>
                              a.id === ast.id ? { ...a, monthlyContribution: parseNumberInput(e.target.value) } : a
                            ),
                          }))
                        }
                        className="w-24 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-right"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Optional Reflection Notes */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Monthly Reflection / Milestone Note (Optional)
            </label>
            <input
              type="text"
              value={monthlyNotes}
              onChange={(e) => setMonthlyNotes(e.target.value)}
              placeholder={`e.g. Paid off $300 study loan, kept dining under budget.`}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>
        </div>

        {/* Footer with 1-Click Action */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
          >
            Cancel
          </button>

          <button
            onClick={handleCompleteCheckin}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 fill-current" />
            <span>Confirm & Log {activeMonthLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
