"use client";

import React from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, summary, profile, currency } = useFinancialStore();

  if (!isReportModalOpen) return null;

  const { netWorth, cashFlow, shortfalls, keyActionItems, overallFinancialHealthScore } = summary;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Financial Summary Proposal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Save / Print PDF
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Proposal Document */}
        <div className="p-6 overflow-y-auto print-page space-y-6 text-slate-800 dark:text-slate-200">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                Personal Money Plan
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Financial Health & Safety Blueprint
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Prepared for {profile.name || "Client"}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Date Generated</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                {new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Your Age</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {profile.currentAge} Years Old
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Target Freedom Age</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                Age {profile.targetRetirementAge}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Dependents Supported</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {profile.dependents.length} Person(s)
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Fitness Score</div>
              <div className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                {overallFinancialHealthScore} / 100
              </div>
            </div>
          </div>

          {/* Balance Sheet & Cashflow */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              1. Where Your Money Stands Today
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">What You Own (Assets)</span>
                  <span className="font-bold">{formatCurrency(netWorth.totalAssets, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">What You Owe (Debts)</span>
                  <span className="font-bold text-rose-500">{formatCurrency(netWorth.totalLiabilities, currency)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold">Net Worth</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(netWorth.netWorth, currency)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Inflow</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(cashFlow.totalMonthlyIncome, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Expenses</span>
                  <span className="font-bold text-rose-500">{formatCurrency(cashFlow.totalMonthlyExpenses, currency)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold">Monthly Savings</span>
                  <span className="font-black text-emerald-600">
                    {cashFlow.savingsRatePercentage}% ({formatCurrency(cashFlow.monthlyNetSavings, currency)}/mo)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shortfall Table */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              2. Safety Gaps & Life Goals
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Target Need</th>
                    <th className="p-2.5">Current Cover</th>
                    <th className="p-2.5">Gap / Surplus</th>
                    <th className="p-2.5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {shortfalls.map((s) => {
                    const isDeficit = s.shortfallAmount > 0;
                    return (
                      <tr key={s.category}>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{s.title}</td>
                        <td className="p-2.5">{formatCurrency(s.requiredAmount, currency)}</td>
                        <td className="p-2.5">{formatCurrency(s.existingAmount, currency)}</td>
                        <td className={`p-2.5 font-bold ${isDeficit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                          {isDeficit ? `-${formatCurrency(s.shortfallAmount, currency)}` : "Fully Covered"}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              s.status === "critical"
                                ? "bg-rose-100 text-rose-700"
                                : s.status === "warning"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {s.coverageRatio}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Recommendations */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              3. Recommended Next Steps for Your Finances
            </h3>
            <div className="space-y-2 text-xs">
              {keyActionItems.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
