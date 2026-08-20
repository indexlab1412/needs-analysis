"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  Sun,
  Zap,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  Sliders,
  Users,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useFinancialStore } from "@/context/financial-store";

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = "overview" | "protection" | "retirement" | "cadence" | "privacy";

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>("overview");
  const { goToWizardStep, setActiveTab: setStoreTab, setIsQuickCheckinOpen } = useFinancialStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl text-slate-900 dark:text-white flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                How to Use This Platform
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visual & written walkthrough of all core features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Horizontal Pill Tabs */}
        <div className="px-3 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Quick Start</span>
            </button>

            <button
              onClick={() => setActiveTab("protection")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "protection"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>2. Illness Shield</span>
            </button>

            <button
              onClick={() => setActiveTab("retirement")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "retirement"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>3. Retirement Weather</span>
            </button>

            <button
              onClick={() => setActiveTab("cadence")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "cadence"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>4. Monthly Habit</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "privacy"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>5. Privacy & Sync</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          {/* TAB 1: QUICK START */}
          {activeTab === "overview" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <h3 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Your 3-Step Journey to Financial Clarity
                </h3>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                  This platform gives you the same comprehensive financial health checkup that a fee-only wealth planner provides, without the high fees or aggressive product sales.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 dark:text-white font-bold">Input Your Baseline (5 Minutes)</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Use the <strong>5-Step Setup Wizard</strong> or pick a life-stage persona (Fresh Grad, Mid-Career, Family) to load baseline numbers for income, expenses, debts, and insurance.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 dark:text-white font-bold">Discover Your Safety Net & Gaps</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Check the <strong>Protection Tab</strong> to view your 3-tier Illness Shield and the <strong>Priorities Tab</strong> to solve shortfalls in logical sequence without financial stress.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 dark:text-white font-bold">Stress-Test & Keep Numbers Fresh</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Run 1,000 market simulations in the <strong>Simulator Tab</strong> and do a 30-second check-in every month to log your actual net worth growth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    goToWizardStep(1);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Start Guided Setup Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROTECTION & ILLNESS SHIELD */}
          {activeTab === "protection" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <h3 className="font-extrabold text-xs text-rose-900 dark:text-rose-200 mb-1 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Why Traditional Insurance Math Confuses People
                </h3>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-300">
                  Most people buy insurance randomly without knowing what they actually need. The <strong>Illness & Income Shield</strong> breaks protection into 3 easy real-life buckets:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🩹</span>
                    <strong className="text-slate-900 dark:text-white font-bold">1.5-Year Recovery Time-Off (Early Illness)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    If diagnosed with an early condition (e.g. Stage 1 Cancer), this gives you 18 months of gross income to take time off work to rest without worrying about bills.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏥</span>
                    <strong className="text-slate-900 dark:text-white font-bold">5-Year Family Safety Net (Major Illness)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    For severe conditions requiring prolonged treatment, this funds 5 full years of household expenses + a \$50,000 caregiver buffer so your family never has to liquidate investments.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💼</span>
                    <strong className="text-slate-900 dark:text-white font-bold">Monthly Paycheck Shield (Disability)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Replaces 75% of your salary every month if an accident or disability prevents you from working until your target retirement age.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    setStoreTab("shortfall");
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>View Your Protection Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RETIREMENT WEATHER */}
          {activeTab === "retirement" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <h3 className="font-extrabold text-xs text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Weather Forecast vs. Straight-Line Math
                </h3>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300">
                  Real life markets don't return 6% every single year in a straight line. If the stock market crashes right when you retire, a fixed plan will fail.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">1,000 Simulated Market Lifetimes</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    The simulator runs your exact retirement plan through 1,000 volatile market scenarios (good times, dot-com crashes, 2008 recessions, and inflation spikes) to give you a true <strong>Resilience Score (%)</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">One-Tap Quick Fix Sliders</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    See instantly how adding <strong>+\$150/month</strong>, working <strong>1 year longer</strong>, or relying on guaranteed state pensions (CPF LIFE) turns a 🌧️ Rainy score into a ☀️ Sunny bulletproof plan.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    setStoreTab("simulator");
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>Open Weather Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MONTHLY HABIT */}
          {activeTab === "cadence" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <h3 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Keep Plans Alive in 30 Seconds a Month
                </h3>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300">
                  Most people abandon financial spreadsheets because they take too long to update.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">1-Click Monthly Pulse Check-In</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    At the end of each month, open the 30-sec check-in modal. Confirm your paycheck, monthly expenses, and dollar-cost averaging investments to lock in your progress log.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">Solo vs. Couple Mode</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Switch to <strong>Couple Mode</strong> in the top bar to model combined household expenses, partner income, and joint debt coverage effortlessly.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    setIsQuickCheckinOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>Try 30-Sec Check-In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & SECURITY */}
          {activeTab === "privacy" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  100% Client-Side Privacy & Zero Trackers
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Your financial data belongs exclusively to you. Here is how your privacy is protected:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <strong className="text-slate-900 dark:text-white font-bold">Local-First Storage</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All numbers, goals, and logs are saved inside your device browser's private local storage. No unencrypted data is ever sent to third parties.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <strong className="text-slate-900 dark:text-white font-bold">End-to-End Encrypted Cloud Sync</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    When pairing devices via QR code, payloads are encrypted with AES-GCM-256 + PBKDF2 using your secret PIN before transmission. Even the server cannot read your financial numbers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            Financial Needs Analysis v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
