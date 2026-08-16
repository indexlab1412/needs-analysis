"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";

interface CashflowBreakdownProps {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  currency: string;
}

export const CashflowBreakdown: React.FC<CashflowBreakdownProps> = ({
  income,
  expenses,
  savings,
  savingsRate,
  currency,
}) => {
  const expensePct = income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 100;
  const savingsPct = income > 0 ? Math.max(0, Math.min(100, Math.round((savings / income) * 100))) : 0;

  return (
    <div className="space-y-3">
      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Income</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(income, currency)}
          </div>
          <div className="text-[10px] text-slate-400">/month</div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Expenses</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(expenses, currency)}
          </div>
          <div className="text-[10px] text-slate-400">{expensePct}% of income</div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <PiggyBank className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Net Savings</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1 truncate">
            {formatCurrency(savings, currency)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">{savingsRate}% rate</div>
        </div>
      </div>

      {/* Visual Cashflow Split Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          <span>Monthly Cash Allocation</span>
          <span>{savings >= 0 ? `${savingsPct}% Retained` : "Deficit Spending"}</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${Math.min(100, expensePct)}%` }}
            title={`Expenses: ${expensePct}%`}
          />
          {savings > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${savingsPct}%` }}
              title={`Savings: ${savingsPct}%`}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Expenses ({expensePct}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Net Savings ({savingsPct}%)
          </span>
        </div>
      </div>
    </div>
  );
};
