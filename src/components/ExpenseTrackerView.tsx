"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { ExpenseCategory, ExpenseItem } from "@/lib/fna/types";
import { formatCurrency, generateId, parseNumberInput } from "@/lib/utils";
import {
  Wallet,
  PieChart,
  ShoppingBag,
  Utensils,
  Coffee,
  Tv,
  Car,
  Home,
  Zap,
  TrendingUp,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Scissors,
  CheckCircle2,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CATEGORY_META: {
  [key in ExpenseCategory]: { label: string; icon: any; color: string; isEssentialDefault: boolean };
} = {
  housing: { label: "Rent / Housing", icon: Home, color: "#f59e0b", isEssentialDefault: true },
  food: { label: "Groceries & Food", icon: Utensils, color: "#10b981", isEssentialDefault: true },
  dining_out: { label: "Dining Out & Cafes", icon: Coffee, color: "#ec4899", isEssentialDefault: false },
  transport: { label: "Transport & Grab", icon: Car, color: "#3b82f6", isEssentialDefault: true },
  utilities: { label: "Phone & Utilities", icon: Zap, color: "#6366f1", isEssentialDefault: true },
  subscriptions: { label: "Subscriptions (Netflix/Gym)", icon: Tv, color: "#8b5cf6", isEssentialDefault: false },
  shopping: { label: "Shopping & Gadgets", icon: ShoppingBag, color: "#f43f5e", isEssentialDefault: false },
  entertainment: { label: "Social & Fun", icon: Sparkles, color: "#d946ef", isEssentialDefault: false },
  insurance: { label: "Insurance Premiums", icon: ShieldCheckIcon, color: "#06b6d4", isEssentialDefault: true },
  loans: { label: "Loan Repayments", icon: Wallet, color: "#e11d48", isEssentialDefault: true },
  lifestyle: { label: "General Lifestyle", icon: Sparkles, color: "#a855f7", isEssentialDefault: false },
  other: { label: "Other Bills", icon: AlertCircle, color: "#94a3b8", isEssentialDefault: false },
};

function ShieldCheckIcon(props: any) {
  return <Wallet {...props} />;
}

export const ExpenseTrackerView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { cashFlow } = summary;

  const [selectedExpenseForCutback, setSelectedExpenseForCutback] = useState<ExpenseItem | null>(null);

  const addQuickExpense = (desc: string, amount: number, cat: ExpenseCategory, isEssential: boolean) => {
    const newItem: ExpenseItem = {
      id: generateId("exp"),
      description: desc,
      monthlyAmount: amount,
      category: cat,
      isEssential: isEssential,
    };
    updateProfile((p) => ({ ...p, expenses: [...p.expenses, newItem] }));
  };

  const removeExpense = (id: string) => {
    updateProfile((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    updateProfile((p) => ({
      ...p,
      expenses: p.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  // Category Breakdown Aggregation
  const categoryData = React.useMemo(() => {
    const map: { [key: string]: number } = {};
    profile.expenses.forEach((e) => {
      const cat = e.category || "other";
      map[cat] = (map[cat] || 0) + (Number(e.monthlyAmount) || 0);
    });

    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([cat, val]) => {
        const meta = CATEGORY_META[cat as ExpenseCategory] || CATEGORY_META.other;
        return {
          name: meta.label,
          category: cat,
          value: val,
          color: meta.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [profile.expenses]);

  // 50/30/20 Budget Analysis
  const totalIncome = cashFlow.totalMonthlyIncome || 1;
  const needsSpend = profile.expenses.filter((e) => e.isEssential).reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
  const wantsSpend = profile.expenses.filter((e) => !e.isEssential).reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
  const savingsInvestments = cashFlow.monthlyNetSavings + cashFlow.totalMonthlyDCAInvestments;

  const needsPct = Math.round((needsSpend / totalIncome) * 100);
  const wantsPct = Math.round((wantsSpend / totalIncome) * 100);
  const savingsPct = Math.round((savingsInvestments / totalIncome) * 100);

  // Future compounding value of cutting back selected expense
  const cutbackAmount = selectedExpenseForCutback ? selectedExpenseForCutback.monthlyAmount : 100;
  const growthRate = (profile.assumptions.investmentReturnRate || 6.5) / 100;

  const calculateFV = (pmt: number, years: number) => {
    return Math.round((pmt * 12 * (Math.pow(1 + growthRate, years) - 1)) / growthRate);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600" />
          Detailed Spending Audit & "Where Did My Money Go?"
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          When savings feel tight, audit your itemized living expenses, identify leaky buckets, and redirect wasted cash into compounding investments.
        </p>
      </div>

      {/* 50 / 30 / 20 Budget Split Card */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Your 50 / 30 / 20 Paycheck Split
          </h3>
          <span className="text-[10px] text-slate-400">Target: 50% Needs • 30% Wants • 20% Save</span>
        </div>

        {/* Triple Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          <div style={{ width: `${Math.min(100, needsPct)}%` }} className="bg-amber-500 h-full" title="Needs" />
          <div style={{ width: `${Math.min(100, wantsPct)}%` }} className="bg-rose-500 h-full" title="Wants" />
          <div style={{ width: `${Math.min(100, savingsPct)}%` }} className="bg-emerald-500 h-full" title="Savings & DCA" />
        </div>

        {/* 3 Metric Chips */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">Needs ({needsPct}%)</span>
            <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(needsSpend, currency)}/mo
            </span>
            <span className="text-[9px] text-slate-400">Rent, groceries, commute</span>
          </div>

          <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 block">Wants ({wantsPct}%)</span>
            <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(wantsSpend, currency)}/mo
            </span>
            <span className="text-[9px] text-slate-400">Cafes, shopping, subs</span>
          </div>

          <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">Save/DCA ({savingsPct}%)</span>
            <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(savingsInvestments, currency)}/mo
            </span>
            <span className="text-[9px] text-slate-400">Cash + Robos + ETFs</span>
          </div>
        </div>
      </div>

      {/* Spending Breakdown Donut & List */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Category Spending Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-xl text-xs shadow-lg">
                          <span className="font-bold">{data.name}: </span>
                          <span>{formatCurrency(Number(data.value), currency)}/mo</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  {formatCurrency(cat.value, currency)}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaky Bucket Reinvestment Opportunity Finder */}
      <div className="fin-card p-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-emerald-400" /> "Leaky Bucket" Reinvestment Calculator
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-200">
            Compounding Power
          </span>
        </div>

        <p className="text-xs text-indigo-100/90 leading-relaxed">
          See what happens if you trim non-essential spending (e.g. unused subscriptions or frequent delivery) and redirect it into your <strong>{profile.assumptions.investmentReturnRate}% p.a.</strong> Robo-Advisor or ETF:
        </p>

        {/* Selected or default cutback item */}
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Cutting Back Monthly Spend:</span>
            <strong className="text-emerald-400 font-extrabold text-sm">
              {formatCurrency(cutbackAmount, currency)} / month
            </strong>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
            <div className="p-2 bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">In 5 Years</span>
              <span className="text-xs font-black text-white mt-0.5 block">
                {formatCurrency(calculateFV(cutbackAmount, 5), currency)}
              </span>
            </div>
            <div className="p-2 bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">In 10 Years</span>
              <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                {formatCurrency(calculateFV(cutbackAmount, 10), currency)}
              </span>
            </div>
            <div className="p-2 bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">In 20 Years</span>
              <span className="text-xs font-black text-amber-300 mt-0.5 block">
                {formatCurrency(calculateFV(cutbackAmount, 20), currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Expenses List */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            All Tracked Expenses ({profile.expenses.length})
          </h3>
        </div>

        {/* 1-Tap Quick Add Expense Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">1-Tap Add Common Expenses:</span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => addQuickExpense("Daily Coffee / Boba", 100, "dining_out", false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[11px]"
            >
              ☕ + Coffee ($100/mo)
            </button>
            <button
              onClick={() => addQuickExpense("Streaming & Music Subs", 35, "subscriptions", false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[11px]"
            >
              📺 + Subscriptions ($35/mo)
            </button>
            <button
              onClick={() => addQuickExpense("Gym & Fitness Pass", 150, "subscriptions", false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[11px]"
            >
              🏋️ + Gym ($150/mo)
            </button>
            <button
              onClick={() => addQuickExpense("Food Delivery (Grab/Panda)", 180, "dining_out", false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[11px]"
            >
              🍔 + Delivery ($180/mo)
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="space-y-2 pt-2">
          {profile.expenses.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setSelectedExpenseForCutback(exp)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                selectedExpenseForCutback?.id === exp.id
                  ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={exp.description}
                  onChange={(e) => updateExpense(exp.id, { description: e.target.value })}
                  className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-1"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    value={exp.monthlyAmount || ""}
                    onChange={(e) => updateExpense(exp.id, { monthlyAmount: parseNumberInput(e.target.value) })}
                    className="w-20 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExpense(exp.id);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateExpense(exp.id, { isEssential: !exp.isEssential });
                  }}
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    exp.isEssential
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {exp.isEssential ? "🔒 Essential (Need)" : "✨ Discretionary (Want)"}
                </button>

                <span className="text-[10px] text-slate-400">
                  Click to test compound growth if cut
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
