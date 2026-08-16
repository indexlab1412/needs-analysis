"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { LiabilityItem } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Percent,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const LoanRefinanceView: React.FC = () => {
  const { profile, currency } = useFinancialStore();
  const { liabilities } = profile;

  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    liabilities.length > 0 ? liabilities[0].id : ""
  );

  const selectedLoan = liabilities.find((l) => l.id === selectedLoanId) || liabilities[0];

  // Refinancing simulation state
  const currentRate = selectedLoan ? selectedLoan.interestRate : 3.5;
  const [newRefinanceRate, setNewRefinanceRate] = useState<number>(
    Math.max(1.5, currentRate - 1.0)
  );

  // Early Prepayment simulation state
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(150);
  const [lumpSumPrepayment, setLumpSumPrepayment] = useState<number>(0);

  if (!selectedLoan || liabilities.length === 0) {
    return (
      <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
        <span className="text-3xl">🎉</span>
        <h4 className="font-bold text-sm mt-2">Zero Outstanding Loans or Mortgages</h4>
        <p className="mt-1 text-slate-500">You are completely debt-free. There are no loan interests to optimize.</p>
      </div>
    );
  }

  const balance = Number(selectedLoan.outstandingBalance) || 0;
  const tenureYears = Number(selectedLoan.tenureYearsRemaining) || 20;
  const tenureMonths = tenureYears * 12;

  // Exact standard monthly payment formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  const calculatePMT = (principal: number, annualRatePct: number, months: number) => {
    if (principal <= 0 || months <= 0) return 0;
    const r = annualRatePct / 100 / 12;
    if (r <= 0.00001) return principal / months;
    return (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
  };

  const currentPMT = calculatePMT(balance, currentRate, tenureMonths);
  const currentTotalLifetimeInterest = Math.max(0, currentPMT * tenureMonths - balance);

  // 1. Refinanced Calculation
  const refinancedPMT = calculatePMT(balance, newRefinanceRate, tenureMonths);
  const refinancedTotalInterest = Math.max(0, refinancedPMT * tenureMonths - balance);
  const totalInterestSavedFromRefinance = Math.max(0, currentTotalLifetimeInterest - refinancedTotalInterest);
  const monthlySavingsFromRefinance = Math.max(0, currentPMT - refinancedPMT);

  // 2. Accelerated Early Prepayment Calculation
  // Simulate month by month with extra payment and optional lump sum
  const simulateEarlyPayoff = () => {
    let remBalance = Math.max(0, balance - lumpSumPrepayment);
    const mRate = currentRate / 100 / 12;
    const totalMonthly = currentPMT + extraMonthlyPayment;

    let monthsPassed = 0;
    let totalInterestPaidAccelerated = 0;

    while (remBalance > 0 && monthsPassed < 480) {
      monthsPassed++;
      const interestMonth = remBalance * mRate;
      const principalMonth = Math.min(remBalance, totalMonthly - interestMonth);
      totalInterestPaidAccelerated += interestMonth;
      remBalance = Math.max(0, remBalance - principalMonth);
    }

    const yearsSaved = Math.max(0, (tenureMonths - monthsPassed) / 12);
    const interestSavedEarlyPayoff = Math.max(0, currentTotalLifetimeInterest - totalInterestPaidAccelerated);

    return {
      newPayoffYears: Math.round((monthsPassed / 12) * 10) / 10,
      yearsSaved: Math.round(yearsSaved * 10) / 10,
      interestSaved: Math.round(interestSavedEarlyPayoff),
      totalInterestPaid: Math.round(totalInterestPaidAccelerated),
    };
  };

  const earlyPayoffResult = simulateEarlyPayoff();

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-rose-500" />
          Loan Refinancing & Early Payoff "Interest Killer"
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          See exactly how much extra money you would give to the bank if you keep your loan, and calculate how thousands of dollars can be saved by refinancing or making small early prepayments.
        </p>
      </div>

      {/* Loan Selector Tabs */}
      {liabilities.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {liabilities.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setSelectedLoanId(l.id);
                setNewRefinanceRate(Math.max(1.5, l.interestRate - 1.0));
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedLoan.id === l.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {l.description} ({l.interestRate}%)
            </button>
          ))}
        </div>
      )}

      {/* Current Loan Total Cost Card */}
      <div className="fin-card p-4 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-rose-400" /> {selectedLoan.description}
          </span>
          <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-rose-200">
            {selectedLoan.interestRate}% p.a. • {tenureYears} yrs left
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Principal</span>
            <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
              {formatCurrency(balance, currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Bank Interest You Will Pay</span>
            <span className="text-base sm:text-lg font-black text-rose-400 mt-0.5 block">
              +{formatCurrency(currentTotalLifetimeInterest, currency)}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-white/5 rounded-xl text-xs text-slate-300">
          Total amount to clear loan: <strong>{formatCurrency(balance + currentTotalLifetimeInterest, currency)}</strong> (Principal + Bank Interest).
        </div>
      </div>

      {/* STRATEGY 1: REFINANCING TO A LOWER RATE */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" /> Strategy 1: Refinance to a Lower Rate
          </h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            Save on Interest
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>New Refinanced Interest Rate:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
              {newRefinanceRate}% p.a. (Current: {currentRate}%)
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={currentRate}
            step={0.1}
            value={newRefinanceRate}
            onChange={(e) => setNewRefinanceRate(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Refinancing Savings Result Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
              Total Interest Saved
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
              {formatCurrency(totalInterestSavedFromRefinance, currency)}
            </span>
            <span className="text-[10px] text-emerald-600/80">Kept in your pocket</span>
          </div>

          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
            <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
              Monthly Payment Drop
            </span>
            <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 mt-0.5 block">
              -{formatCurrency(monthlySavingsFromRefinance, currency)}/mo
            </span>
            <span className="text-[10px] text-indigo-600/80">Extra monthly cashflow</span>
          </div>
        </div>
      </div>

      {/* STRATEGY 2: EARLY PREPAYMENT & ACCELERATED PAYOFF */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Strategy 2: Accelerated Prepayment & Early Settlement
          </h3>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
            Be Debt-Free Earlier
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">
              Extra Monthly Payment ({currency}/mo)
            </label>
            <input
              type="number"
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
              placeholder="e.g. 150"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase">
              1-Time Lump Sum Payoff ({currency})
            </label>
            <input
              type="number"
              value={lumpSumPrepayment}
              onChange={(e) => setLumpSumPrepayment(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        {/* Accelerated Payoff Result Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
              Years Shaved Off Loan
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
              {earlyPayoffResult.yearsSaved} Years Earlier
            </span>
            <span className="text-[10px] text-emerald-600/80">
              Debt-free in {earlyPayoffResult.newPayoffYears} yrs
            </span>
          </div>

          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
            <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
              Interest Kept Away from Bank
            </span>
            <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 mt-0.5 block">
              {formatCurrency(earlyPayoffResult.interestSaved, currency)}
            </span>
            <span className="text-[10px] text-indigo-600/80">Lifetime savings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
