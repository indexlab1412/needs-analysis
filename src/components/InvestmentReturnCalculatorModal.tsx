"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { NumericInput } from "./ui/NumericInput";
import {
  TrendingUp,
  Calculator,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Info,
  DollarSign,
  Calendar,
  Layers,
} from "lucide-react";

export function calculateAnnualizedIRR(
  initialPrincipal: number,
  monthlyDCA: number,
  months: number,
  currentValue: number
): {
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  annualizedReturnRate: number;
} {
  const totalInvested = (initialPrincipal || 0) + (monthlyDCA || 0) * (months || 0);
  const totalGain = (currentValue || 0) - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  if (months <= 0 || totalInvested <= 0 || currentValue <= 0) {
    return {
      totalInvested: Math.round(totalInvested),
      totalGain: Math.round(totalGain),
      totalGainPercent: 0,
      annualizedReturnRate: 0,
    };
  }

  // Pure lump sum case (no monthly DCA)
  if (monthlyDCA <= 0) {
    const years = months / 12;
    if (years <= 0 || initialPrincipal <= 0) {
      return { totalInvested, totalGain, totalGainPercent, annualizedReturnRate: 0 };
    }
    const cagr = (Math.pow(currentValue / initialPrincipal, 1 / years) - 1) * 100;
    return {
      totalInvested: Math.round(totalInvested),
      totalGain: Math.round(totalGain),
      totalGainPercent: Math.round(totalGainPercent * 10) / 10,
      annualizedReturnRate: Math.round(cagr * 10) / 10,
    };
  }

  // Binary search for internal monthly rate r
  let low = -0.5; // up to -50% per month
  let high = 2.0; // up to 200% per month
  let bestR = 0;

  for (let iter = 0; iter < 45; iter++) {
    const r = (low + high) / 2;
    let fv = initialPrincipal * Math.pow(1 + r, months);
    if (Math.abs(r) < 1e-7) {
      fv += monthlyDCA * months;
    } else {
      fv += monthlyDCA * ((Math.pow(1 + r, months) - 1) / r);
    }

    if (fv < currentValue) {
      low = r;
      bestR = r;
    } else {
      high = r;
      bestR = r;
    }
  }

  const annualRate = (Math.pow(1 + bestR, 12) - 1) * 100;
  return {
    totalInvested: Math.round(totalInvested),
    totalGain: Math.round(totalGain),
    totalGainPercent: Math.round(totalGainPercent * 10) / 10,
    annualizedReturnRate: Math.round(annualRate * 10) / 10,
  };
}

interface InvestmentReturnCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyReturnRate?: (rate: number) => void;
}

export const InvestmentReturnCalculatorModal: React.FC<InvestmentReturnCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyReturnRate,
}) => {
  const { profile, updateProfile, currency } = useFinancialStore();

  const [initialLumpSum, setInitialLumpSum] = useState<number>(5000);
  const [monthlyDCA, setMonthlyDCA] = useState<number>(200);
  const [monthsInvested, setMonthsInvested] = useState<number>(36);
  const [currentCashValue, setCurrentCashValue] = useState<number>(14500);
  const [appliedToast, setAppliedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = calculateAnnualizedIRR(initialLumpSum, monthlyDCA, monthsInvested, currentCashValue);

  const handleApply = () => {
    if (result.annualizedReturnRate > 0) {
      updateProfile((p) => ({
        ...p,
        assumptions: {
          ...p.assumptions,
          investmentReturnRate: result.annualizedReturnRate,
        },
      }));
      if (onApplyReturnRate) onApplyReturnRate(result.annualizedReturnRate);
      setAppliedToast(true);
      setTimeout(() => {
        setAppliedToast(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Actual % p.a. Investment Return Calculator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculate your exact annualized CAGR / IRR from DCA deposits & market value
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

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Diagnostic Result Highlight */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Your Actual Portfolio Annualized Return:
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                {result.annualizedReturnRate >= 0 ? `+${result.annualizedReturnRate}% p.a.` : `${result.annualizedReturnRate}% p.a.`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Deposited</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                  {formatCurrency(result.totalInvested, currency)}
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Net Profit</span>
                <span className={`text-xs sm:text-sm font-black mt-0.5 block ${
                  result.totalGain >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {result.totalGain >= 0 ? `+${formatCurrency(result.totalGain, currency)}` : formatCurrency(result.totalGain, currency)}
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Return</span>
                <span className={`text-xs sm:text-sm font-black mt-0.5 block ${
                  result.totalGainPercent >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {result.totalGainPercent >= 0 ? `+${result.totalGainPercent}%` : `${result.totalGainPercent}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Inputs Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Enter Your Deposit History & Current Value:
            </h4>

            {/* Input 1: Initial Lump Sum */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  1. Initial Starting Lump Sum ({currency})
                </label>
                <span className="text-[10px] text-slate-400">If started from $0, enter 0</span>
              </div>
              <NumericInput
                value={initialLumpSum}
                onChange={setInitialLumpSum}
                placeholder="e.g. 5000"
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            {/* Input 2: Monthly DCA */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  2. Regular Monthly DCA ({currency}/month)
                </label>
                <span className="text-[10px] text-slate-400">e.g. $100 / $200 per mo</span>
              </div>
              <NumericInput
                value={monthlyDCA}
                onChange={setMonthlyDCA}
                placeholder="e.g. 200"
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            {/* Input 3: Duration in Months */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  3. Total Duration Invested (Number of Months)
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  {(monthsInvested / 12).toFixed(1)} Years
                </span>
              </div>
              <NumericInput
                value={monthsInvested}
                onChange={setMonthsInvested}
                placeholder="e.g. 50"
                allowDecimals={false}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            {/* Input 4: Current Cash Value */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  4. Current Portfolio Market / Cash Value ({currency})
                </label>
                <span className="text-[10px] text-slate-400">Look at your broker app today</span>
              </div>
              <NumericInput
                value={currentCashValue}
                onChange={setCurrentCashValue}
                placeholder="e.g. 14500"
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Explanation Info */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>How this is calculated:</strong> Uses the industry standard Money-Weighted Return (Internal Rate of Return / XIRR) accounting for the exact timing of each monthly DCA tranche rather than naive simple division.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            disabled={result.annualizedReturnRate <= 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            {appliedToast ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Applied {result.annualizedReturnRate}% p.a. to Profile!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply {result.annualizedReturnRate}% p.a. to Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
