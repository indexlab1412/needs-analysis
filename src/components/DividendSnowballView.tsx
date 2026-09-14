"use client";

import React, { useState, useMemo } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { StockHolding, DividendFrequency } from "@/lib/fna/types";
import {
  calculateHoldingMetrics,
  calculatePortfolioMetrics,
  runDividendSnowballSimulation,
  calculateRetirementCoverage,
  POPULAR_DIVIDEND_PRESETS,
} from "@/lib/fna/snowball-engine";
import { formatCurrency, generateId } from "@/lib/utils";
import { NumericInput } from "./ui/NumericInput";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  Repeat,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  Layers,
  Info,
  Percent,
  Zap,
  ArrowUpRight,
  Wallet,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const DividendSnowballView: React.FC = () => {
  const {
    profile,
    currency,
    isPrivacyMode,
    addStockHolding,
    updateStockHolding,
    removeStockHolding,
    syncStockHoldingsToFna,
    goToWizardStep,
  } = useFinancialStore();

  const holdings = profile.stockHoldings || [];

  // Simulation Controls
  const [projectionYears, setProjectionYears] = useState<number>(20);
  const [isGlobalDrip, setIsGlobalDrip] = useState<boolean>(true);
  const [monthlyDca, setMonthlyDca] = useState<number>(200);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // New Holding Form Drawer State
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newShares, setNewShares] = useState<number>(100);
  const [newCostBasis, setNewCostBasis] = useState<number>(50);
  const [newCurrentPrice, setNewCurrentPrice] = useState<number>(55);
  const [newDivPerShare, setNewDivPerShare] = useState<number>(2.5);
  const [newFrequency, setNewFrequency] = useState<DividendFrequency>("quarterly");
  const [newDivGrowth, setNewDivGrowth] = useState<number>(6.0);
  const [newPriceGrowth, setNewPriceGrowth] = useState<number>(5.0);

  // Calculate live portfolio metrics
  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(holdings), [holdings]);

  // Run Snowball multi-year simulation
  const simulationPoints = useMemo(() => {
    return runDividendSnowballSimulation({
      holdings,
      currentAge: profile.currentAge || 30,
      projectionYears,
      monthlyDcaContribution: monthlyDca,
      forceGlobalDrip: isGlobalDrip,
    });
  }, [holdings, profile.currentAge, projectionYears, monthlyDca, isGlobalDrip]);

  // Retirement dividend coverage
  const yearsToRetirement = Math.max(0, (profile.targetRetirementAge || 62) - (profile.currentAge || 30));
  const simAtRetirement = simulationPoints.find((p) => p.yearIndex === yearsToRetirement) || simulationPoints[simulationPoints.length - 1];
  const retirementCoverage = useMemo(() => {
    const projectedMonthly = simAtRetirement ? simAtRetirement.monthlyPassiveIncome : portfolioMetrics.monthlyDividends;
    return calculateRetirementCoverage(
      projectedMonthly,
      profile.desiredMonthlyRetirementSpendToday || 3000,
      (profile.assumptions?.generalInflationRate || 3.0) / 100,
      yearsToRetirement
    );
  }, [simAtRetirement, portfolioMetrics.monthlyDividends, profile.desiredMonthlyRetirementSpendToday, profile.assumptions?.generalInflationRate, yearsToRetirement]);

  const finalSimPoint = simulationPoints[simulationPoints.length - 1];
  const snowballDelta = finalSimPoint ? finalSimPoint.portfolioValueWithDrip - finalSimPoint.portfolioValueWithoutDrip : 0;

  // Handle adding preset
  const handleAddPreset = (preset: typeof POPULAR_DIVIDEND_PRESETS[0]) => {
    addStockHolding({
      ...preset,
    });
  };

  // Handle manual submit
  const handleAddNewHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;

    const yieldPct = newCurrentPrice > 0 ? (newDivPerShare / newCurrentPrice) * 100 : 0;

    addStockHolding({
      ticker: newTicker.toUpperCase().trim(),
      name: newName.trim() || newTicker.toUpperCase().trim(),
      shares: Number(newShares) || 0,
      costBasisPerShare: Number(newCostBasis) || 0,
      currentPrice: Number(newCurrentPrice) || 0,
      annualDividendPerShare: Number(newDivPerShare) || 0,
      dividendYield: Math.round(yieldPct * 100) / 100,
      payoutFrequency: newFrequency,
      expectedDividendGrowthRate: Number(newDivGrowth) || 5.0,
      expectedPriceGrowthRate: Number(newPriceGrowth) || 4.5,
      isDripEnabled: true,
    });

    // Reset form
    setNewTicker("");
    setNewName("");
    setIsAddingNew(false);
  };

  // Handle Sync to FNA
  const handleSyncToFna = () => {
    const res = syncStockHoldingsToFna();
    setSyncToast(
      `Synced to FNA! Updated Assets (${formatCurrency(res.totalValue, currency, 0)}) & Monthly Dividend Cashflow (+${formatCurrency(res.monthlyDividends, currency, 0)}/mo).`
    );
    setTimeout(() => setSyncToast(null), 5000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Header Banner & Sync Action */}
      <div className="fin-card p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/30 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              ❄️
            </span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Stock Holdings &amp; Dividend Snowball
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              DRIP Forecaster
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Track individual equities, forecast growing cash distributions, and model the exponential compounding of dividend reinvestment (DRIP) over 5 to 30 years.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleSyncToFna}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            title="Roll up stock valuations into FNA Assets and projected dividends into Cashflow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync into FNA Model</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? "Cancel" : "Add Holding"}</span>
          </button>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Portfolio Value */}
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
            Stock Portfolio Value
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(portfolioMetrics.totalValue, currency, 0, isPrivacyMode)}
            </span>
          </div>
          <div className="text-[11px] font-bold flex items-center gap-1">
            <span
              className={
                portfolioMetrics.totalGainLoss >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              {portfolioMetrics.totalGainLoss >= 0 ? "+" : ""}
              {formatCurrency(portfolioMetrics.totalGainLoss, currency, 0, isPrivacyMode)} (
              {portfolioMetrics.totalGainLossPercent >= 0 ? "+" : ""}
              {portfolioMetrics.totalGainLossPercent}%)
            </span>
            <span className="text-slate-400 font-normal">all-time</span>
          </div>
        </div>

        {/* Annual & Monthly Dividend Income */}
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
            Annual Dividend Income
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(portfolioMetrics.annualDividends, currency, 0, isPrivacyMode)}
              <span className="text-xs font-semibold text-slate-400">/yr</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-bold block">
            +{formatCurrency(portfolioMetrics.monthlyDividends, currency, 0, isPrivacyMode)}/mo passive cash
          </span>
        </div>

        {/* Current Yield vs Yield on Cost */}
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
            Dividend Yield vs. YoC
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {portfolioMetrics.portfolioYield}%
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              YoC: {portfolioMetrics.portfolioYieldOnCost}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Yield on original invested capital
          </span>
        </div>

        {/* Retirement Expense Coverage */}
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
            Retirement Passive Shield
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
              {retirementCoverage.coveragePercent}%
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              at Age {profile.targetRetirementAge || 62}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 leading-tight block">
            {retirementCoverage.isFullyCovered ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                🎉 100% Self-Funded via Dividends!
              </span>
            ) : (
              <span>Covers {formatCurrency(retirementCoverage.projectedMonthlyDividends, currency, 0, isPrivacyMode)}/mo</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. New Holding Manual Input Form Drawer */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewHolding}
          className="fin-card p-4 sm:p-5 bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-md space-y-4 animate-in slide-in-from-top-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Add New Stock / Dividend Position
              </h3>
              <p className="text-[11px] text-slate-500">
                Log ticker, shares, purchase price and expected dividend growth.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Ticker Symbol *</label>
              <input
                type="text"
                required
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="e.g. SCHD, AAPL"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Company / Fund Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. US Dividend 100 ETF"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Shares Owned</label>
              <NumericInput
                value={newShares}
                onChange={setNewShares}
                allowDecimals={true}
                placeholder="100"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Avg Purchase Price</label>
              <NumericInput
                value={newCostBasis}
                onChange={setNewCostBasis}
                allowDecimals={true}
                placeholder="75.0"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Current Market Price</label>
              <NumericInput
                value={newCurrentPrice}
                onChange={setNewCurrentPrice}
                allowDecimals={true}
                placeholder="82.0"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Annual Div / Share</label>
              <NumericInput
                value={newDivPerShare}
                onChange={setNewDivPerShare}
                allowDecimals={true}
                placeholder="2.74"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Payout Frequency</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as DividendFrequency)}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                <option value="quarterly">Quarterly (4x/yr)</option>
                <option value="monthly">Monthly (12x/yr)</option>
                <option value="semi-annual">Semi-Annual (2x/yr)</option>
                <option value="annual">Annual (1x/yr)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Exp. Div Growth (%/yr)</label>
              <NumericInput
                value={newDivGrowth}
                onChange={setNewDivGrowth}
                allowDecimals={true}
                placeholder="6.0"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
            >
              Save Holding
            </button>
          </div>
        </form>
      )}

      {/* 4. Quick-Add Presets Bar */}
      <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Bluechip Presets:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {POPULAR_DIVIDEND_PRESETS.map((preset) => (
            <button
              key={preset.ticker}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3 text-emerald-500" />
              <span>{preset.ticker}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                ({preset.dividendYield}%)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Holdings Table Section */}
      <div className="fin-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Individual Holdings ({holdings.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage position units, cost basis, current yields, and DRIP preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Add Position</span>
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No stock holdings added yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any of the quick bluechip presets above (SCHD, O, DBS, etc.) or add your own position.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">Holding / Ticker</th>
                  <th className="py-3 px-3">Shares</th>
                  <th className="py-3 px-3">Avg Cost</th>
                  <th className="py-3 px-3">Market Price</th>
                  <th className="py-3 px-3 text-right">Total Value</th>
                  <th className="py-3 px-3 text-right">Div / Share</th>
                  <th className="py-3 px-3 text-right">Yield (YoC)</th>
                  <th className="py-3 px-3 text-right">Annual Divs</th>
                  <th className="py-3 px-3 text-center">DRIP</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {holdings.map((holding) => {
                  const metrics = calculateHoldingMetrics(holding);
                  return (
                    <tr
                      key={holding.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Holding / Ticker */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200 dark:border-indigo-800">
                            {holding.ticker}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {holding.name}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {holding.payoutFrequency} payout
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-3">
                        <NumericInput
                          value={holding.shares}
                          onChange={(val) => updateStockHolding(holding.id, { shares: val })}
                          allowDecimals={true}
                          className="w-20 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </td>

                      {/* Avg Cost */}
                      <td className="py-3 px-3">
                        <NumericInput
                          value={holding.costBasisPerShare}
                          onChange={(val) => updateStockHolding(holding.id, { costBasisPerShare: val })}
                          allowDecimals={true}
                          className="w-20 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </td>

                      {/* Market Price */}
                      <td className="py-3 px-3">
                        <NumericInput
                          value={holding.currentPrice}
                          onChange={(val) => updateStockHolding(holding.id, { currentPrice: val })}
                          allowDecimals={true}
                          className="w-20 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(metrics.currentValue, currency, 0, isPrivacyMode)}
                        <span
                          className={`block text-[10px] font-bold ${
                            metrics.unrealizedGainLoss >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {metrics.unrealizedGainLoss >= 0 ? "+" : ""}
                          {metrics.unrealizedGainLossPercent}%
                        </span>
                      </td>

                      {/* Div / Share */}
                      <td className="py-3 px-3 text-right">
                        <NumericInput
                          value={holding.annualDividendPerShare}
                          onChange={(val) => updateStockHolding(holding.id, { annualDividendPerShare: val })}
                          allowDecimals={true}
                          className="w-18 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-right ml-auto"
                        />
                      </td>

                      {/* Yield & YoC */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
                          {metrics.dividendYield}%
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          YoC: {metrics.yieldOnCost}%
                        </span>
                      </td>

                      {/* Annual Divs */}
                      <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(metrics.annualDividend, currency, 0, isPrivacyMode)}/yr
                        <span className="text-[10px] text-slate-400 block font-normal">
                          +{formatCurrency(metrics.monthlyDividend, currency, 0, isPrivacyMode)}/mo
                        </span>
                      </td>

                      {/* DRIP toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateStockHolding(holding.id, { isDripEnabled: !holding.isDripEnabled })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            holding.isDripEnabled
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                          title="Reinvest dividends into additional shares"
                        >
                          {holding.isDripEnabled ? "DRIP ON" : "Cash Out"}
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeStockHolding(holding.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Remove holding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Multi-Year Snowball & DRIP Compounding Visualizer */}
      <div className="fin-card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Future Value &amp; Dividend Compounding Curve
            </h3>
            <p className="text-[11px] text-slate-400">
              Watch how reinvesting dividends supercharges your share count and passive income.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Horizon Pills */}
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-1 text-[11px] font-bold">
              {[5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setProjectionYears(yr)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    projectionYears === yr
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  {yr}y
                </button>
              ))}
            </div>

            {/* Global DRIP Toggle */}
            <button
              type="button"
              onClick={() => setIsGlobalDrip(!isGlobalDrip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isGlobalDrip
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isGlobalDrip ? "DRIP Enabled" : "Dividends as Cash"}</span>
            </button>
          </div>
        </div>

        {/* DCA Input & Snowball Power Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Monthly Cash DCA Contribution
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{currency}</span>
              <NumericInput
                value={monthlyDca}
                onChange={setMonthlyDca}
                placeholder="200"
                className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-black"
              />
              <span className="text-[10px] text-slate-400">/mo</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 block">
              Snowball DRIP Advantage ({projectionYears}y)
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 block">
              +{formatCurrency(snowballDelta, currency, 0, isPrivacyMode)}
            </span>
            <span className="text-[10px] text-emerald-600/90 leading-tight block">
              Extra wealth created purely by compounding dividends
            </span>
          </div>

          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 block">
              Projected Passive Income ({projectionYears}y)
            </span>
            <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 block">
              {finalSimPoint ? formatCurrency(finalSimPoint.monthlyPassiveIncome, currency, 0, isPrivacyMode) : "$0"}/mo
            </span>
            <span className="text-[10px] text-indigo-600/90 leading-tight block">
              At Age {(profile.currentAge || 30) + projectionYears} (YoC: {finalSimPoint?.yieldOnCostWithDrip || 0}%)
            </span>
          </div>
        </div>

        {/* Recharts Area/Line Chart */}
        <div className="w-full h-64 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulationPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="dripGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis
                dataKey="clientAge"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(v) => `Age ${v}`}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <span className="font-black text-indigo-300">
                            Age {data.clientAge} ({data.calendarYear})
                          </span>
                          <span className="text-[10px] text-slate-400">Year {data.yearIndex}</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center justify-between text-emerald-400 font-bold">
                            <span>With DRIP Pot:</span>
                            <span>{formatCurrency(data.portfolioValueWithDrip, currency, 0, isPrivacyMode)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Without DRIP:</span>
                            <span>{formatCurrency(data.portfolioValueWithoutDrip, currency, 0, isPrivacyMode)}</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-400 font-bold pt-1 border-t border-slate-800">
                            <span>Annual Dividends:</span>
                            <span>+{formatCurrency(data.annualDividendsWithDrip, currency, 0, isPrivacyMode)}/yr</span>
                          </div>
                          <div className="flex items-center justify-between text-indigo-300 font-bold">
                            <span>Monthly Passive:</span>
                            <span>+{formatCurrency(data.monthlyPassiveIncome, currency, 0, isPrivacyMode)}/mo</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span>Yield on Cost (YoC):</span>
                            <span>{data.yieldOnCostWithDrip}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value) => {
                  if (value === "portfolioValueWithDrip") return "Portfolio Value (With DRIP)";
                  if (value === "portfolioValueWithoutDrip") return "Without DRIP";
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="portfolioValueWithDrip"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dripGradient)"
              />
              <Line
                type="monotone"
                dataKey="portfolioValueWithoutDrip"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Retirement Cashflow Bridge & Longevity Shield */}
      <div className="fin-card p-4 sm:p-5 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                The Dividend Retirement Shield
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                How passive dividends prevent you from having to sell down your portfolio in retirement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToWizardStep(3)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Review Assets in Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Target Retirement Spend</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">
              {formatCurrency(retirementCoverage.inflatedMonthlySpend, currency, 0, isPrivacyMode)}/mo
            </span>
            <span className="text-[10px] text-slate-400">Adjusted for inflation at Age {profile.targetRetirementAge || 62}</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-0.5">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Projected Dividend Payout</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
              +{formatCurrency(retirementCoverage.projectedMonthlyDividends, currency, 0, isPrivacyMode)}/mo
            </span>
            <span className="text-[10px] text-slate-400">Pure passive yield (0 shares sold)</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-0.5">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Expense Coverage Ratio</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block">
              {retirementCoverage.coveragePercent}%
            </span>
            <span className="text-[10px] text-slate-400">
              {retirementCoverage.isFullyCovered ? "100% Perpetual Runway" : "Remaining gap covered by other assets/CPF"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
