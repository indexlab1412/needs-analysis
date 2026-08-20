"use client";

import React, { useState, useMemo } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency } from "@/lib/utils";
import { runRetirementMonteCarlo } from "@/lib/fna/monte-carlo";
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Flame,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export const RetirementWeatherView: React.FC = () => {
  const { profile, summary, currency } = useFinancialStore();
  const { netWorth, cashFlow, retirementDetails } = summary;

  // Base profile values
  const currentAge = profile.currentAge || 25;
  const initialRetireAge = profile.targetRetirementAge || 60;
  const initialMonthlySpend = retirementDetails.todayMonthlySpend || 3000;
  const initialPension = profile.cpfLife?.isEnabled !== false ? (profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650) : 0;
  const initialStartingPortfolio = netWorth.totalAssets || 0;
  const initialMonthlyContribution = cashFlow.totalMonthlyDCAInvestments || 0;

  // Interactive Live Sliders
  const [retireAge, setRetireAge] = useState<number>(initialRetireAge);
  const [monthlySavingsBoost, setMonthlySavingsBoost] = useState<number>(0);
  const [monthlySpendToday, setMonthlySpendToday] = useState<number>(initialMonthlySpend);
  const [guaranteedPension, setGuaranteedPension] = useState<number>(initialPension);
  const [simulateMarketShock, setSimulateMarketShock] = useState<boolean>(false);

  // Compute live Monte Carlo result based on slider changes
  const liveResult = useMemo(() => {
    const yearsToRetire = Math.max(1, retireAge - currentAge);
    const inflation = (profile.assumptions.generalInflationRate || 3.0) / 100;
    
    // Future inflated monthly spend
    const futureMonthlySpend = monthlySpendToday * Math.pow(1 + inflation, yearsToRetire);
    const futureMonthlyPension = guaranteedPension * Math.pow(1 + inflation, Math.max(0, 65 - currentAge));

    return runRetirementMonteCarlo({
      startingPortfolio: initialStartingPortfolio,
      monthlyContribution: initialMonthlyContribution + monthlySavingsBoost,
      currentAge,
      retirementAge: retireAge,
      lifeExpectancy: profile.lifeExpectancy || 88,
      monthlySpendInRetirement: Math.round(futureMonthlySpend),
      guaranteedMonthlyPension: Math.round(futureMonthlyPension),
      meanAnnualReturn: (profile.assumptions.investmentReturnRate || 6.5) / 100,
      annualVolatility: 0.12,
      iterations: 1000,
      simulatedEarlyCrash: simulateMarketShock,
    });
  }, [
    currentAge,
    retireAge,
    monthlySavingsBoost,
    monthlySpendToday,
    guaranteedPension,
    simulateMarketShock,
    initialStartingPortfolio,
    initialMonthlyContribution,
    profile.lifeExpectancy,
    profile.assumptions,
  ]);

  // Weather Icon & Styling (Adaptive to Light & Dark themes)
  const getWeatherDetails = () => {
    switch (liveResult.weatherGrade) {
      case "sunny":
        return {
          icon: Sun,
          colorText: "text-amber-500 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300",
          badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
          scoreBorder: "border-amber-500",
          scoreText: "text-amber-600 dark:text-amber-400",
        };
      case "mild":
        return {
          icon: CloudSun,
          colorText: "text-sky-500 dark:text-sky-400",
          iconBg: "bg-sky-100 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300",
          badgeBg: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700",
          scoreBorder: "border-sky-500",
          scoreText: "text-sky-600 dark:text-sky-400",
        };
      case "cloudy":
        return {
          icon: CloudRain,
          colorText: "text-indigo-500 dark:text-indigo-400",
          iconBg: "bg-indigo-100 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300",
          badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
          scoreBorder: "border-indigo-500",
          scoreText: "text-indigo-600 dark:text-indigo-400",
        };
      case "stormy":
      default:
        return {
          icon: CloudLightning,
          colorText: "text-rose-500 dark:text-rose-400",
          iconBg: "bg-rose-100 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300",
          badgeBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700",
          scoreBorder: "border-rose-500",
          scoreText: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  const weather = getWeatherDetails();
  const WeatherIcon = weather.icon;

  const handleResetSliders = () => {
    setRetireAge(initialRetireAge);
    setMonthlySavingsBoost(0);
    setMonthlySpendToday(initialMonthlySpend);
    setGuaranteedPension(initialPension);
    setSimulateMarketShock(false);
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
            Age {label} ({data.year})
          </div>
          <div className="text-emerald-600 dark:text-emerald-400">
            Boom Market (Top 10%): {formatCurrency(data.percentile90, currency)}
          </div>
          <div className="text-sky-600 dark:text-sky-400 font-semibold">
            Average Market (Median): {formatCurrency(data.percentile50, currency)}
          </div>
          <div className="text-rose-600 dark:text-rose-400">
            Recession / Crash (Worst 10%): {formatCurrency(data.percentile10, currency)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Main Weather Score Card (Harmonized with standard fin-card theme) */}
      <div className="fin-card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${weather.iconBg}`}>
              <WeatherIcon className={`w-6 h-6 ${weather.colorText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Retirement Weather Forecast
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${weather.badgeBg}`}>
                {liveResult.weatherTitle}
              </span>
            </div>
          </div>

          {/* Big Score Dial */}
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 ${weather.scoreBorder} shadow-sm shrink-0`}>
            <span className={`text-lg font-black leading-none ${weather.scoreText}`}>
              {liveResult.successRate}%
            </span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
              Resilience
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {liveResult.weatherDescription}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tested across <strong>1,000 randomized market lifelines</strong> including historical recessions and high inflation cycles.
            </p>
          </div>
        </div>

        {/* Confidence Band Area Chart */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Your Portfolio Range (Age {currentAge} to {profile.lifeExpectancy || 88})
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Retire at Age {retireAge}
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveResult.trajectories} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBoom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} />
                <XAxis dataKey="age" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine x={retireAge} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Retire", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
                
                {/* 90th Percentile (Boom) */}
                <Area type="monotone" dataKey="percentile90" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBoom)" />
                {/* 50th Percentile (Median) */}
                <Area type="monotone" dataKey="percentile50" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMedian)" />
                {/* 10th Percentile (Worst Market) */}
                <Line type="monotone" dataKey="percentile10" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 dark:text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Top 10% (Boom)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Average (Median)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" /> Worst 10% (Crash)
            </span>
          </div>
        </div>

        {/* Worst Case Callout (Cleaned up: No escaped backslashes, uses formatCurrency) */}
        {liveResult.worstCaseDepletionAge ? (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              <strong>Crash Warning:</strong> In the worst 10% market crash scenario, funds reach {formatCurrency(0, currency)} at <strong>Age {liveResult.worstCaseDepletionAge}</strong>. Use the sliders below to protect against this!
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Crash Resistant:</strong> Even in the worst 10% market crash, your nest egg survives through your entire life expectancy!
            </span>
          </div>
        )}
      </div>

      {/* 2. Interactive Single-Thumb Quick Fix Sliders */}
      <div className="fin-card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">One-Tap Weather Tuning</h4>
          </div>
          <button
            type="button"
            onClick={handleResetSliders}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Move the sliders below to see how small tweaks immediately boost your retirement safety score:
        </p>

        {/* Slider 1: Monthly Savings Boost */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Boost Monthly Savings:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              +{formatCurrency(monthlySavingsBoost, currency)}/mo
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={monthlySavingsBoost}
            onChange={(e) => setMonthlySavingsBoost(Number(e.target.value))}
            className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>+{formatCurrency(0, currency)}</span>
            <span>+{formatCurrency(500, currency)}/mo</span>
            <span>+{formatCurrency(1000, currency)}/mo</span>
          </div>
        </div>

        {/* Slider 2: Target Retirement Age */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target Retirement Age:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              Age {retireAge} ({retireAge - currentAge} yrs away)
            </span>
          </div>
          <input
            type="range"
            min={Math.max(currentAge + 1, 50)}
            max={75}
            step={1}
            value={retireAge}
            onChange={(e) => setRetireAge(Number(e.target.value))}
            className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Age 50</span>
            <span>Age 62</span>
            <span>Age 75</span>
          </div>
        </div>

        {/* Slider 3: Desired Retirement Monthly Lifestyle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Desired Monthly Spend (Today's Dollars):</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {formatCurrency(monthlySpendToday, currency)}/mo
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={10000}
            step={250}
            value={monthlySpendToday}
            onChange={(e) => setMonthlySpendToday(Number(e.target.value))}
            className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{formatCurrency(1000, currency)} (Basic)</span>
            <span>{formatCurrency(5000, currency)}</span>
            <span>{formatCurrency(10000, currency)} (Abundant)</span>
          </div>
        </div>

        {/* 2008 Crash Stress-Test Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Simulate 2008-Style Crash at Retirement (-25%)
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Tests whether your plan survives a major recession in the first year you stop working.
            </p>
          </div>
          <input
            type="checkbox"
            checked={simulateMarketShock}
            onChange={(e) => setSimulateMarketShock(e.target.checked)}
            className="w-5 h-5 accent-rose-600 rounded cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
