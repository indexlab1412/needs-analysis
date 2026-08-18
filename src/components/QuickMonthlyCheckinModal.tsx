"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { IncomeItem, ExpenseItem, AssetItem } from "@/lib/fna/types";
import { formatCurrency, generateId, parseNumberInput } from "@/lib/utils";
import { NumericInput } from "./ui/NumericInput";
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
  Tag,
  Wand2,
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
  const { profile, updateProfile, currency, summary, logMonthlyCashflow, goToWizardStep } = useFinancialStore();

  const activeMonthYear = profile.activePlanningMonthYear || "2026-08";
  const [yStr, mStr] = activeMonthYear.split("-");
  const activeDate = new Date(parseInt(yStr || "2026", 10), parseInt(mStr || "8", 10) - 1, 1);
  const activeMonthLabel = activeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [monthlyNotes, setMonthlyNotes] = useState("");

  if (!isOpen) return null;

  const totalIncome = profile.incomes.reduce((sum, i) => sum + (Number(i.monthlyAmount) || 0), 0);
  const totalExpenses = profile.expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
  const totalDCA = profile.assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Add & remove handlers
  const handleAddIncome = () => {
    const newItem: IncomeItem = {
      id: generateId("inc"),
      category: "employment",
      description: "",
      monthlyAmount: 0,
    };
    updateProfile((p) => ({ ...p, incomes: [...p.incomes, newItem] }));
  };

  const handleRemoveIncome = (id: string) => {
    updateProfile((p) => ({ ...p, incomes: p.incomes.filter((i) => i.id !== id) }));
  };

  const handleAddExpense = (presetName?: string) => {
    const newItem: ExpenseItem = {
      id: generateId("exp"),
      category: "lifestyle",
      description: presetName || "",
      monthlyAmount: 0,
      isEssential: false,
    };
    updateProfile((p) => ({ ...p, expenses: [...p.expenses, newItem] }));
  };

  const handleRemoveExpense = (id: string) => {
    updateProfile((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  };

  const handleAddDCA = () => {
    const newItem: AssetItem = {
      id: generateId("ast-dca"),
      category: "stocks_funds",
      description: "",
      currentValue: 0,
      isLiquid: false,
      expectedReturnRate: 6.5,
      monthlyContribution: 100,
      platformOrVehicle: "Robo / Broker",
      targetPurpose: "wealth_growth",
    };
    updateProfile((p) => ({ ...p, assets: [...p.assets, newItem] }));
  };

  const handleRemoveDCA = (id: string) => {
    updateProfile((p) => ({ ...p, assets: p.assets.filter((a) => a.id !== id) }));
  };

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
                Update or add new income & expenses for <strong>{activeMonthLabel}</strong>
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

          {/* Section 1: Income Adjustments & Add New Income */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" /> 1. Monthly Paycheck & Inflow
              </span>
              <button
                type="button"
                onClick={handleAddIncome}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <Plus className="w-3 h-3" /> Add Income
              </button>
            </div>

            <div className="space-y-1.5">
              {profile.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <input
                    type="text"
                    value={inc.description}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        incomes: p.incomes.map((i) => (i.id === inc.id ? { ...i, description: e.target.value } : i)),
                      }))
                    }
                    className="flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    placeholder="e.g. Salary / Bonus"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{currency}</span>
                    <NumericInput
                      value={inc.monthlyAmount}
                      onChange={(val) =>
                        updateProfile((p) => ({
                          ...p,
                          incomes: p.incomes.map((i) => (i.id === inc.id ? { ...i, monthlyAmount: val } : i)),
                        }))
                      }
                      placeholder="0"
                      className="w-24 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIncome(inc.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove this income item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Quick Spending Updates & Add New Category/Bill */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-500" /> 2. Monthly Expenses & Living Bills
              </span>
              <button
                type="button"
                onClick={() => handleAddExpense()}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800"
              >
                <Plus className="w-3 h-3" /> Add Bill / Category
              </button>
            </div>

            {/* Quick Expense Preset Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              <span className="text-slate-400 shrink-0 font-medium">Quick Add:</span>
              {["Gym / Fitness", "Subscriptions", "Dining Out", "Travel Stash", "Pet Care"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddExpense(preset)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {profile.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <input
                    type="text"
                    value={exp.description}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        expenses: p.expenses.map((ex) => (ex.id === exp.id ? { ...ex, description: e.target.value } : ex)),
                      }))
                    }
                    className="flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    placeholder="e.g. Groceries / Rent"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{currency}</span>
                    <NumericInput
                      value={exp.monthlyAmount}
                      onChange={(val) =>
                        updateProfile((p) => ({
                          ...p,
                          expenses: p.expenses.map((ex) => (ex.id === exp.id ? { ...ex, monthlyAmount: val } : ex)),
                        }))
                      }
                      placeholder="0"
                      className="w-24 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(exp.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove this bill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: DCA Auto-Invest & Current Market Value Updates */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> 3. Investments & Current Market Values
                </span>
                <p className="text-[10px] text-slate-400">
                  Update this month's DCA (enter 0 if skipped) & latest portfolio valuation
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDCA}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shrink-0"
              >
                <Plus className="w-3 h-3" /> Add Account
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {profile.assets
                .filter((a) => a.category !== "cpf_epf_pension")
                .map((ast) => (
                  <div
                    key={ast.id}
                    className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/70 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={ast.description}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            assets: p.assets.map((a) => (a.id === ast.id ? { ...a, description: e.target.value } : a)),
                          }))
                        }
                        className="flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        placeholder="e.g. Syfe / Endowus"
                      />
                      {ast.isAutoCalculatedIRR && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          +{ast.expectedReturnRate}% IRR
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDCA(ast.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove this investment item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                          This Month DCA ({currency})
                        </label>
                        <NumericInput
                          value={ast.monthlyContribution}
                          onChange={(val) =>
                            updateProfile((p) => ({
                              ...p,
                              assets: p.assets.map((a) => (a.id === ast.id ? { ...a, monthlyContribution: val } : a)),
                            }))
                          }
                          placeholder="0"
                          className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                          Latest Current Value ({currency})
                        </label>
                        <NumericInput
                          value={ast.currentValue}
                          onChange={(val) =>
                            updateProfile((p) => ({
                              ...p,
                              assets: p.assets.map((a) => (a.id === ast.id ? { ...a, currentValue: val } : a)),
                            }))
                          }
                          placeholder="0"
                          className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
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
              placeholder={`e.g. Skipped $100 DCA for Syfe, updated portfolio balance to $50k.`}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Deep Setup Switcher Helper */}
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Need to edit insurance policies, loans or goals?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                goToWizardStep(1);
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
            >
              Full Setup &rarr;
            </button>
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
