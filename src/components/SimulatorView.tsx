"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import { LifeTransitionView } from "./LifeTransitionView";
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
  HelpCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Briefcase,
  Flame,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Scissors,
  HeartHandshake,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type SimulatorMode = "market_levers" | "retrenchment_stress_test" | "life_transitions";

export const SimulatorView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { assumptions } = profile;
  const { netWorth, cashFlow } = summary;

  const [activeMode, setActiveMode] = useState<SimulatorMode>("retrenchment_stress_test");

  // Stress Test Local States
  const [unemploymentMonths, setUnemploymentMonths] = useState<number>(6);
  const [severancePayout, setSeverancePayout] = useState<number>(0);
  const [freelanceMonthlyIncome, setFreelanceMonthlyIncome] = useState<number>(0);
  const [isBarebonesBudget, setIsBarebonesBudget] = useState<boolean>(true);
  const [pauseDCA, setPauseDCA] = useState<boolean>(true);

  const retirementShortfall = summary.shortfalls.find((s) => s.category === "retirement");

  // --- RETRENCHMENT STRESS TEST CALCULATIONS ---
  const liquidCashAvailable = netWorth.liquidAssets + severancePayout;

  // Monthly burn calculation
  const baseMonthlyExpenses = isBarebonesBudget
    ? cashFlow.essentialMonthlyExpenses
    : cashFlow.totalMonthlyExpenses;

  const dcaOutflow = pauseDCA ? 0 : cashFlow.totalMonthlyDCAInvestments;
  const grossMonthlyBurn = baseMonthlyExpenses + dcaOutflow;
  const netMonthlyBurn = Math.max(0, grossMonthlyBurn - freelanceMonthlyIncome);

  // Maximum runway in months
  const exactRunwayMonths = netMonthlyBurn > 0 ? liquidCashAvailable / netMonthlyBurn : 99;
  const roundedRunwayMonths = Math.round(exactRunwayMonths * 10) / 10;
  const isRunwayDeficit = exactRunwayMonths < unemploymentMonths;
  const totalBurnOverPeriod = Math.round(netMonthlyBurn * unemploymentMonths);
  const remainingCashAtEnd = Math.round(liquidCashAvailable - totalBurnOverPeriod);
  const cashShortfallAtEnd = Math.max(0, totalBurnOverPeriod - liquidCashAvailable);

  // Depletion timeline data points
  const depletionTrajectory = React.useMemo(() => {
    const points = [];
    let currentCash = liquidCashAvailable;

    points.push({
      month: 0,
      label: "Start",
      cash: Math.round(currentCash),
      zeroLine: 0,
    });

    for (let m = 1; m <= Math.max(unemploymentMonths, 12); m++) {
      currentCash = currentCash - netMonthlyBurn;
      points.push({
        month: m,
        label: `Mth ${m}`,
        cash: Math.round(currentCash),
        zeroLine: 0,
      });
    }
    return points;
  }, [liquidCashAvailable, netMonthlyBurn, unemploymentMonths]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          Interactive "What-If?" Simulator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stress-test your finances against unexpected real-world events like job loss, career breaks, divorce/widowed transitions, or test market return levers.
        </p>
      </div>

      {/* Simulator Mode Selector */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveMode("retrenchment_stress_test")}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeMode === "retrenchment_stress_test"
              ? "bg-rose-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Job Loss Break</span>
        </button>

        <button
          onClick={() => setActiveMode("life_transitions")}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeMode === "life_transitions"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Divorce / Widowed</span>
        </button>

        <button
          onClick={() => setActiveMode("market_levers")}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeMode === "market_levers"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Retirement Levers</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: RETRENCHMENT & CAREER BREAK STRESS TEST */}
      {/* ========================================================================= */}
      {activeMode === "retrenchment_stress_test" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Stress Test Verdict Card */}
          <div
            className={`fin-card p-4 rounded-2xl border ${
              isRunwayDeficit
                ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                : "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" /> Cash Runway Survival
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isRunwayDeficit
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {isRunwayDeficit ? `Deficit after ${roundedRunwayMonths} Mths` : `Safe for ${unemploymentMonths} Mths`}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {roundedRunwayMonths} Months
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">of ready cash runway</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Monthly Cash Burn</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(netMonthlyBurn, currency)}/mo
                </span>
              </div>
            </div>

            {/* Verdict Explanation */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {isRunwayDeficit ? (
                <p>
                  ⚠️ <strong>Warning:</strong> If you are unemployed for <strong>{unemploymentMonths} months</strong>, you will burn a total of <strong>{formatCurrency(totalBurnOverPeriod, currency)}</strong>. Your current liquid cash ({formatCurrency(liquidCashAvailable, currency)}) will run dry at <strong>Month {roundedRunwayMonths}</strong>, leaving a shortfall of <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(cashShortfallAtEnd, currency)}</strong>.
                </p>
              ) : (
                <p>
                  🎉 <strong>Solid Runway:</strong> Your ready cash of <strong>{formatCurrency(liquidCashAvailable, currency)}</strong> will safely last you through all <strong>{unemploymentMonths} months</strong> of unemployment with <strong>{formatCurrency(remainingCashAtEnd, currency)}</strong> leftover!
                </p>
              )}
            </div>
          </div>

          {/* Interactive Stress Test Levers */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Stress-Test Parameters
            </h3>

            {/* 1. Unemployment Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Months Without a Full-Time Job:</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                  {unemploymentMonths} Months
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={unemploymentMonths}
                onChange={(e) => setUnemploymentMonths(Number(e.target.value))}
                className="w-full accent-rose-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Month (Quick switch)</span>
                <span>6 Months (Avg search)</span>
                <span>12-24 Months (Career break)</span>
              </div>
            </div>

            {/* 2. Budget Mode Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Spending Mode During Job Search:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsBarebonesBudget(true)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isBarebonesBudget
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-indigo-500" /> Barebones Survival
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Essential bills only ({formatCurrency(cashFlow.essentialMonthlyExpenses, currency)}/mo)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBarebonesBudget(false)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    !isBarebonesBudget
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold block">Normal Spending</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Full lifestyle ({formatCurrency(cashFlow.totalMonthlyExpenses, currency)}/mo)
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Pause DCA Investments Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Pause Auto-Invest / DCA ({formatCurrency(cashFlow.totalMonthlyDCAInvestments, currency)}/mo)?
                </span>
                <span className="text-[10px] text-slate-500">
                  Temporarily stop regular ETF/Robo contributions to save cash
                </span>
              </div>
              <input
                type="checkbox"
                checked={pauseDCA}
                onChange={(e) => setPauseDCA(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* 4. Retrenchment Severance & Freelance Income Offsets */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">
                  Severance Package ({currency})
                </label>
                <input
                  type="number"
                  value={severancePayout}
                  onChange={(e) => setSeverancePayout(Number(e.target.value) || 0)}
                  placeholder="e.g. 8000"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">
                  Side Gig / Freelance ({currency}/mo)
                </label>
                <input
                  type="number"
                  value={freelanceMonthlyIncome}
                  onChange={(e) => setFreelanceMonthlyIncome(Number(e.target.value) || 0)}
                  placeholder="e.g. 500"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Month-by-Month Depletion Chart */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> Cash Depletion Trajectory
                </h4>
                <p className="text-[10px] text-slate-400">See your bank balance declining over the unemployment months</p>
              </div>
            </div>

            <div className="w-full h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depletionTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800">
                            <div className="font-bold text-slate-300">{data.label} (Month {data.month})</div>
                            <div className="flex justify-between gap-4 text-emerald-400 font-bold mt-1">
                              <span>Cash Balance:</span>
                              <span className={data.cash < 0 ? "text-rose-400" : "text-emerald-400"}>
                                {formatCurrency(data.cash, currency)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="cash"
                    stroke={isRunwayDeficit ? "#f43f5e" : "#10b981"}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: isRunwayDeficit ? "#f43f5e" : "#10b981" }}
                    activeDot={{ r: 6 }}
                    name="Bank Cash Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DIVORCED & WIDOWED LIFE TRANSITIONS */}
      {/* ========================================================================= */}
      {activeMode === "life_transitions" && (
        <div className="animate-in fade-in duration-200">
          <LifeTransitionView />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RETIREMENT & MARKET LEVERS */}
      {/* ========================================================================= */}
      {activeMode === "market_levers" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Live Impact Scorecard */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="fin-card p-3.5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-indigo-300">Financial Fitness Score</div>
              <div className="text-xl sm:text-2xl font-black mt-1">
                {summary.overallFinancialHealthScore}/100
              </div>
              <div className="text-[10px] text-indigo-200 mt-0.5">
                {summary.overallFinancialHealthScore >= 75 ? "Looking Great!" : "Room to Level Up"}
              </div>
            </div>

            <div className="fin-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Retirement Fund Gap</div>
              <div
                className={`text-lg sm:text-xl font-extrabold mt-1 truncate ${
                  retirementShortfall && retirementShortfall.shortfallAmount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {retirementShortfall && retirementShortfall.shortfallAmount > 0
                  ? formatCurrency(retirementShortfall.shortfallAmount, currency)
                  : "Fully Funded 🎉"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Progress: {retirementShortfall?.coverageRatio || 0}%
              </div>
            </div>
          </div>

          {/* Interactive Slider Controls */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Long-Term Wealth Levers
            </h3>

            {/* 1. Target Retirement Age */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>When do you want to retire?</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  Age {profile.targetRetirementAge}
                </span>
              </div>
              <input
                type="range"
                min={profile.currentAge + 1}
                max={70}
                step={1}
                value={profile.targetRetirementAge}
                onChange={(e) => updateProfile((p) => ({ ...p, targetRetirementAge: Number(e.target.value) }))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Age {profile.currentAge + 1} (FIRE / Early)</span>
                <span>Age 60 (Standard)</span>
                <span>Age 70</span>
              </div>
            </div>

            {/* 2. Expected Investment Return (ROI) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Annual Investment Growth Rate</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {assumptions.investmentReturnRate}% / year
                </span>
              </div>
              <input
                type="range"
                min={2.0}
                max={12.0}
                step={0.5}
                value={assumptions.investmentReturnRate}
                onChange={(e) =>
                  updateProfile((p) => ({
                    ...p,
                    assumptions: { ...p.assumptions, investmentReturnRate: Number(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2% (Bank FD)</span>
                <span>6.5% (Global Index ETF)</span>
                <span>12% (Aggressive Growth)</span>
              </div>
            </div>

            {/* 3. General Inflation Rate */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Cost of Living Inflation</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {assumptions.generalInflationRate}% / year
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={7.0}
                step={0.5}
                value={assumptions.generalInflationRate}
                onChange={(e) =>
                  updateProfile((p) => ({
                    ...p,
                    assumptions: { ...p.assumptions, generalInflationRate: Number(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.5% (Low)</span>
                <span>3.0% (Average)</span>
                <span>7.0% (High Inflation)</span>
              </div>
            </div>

            {/* 4. Emergency Buffer Months */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Emergency Safety Stash Goal</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {assumptions.emergencyFundMonthsTarget} Months Runway
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={1}
                value={assumptions.emergencyFundMonthsTarget}
                onChange={(e) =>
                  updateProfile((p) => ({
                    ...p,
                    assumptions: { ...p.assumptions, emergencyFundMonthsTarget: Number(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>3 Months (Minimum)</span>
                <span>6 Months (Recommended)</span>
                <span>12 Months</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
