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
  ArrowRight,
  CheckCircle2,
  X,
  Compass,
  Info,
  Layers,
} from "lucide-react";

export const RISK_PROFILES_META: Record<
  RiskProfile,
  {
    title: string;
    expectedReturn: number;
    description: string;
    assetAllocation: string;
    volatility: string;
  }
> = {
  conservative: {
    title: "1. Conservative",
    expectedReturn: 3.5,
    description: "Capital preservation focused with very low fluctuation. Mainly cash, fixed deposits, and high-grade government bonds.",
    assetAllocation: "80% Fixed Income / 20% Equities",
    volatility: "Very Low",
  },
  moderate: {
    title: "2. Moderate",
    expectedReturn: 5.0,
    description: "Steady modest gains with gentle fluctuations. Balanced between bonds and dividend-paying blue-chip funds.",
    assetAllocation: "60% Fixed Income / 40% Equities",
    volatility: "Low to Moderate",
  },
  balanced: {
    title: "3. Balanced",
    expectedReturn: 6.5,
    description: "Optimal long-term growth engine. Reinvests dividends into global index funds and absorbs market cycles.",
    assetAllocation: "40% Fixed Income / 60% Equities",
    volatility: "Moderate",
  },
  growth: {
    title: "4. Growth",
    expectedReturn: 7.5,
    description: "High wealth compounding focus. Heavily invested in diversified global equities (e.g. S&P 500, MSCI World).",
    assetAllocation: "20% Fixed Income / 80% Equities",
    volatility: "Moderate to High",
  },
  aggressive: {
    title: "5. Aggressive / High Growth",
    expectedReturn: 9.0,
    description: "Maximum long-term wealth acceleration. Tolerates significant temporary volatility for highest potential compounding.",
    assetAllocation: "100% Equities / Growth Thematics",
    volatility: "High",
  },
};

interface RiskProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskProfilerModal: React.FC<RiskProfilerModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, currency } = useFinancialStore();
  const currentRisk = profile.riskProfile || "balanced";

  // Default mode is direct profile selection; quiz is available for unsure users
  const [mode, setMode] = useState<"overview" | "quiz">("overview");

  // 3-Question Diagnostic State
  const [quizStep, setQuizStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);

  if (!isOpen) return null;

  const quizQuestions = [
    {
      question: "If your investment portfolio dropped by 20% during a market crash, what would you do?",
      options: [
        { label: "Panic and sell everything to prevent further losses (Keep in cash)", score: 1 },
        { label: "Feel anxious and pause new contributions until market recovers", score: 2 },
        { label: "Do nothing and stick to my long-term auto-DCA plan", score: 3 },
        { label: "Excited! Buy more shares at a discount (Fire sale)", score: 4 },
      ],
    },
    {
      question: "How long do you intend to leave your retirement money invested before withdrawing?",
      options: [
        { label: "Less than 5 years (I need this money soon)", score: 1 },
        { label: "5 to 10 years (Medium horizon)", score: 2 },
        { label: "10 to 20 years (Long term)", score: 3 },
        { label: "More than 20 years (Retirement is far away)", score: 4 },
      ],
    },
    {
      question: "Which scenario best aligns with your financial mindset?",
      options: [
        { label: "Capital preservation is #1. I hate seeing negative numbers.", score: 1 },
        { label: "I want steady modest gains with low fluctuation.", score: 2 },
        { label: "I accept temporary dips in exchange for beating inflation over time.", score: 3 },
        { label: "Maximum wealth growth. I can tolerate high volatility for high returns.", score: 4 },
      ],
    },
  ];

  const handleSelectAnswer = (score: number) => {
    const updated = [...answers, score];
    setAnswers(updated);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate recommended risk profile
      const totalScore = updated.reduce((a, b) => a + b, 0);
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
  const generalInflation = profile.assumptions.generalInflationRate || 3.0;

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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Investment Appetite & Risk Profiler
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Choose your profile directly or take the 1-min diagnostic
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-1 text-xs font-bold">
          <button
            onClick={() => setMode("overview")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "overview"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            1. Select Profile Directly
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              setQuizStep(0);
              setAnswers([]);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              mode === "quiz"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Unsure? 1-Min Quiz</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DIRECT PROFILE SELECTION & HIGH-CONTRAST INFLATION REALITY */}
        {/* ========================================================================= */}
        {mode === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Direct Profiles Selector List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  Select Your Investment Profile:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("quiz");
                    setQuizStep(0);
                    setAnswers([]);
                  }}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" />
                  <span>Not sure? Take 1-Min Quiz</span>
                </button>
              </div>

              <div className="space-y-2">
                {(Object.keys(RISK_PROFILES_META) as RiskProfile[]).map((key) => {
                  const meta = RISK_PROFILES_META[key];
                  const isSelected = currentRisk === key;

                  return (
                    <div
                      key={key}
                      onClick={() => applyRiskProfile(key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
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
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {meta.expectedReturn}% p.a.
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {meta.description}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span><strong>Asset Allocation:</strong> {meta.assetAllocation}</span>
                        <span><strong>Vol:</strong> {meta.volatility}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HIGH-CONTRAST INFLATION REALITY CHECK */}
            <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-amber-500/40 text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  The "Too Risk-Averse" Reality Check
                </span>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  Inflation: {generalInflation}% p.a.
                </span>
              </div>

              <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                If you keep 100% of your long-term money in cash (2.0% return), inflation ({generalInflation}%) steadily erodes your purchasing power. To build a <strong>{formatCurrency(targetGoal, currency)}</strong> retirement nest egg in 25 years:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                    In Cash (2.0% return)
                  </span>
                  <span className="text-sm font-black text-rose-700 dark:text-rose-400 mt-1 block">
                    {formatCurrency(cashPmt, currency)} / mo
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Must save entirely from salary
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                    In Growth (7.5% return)
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                    {formatCurrency(growthPmt, currency)} / mo
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-0.5 block">
                    Saves you {formatCurrency(outOfPocketSavingsDelta, currency)}/mo!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INTERACTIVE 1-MIN DIAGNOSTIC QUIZ */}
        {/* ========================================================================= */}
        {mode === "quiz" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {quizStep + 1} of {quizQuestions.length}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Step {quizStep + 1}/3</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {quizQuestions[quizStep].question}
            </h4>

            <div className="space-y-2">
              {quizQuestions[quizStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(opt.score)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs text-slate-800 dark:text-slate-200 font-medium transition-all flex items-center justify-between gap-2"
                >
                  <span className="leading-relaxed">{opt.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
