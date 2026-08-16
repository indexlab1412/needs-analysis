"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { RiskProfile } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HelpCircle,
  X,
  ArrowRight,
  Flame,
  Scale,
  DollarSign,
  Lock,
} from "lucide-react";

interface RiskProfileMeta {
  key: RiskProfile;
  title: string;
  expectedReturn: number;
  icon: any;
  badgeColor: string;
  assetAllocation: string;
  bestFor: string;
  description: string;
  drawdownExpectation: string;
}

export const RISK_PROFILES_META: { [key in RiskProfile]: RiskProfileMeta } = {
  conservative: {
    key: "conservative",
    title: "🛡️ Conservative (Capital Preservation)",
    expectedReturn: 3.0,
    icon: Lock,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    assetAllocation: "80% Fixed Deposits & T-Bills • 20% Bonds",
    bestFor: "Short-term goals (<3 yrs) or extreme aversion to temporary market dips",
    description:
      "Focuses on keeping your capital 100% safe. You will experience almost zero account swings, but growth will trail inflation.",
    drawdownExpectation: "Max historical dip: 0% to -2%",
  },
  moderate: {
    key: "moderate",
    title: "⚖️ Moderate (Cautious Growth)",
    expectedReturn: 4.5,
    icon: Scale,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    assetAllocation: "70% High-Grade Bonds & Money Market • 30% Global Equities",
    bestFor: "3-5 Year medium-term goals like wedding or BTO renovation",
    description:
      "A cautious portfolio designed to beat bank interest rates with minimal volatility.",
    drawdownExpectation: "Max historical dip: -5% to -8%",
  },
  balanced: {
    key: "balanced",
    title: "🎯 Balanced (Core Steady Compounding)",
    expectedReturn: 6.0,
    icon: ShieldCheck,
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    assetAllocation: "50% Global Index ETFs (S&P 500 / MSCI World) • 50% Bonds",
    bestFor: "5-10 Year goals and smooth wealth building without extreme emotional stress",
    description:
      "Equal balance between equity market growth and bond stability. Smooth compounding over time.",
    drawdownExpectation: "Max historical dip: -12% to -15%",
  },
  growth: {
    key: "growth",
    title: "🚀 Growth (Wealth Builder - Recommended for 20s/30s)",
    expectedReturn: 7.5,
    icon: TrendingUp,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    assetAllocation: "80% Global Equities & Index ETFs • 20% Bonds",
    bestFor: "Long-term goals (7+ yrs) such as Retirement and Child University Fund",
    description:
      "Leverages the long-term wealth of the global economy. Temporary dips happen during recessions, but historic compounding is strong.",
    drawdownExpectation: "Max historical dip: -20% to -25% (Recovers over 2-3 yrs)",
  },
  aggressive: {
    key: "aggressive",
    title: "⚡ Aggressive Growth (Maximum Compounding)",
    expectedReturn: 9.0,
    icon: Flame,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    assetAllocation: "100% Equities, Tech ETFs & Emerging Markets",
    bestFor: "Long investment horizons (15-30 yrs) with strong emotional resilience to dips",
    description:
      "Pure equity compounding for maximum future wealth. Best suited for young adults with steady monthly cash flow.",
    drawdownExpectation: "Max historical dip: -30% to -35%",
  },
};

interface RiskProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskProfilerModal: React.FC<RiskProfilerModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, currency } = useFinancialStore();
  const currentRisk = profile.riskProfile || "balanced";

  const [mode, setMode] = useState<"quiz" | "overview">("quiz");
  const [quizStep, setQuizStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);

  if (!isOpen) return null;

  const quizQuestions = [
    {
      question: "If your S$10,000 investment temporarily dropped to S$8,000 (-20%) during a market crash, what would you do?",
      options: [
        { label: "I would panic, lose sleep, and sell everything to cash immediately.", score: 1 },
        { label: "I would feel very anxious and avoid looking at my account.", score: 2 },
        { label: "I understand market dips are normal for long-term growth and will wait it out.", score: 3 },
        { label: "I would get excited and auto-invest more cash at a discount!", score: 4 },
      ],
    },
    {
      question: "When do you plan to start withdrawing this money for your major life goals?",
      options: [
        { label: "Within 1 to 3 years (Short-term safety is priority)", score: 1 },
        { label: "In 3 to 7 years (e.g. Wedding, BTO renovation)", score: 2 },
        { label: "In 7 to 15 years (e.g. Kids' College Education)", score: 3 },
        { label: "In 15 to 30+ years (e.g. Financial Freedom & Early Retirement)", score: 4 },
      ],
    },
    {
      question: "Which of these two financial risks worries you more?",
      options: [
        { label: "Seeing my account balance drop temporarily during a bad market year.", score: 1 },
        { label: "Losing 3.0% of my purchasing power every year to inflation over 25 years.", score: 3 },
      ],
    },
  ];

  const handleSelectAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate resulting profile
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      let recommended: RiskProfile = "balanced";
      if (totalScore <= 4) recommended = "conservative";
      else if (totalScore <= 6) recommended = "moderate";
      else if (totalScore <= 8) recommended = "balanced";
      else if (totalScore <= 10) recommended = "growth";
      else recommended = "aggressive";

      applyRiskProfile(recommended);
      setMode("overview");
    }
  };

  const applyRiskProfile = (key: RiskProfile) => {
    const meta = RISK_PROFILES_META[key];
    updateProfile((p) => ({
      ...p,
      riskProfile: key,
      assumptions: {
        ...p.assumptions,
        investmentReturnRate: meta.expectedReturn,
      },
    }));
  };

  // Inflation reality calculation for a S$500k goal in 25 years
  const targetGoal = 500000;
  const years = 25;
  const generalInflation = (profile.assumptions.generalInflationRate || 3.0);

  const calculateRequiredDCA = (target: number, ratePct: number, yrs: number) => {
    const r = ratePct / 100 / 12;
    const n = yrs * 12;
    if (r <= 0) return Math.round(target / n);
    return Math.round((target * r) / (Math.pow(1 + r, n) - 1));
  };

  const cashPmt = calculateRequiredDCA(targetGoal, 2.0, years);
  const growthPmt = calculateRequiredDCA(targetGoal, 7.5, years);
  const outOfPocketSavingsDelta = cashPmt - growthPmt;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Investment Appetite & Risk Profiler
              </h3>
              <p className="text-[10px] text-slate-500">Discover your ideal portfolio growth rate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-1 text-xs font-bold">
          <button
            onClick={() => {
              setMode("quiz");
              setQuizStep(0);
              setAnswers([]);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "quiz" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            3-Question Diagnostic
          </button>
          <button
            onClick={() => setMode("overview")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "overview" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            All 5 Profiles & Inflation Reality
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INTERACTIVE QUIZ */}
        {/* ========================================================================= */}
        {mode === "quiz" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {quizStep + 1} of {quizQuestions.length}</span>
              <span className="text-indigo-600 font-bold">Step {quizStep + 1}/3</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {quizQuestions[quizStep].question}
            </h4>

            <div className="space-y-2">
              {quizQuestions[quizStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(opt.score)}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs text-slate-800 dark:text-slate-200 font-medium transition-all flex items-center justify-between gap-2"
                >
                  <span className="leading-relaxed">{opt.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: OVERVIEW & INFLATION REALITY WARNING */}
        {/* ========================================================================= */}
        {mode === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* The Inflation Trap Warning Card */}
            <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 rounded-2xl border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-amber-500 flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-4 h-4" /> The "Too Risk-Averse" Reality Check
                </span>
                <span className="text-[10px] text-slate-400">Inflation: {generalInflation}% p.a.</span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                If you keep 100% of your long-term money in cash (2.0% return), inflation ({generalInflation}%) will steadily erode your purchasing power. To build a <strong>{formatCurrency(targetGoal, currency)}</strong> retirement nest egg in 25 years:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-rose-400 block">In Cash (2.0% return)</span>
                  <span className="text-xs font-black text-rose-400 mt-0.5 block">
                    {formatCurrency(cashPmt, currency)} / month
                  </span>
                  <span className="text-[9px] text-slate-400">Must save from salary</span>
                </div>

                <div className="p-2 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block">In Growth (7.5% return)</span>
                  <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                    {formatCurrency(growthPmt, currency)} / month
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    Saves you {formatCurrency(outOfPocketSavingsDelta, currency)}/mo!
                  </span>
                </div>
              </div>
            </div>

            {/* List of 5 Profiles */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Select Your Risk Profile:
              </span>

              {(Object.keys(RISK_PROFILES_META) as RiskProfile[]).map((key) => {
                const meta = RISK_PROFILES_META[key];
                const isSelected = currentRisk === key;

                return (
                  <div
                    key={key}
                    onClick={() => applyRiskProfile(key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {meta.title}
                        </span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {meta.expectedReturn}% p.a.
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {meta.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span><strong>Mix:</strong> {meta.assetAllocation}</span>
                      <span className="font-semibold text-slate-400">{meta.drawdownExpectation}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Apply Profile & Update All Goal Forecasts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
