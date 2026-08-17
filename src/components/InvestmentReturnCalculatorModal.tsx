"use client";

import React, { useState, useEffect } from "react";
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
  Briefcase,
  Zap,
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

  // Binary search for internal monthly rate r: (1+r)^m * P0 + DCA * ((1+r)^m - 1)/r = FV
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
  targetAssetId?: string;
  onApplyReturnRate?: (rate: number, assetId?: string) => void;
}

export const InvestmentReturnCalculatorModal: React.FC<InvestmentReturnCalculatorModalProps> = ({
  isOpen,
  onClose,
  targetAssetId,
  onApplyReturnRate,
}) => {
  const { profile, updateProfile, currency } = useFinancialStore();

  // Mode: "annual_lump" (single cumulative principal + total years) vs "monthly_dca" (initial lump + monthly DCA * months)
  const isAnnualCadence = profile.planningCadence !== "monthly";
  const [calcMode, setCalcMode] = useState<"annual_lump" | "monthly_dca">(
    isAnnualCadence ? "annual_lump" : "monthly_dca"
  );

  const [selectedTargetId, setSelectedTargetId] = useState<string>(targetAssetId || "global");

  // Annual Lump Sum Inputs
  const [annualTotalInvested, setAnnualTotalInvested] = useState<number>(15200);
  const [annualYearsInvested, setAnnualYearsInvested] = useState<number>(4.3);

  // Monthly DCA Inputs
  const [initialLumpSum, setInitialLumpSum] = useState<number>(10000);
  const [monthlyDCA, setMonthlyDCA] = useState<number>(100);
  const [monthsInvested, setMonthsInvested] = useState<number>(52);

  // Current Market Value (Shared)
  const [currentCashValue, setCurrentCashValue] = useState<number>(50000);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  // Sync with selected target asset if changed
  useEffect(() => {
    if (targetAssetId) {
      setSelectedTargetId(targetAssetId);
    }
  }, [targetAssetId]);

  useEffect(() => {
    if (selectedTargetId !== "global") {
      const foundAsset = profile.assets.find((a) => a.id === selectedTargetId);
      if (foundAsset) {
        if (foundAsset.initialLumpSum !== undefined) setInitialLumpSum(foundAsset.initialLumpSum);
        if (foundAsset.monthlyContribution !== undefined) setMonthlyDCA(foundAsset.monthlyContribution);
        if (foundAsset.monthsInvested !== undefined) setMonthsInvested(foundAsset.monthsInvested);
        if (foundAsset.currentValue !== undefined && foundAsset.currentValue > 0) {
          setCurrentCashValue(foundAsset.currentValue);
        }

        // Pre-fill annual total invested if available
        const totalDep = (foundAsset.initialLumpSum || 0) + (foundAsset.monthlyContribution || 0) * (foundAsset.monthsInvested || 0);
        if (totalDep > 0) {
          setAnnualTotalInvested(totalDep);
          setAnnualYearsInvested(Math.max(0.5, Math.round(((foundAsset.monthsInvested || 12) / 12) * 10) / 10));
        }
      }
    }
  }, [selectedTargetId, profile.assets]);

  if (!isOpen) return null;

  // Calculate result based on active mode
  const result =
    calcMode === "annual_lump"
      ? calculateAnnualizedIRR(annualTotalInvested, 0, Math.round(annualYearsInvested * 12), currentCashValue)
      : calculateAnnualizedIRR(initialLumpSum, monthlyDCA, monthsInvested, currentCashValue);

  const handleApply = () => {
    if (result.annualizedReturnRate !== undefined) {
      const isAnnual = calcMode === "annual_lump";
      const resolvedLump = isAnnual ? annualTotalInvested : initialLumpSum;
      const resolvedDCA = isAnnual ? 0 : monthlyDCA;
      const resolvedMonths = isAnnual ? Math.round(annualYearsInvested * 12) : monthsInvested;

      if (selectedTargetId === "global") {
        updateProfile((p) => ({
          ...p,
          assumptions: {
            ...p.assumptions,
            investmentReturnRate: result.annualizedReturnRate,
          },
        }));
        setAppliedMessage(`Applied ${result.annualizedReturnRate}% p.a. to Global Assumptions!`);
      } else {
        const assetObj = profile.assets.find((a) => a.id === selectedTargetId);
        const assetName = assetObj?.description || "Asset";
        updateProfile((p) => ({
          ...p,
          assets: p.assets.map((a) =>
            a.id === selectedTargetId
              ? {
                  ...a,
                  initialLumpSum: resolvedLump,
                  monthlyContribution: resolvedDCA,
                  monthsInvested: resolvedMonths,
                  currentValue: currentCashValue,
                  expectedReturnRate: result.annualizedReturnRate,
                  isAutoCalculatedIRR: true,
                }
              : a
          ),
          assumptions: {
            ...p.assumptions,
            investmentReturnRate: result.annualizedReturnRate,
          },
        }));
        setAppliedMessage(`Updated "${assetName}" with ${result.annualizedReturnRate}% p.a. IRR!`);
      }

      if (onApplyReturnRate) onApplyReturnRate(result.annualizedReturnRate, selectedTargetId);

      setTimeout(() => {
        setAppliedMessage(null);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Actual % p.a. (IRR / CAGR) Calculator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Replace guesswork with your actual annualized return from deposit history
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
          {/* Target Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Apply Return Rate To:
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="global">🌐 Global Portfolio Growth Assumption ({profile.assumptions.investmentReturnRate}% p.a.)</option>
              {profile.assets.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  📈 Specific Asset: {ast.description || "Unnamed Asset"} ({currency} {(ast.currentValue || 0).toLocaleString()} • {ast.expectedReturnRate || 6}% p.a.)
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: Annual Mode vs Monthly DCA Mode */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setCalcMode("annual_lump")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                calcMode === "annual_lump"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Annual Mode (Total Lump Sum)</span>
            </button>
            <button
              type="button"
              onClick={() => setCalcMode("monthly_dca")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                calcMode === "monthly_dca"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Monthly DCA Mode (Tranches)</span>
            </button>
          </div>

          {/* Diagnostic Result Highlight */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Your Actual Annualized Return ({calcMode === "annual_lump" ? "CAGR" : "IRR"}):
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
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

          {/* Form Inputs based on Active Mode */}
          {calcMode === "annual_lump" ? (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Annual Mode: Cumulative Principal & Valuation
                </h4>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  ⚡ 1-Step Annual Calculation
                </span>
              </div>

              {/* Annual Input 1: Total Principal Invested */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    1. Total Lump Sum of All Deposits So Far ({currency})
                  </label>
                  <span className="text-[10px] text-slate-400">Sum of initial + all monthly top-ups</span>
                </div>
                <NumericInput
                  value={annualTotalInvested}
                  onChange={setAnnualTotalInvested}
                  placeholder="15200"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Annual Input 2: Years Invested */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    2. Total Holding Period / Years Invested
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {annualYearsInvested} Years (~{Math.round(annualYearsInvested * 12)} months)
                  </span>
                </div>
                <NumericInput
                  value={annualYearsInvested}
                  onChange={setAnnualYearsInvested}
                  allowDecimals={true}
                  placeholder="4.3"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Annual Input 3: Current Market Value */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    3. Current Portfolio Market / Cash Value ({currency})
                  </label>
                  <span className="text-[10px] text-slate-400">Latest broker balance today</span>
                </div>
                <NumericInput
                  value={currentCashValue}
                  onChange={setCurrentCashValue}
                  placeholder="50000"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Monthly DCA Tranche Breakdown:
                </h4>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  Exact Money-Weighted Timing
                </span>
              </div>

              {/* Monthly Input 1: Initial Lump Sum */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    1. Initial Starting Lump Sum ({currency})
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. $10,000 upfront</span>
                </div>
                <NumericInput
                  value={initialLumpSum}
                  onChange={setInitialLumpSum}
                  placeholder="10000"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Monthly Input 2: Monthly DCA */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    2. Regular Monthly DCA ({currency}/month)
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. $100 / month</span>
                </div>
                <NumericInput
                  value={monthlyDCA}
                  onChange={setMonthlyDCA}
                  placeholder="100"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Monthly Input 3: Duration in Months */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    3. Total Duration Invested (Number of Months)
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {(monthsInvested / 12).toFixed(1)} Years ({monthsInvested} mos)
                  </span>
                </div>
                <NumericInput
                  value={monthsInvested}
                  onChange={setMonthsInvested}
                  placeholder="52"
                  allowDecimals={false}
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Monthly Input 4: Current Cash Value */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    4. Current Portfolio Market / Cash Value ({currency})
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. $50,000 broker balance</span>
                </div>
                <NumericInput
                  value={currentCashValue}
                  onChange={setCurrentCashValue}
                  placeholder="50000"
                  className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
          )}

          {/* Explanation Info */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>How this is calculated:</strong> In Annual Mode, solves for annualized compound annual growth rate (CAGR) from total principal invested. In Monthly Mode, solves for money-weighted internal rate of return (IRR / XIRR) based on regular monthly tranches.
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
            {appliedMessage ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{appliedMessage}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Apply {result.annualizedReturnRate}% p.a. to {selectedTargetId === "global" ? "Profile" : "Asset"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
