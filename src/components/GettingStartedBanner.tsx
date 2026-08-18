"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { SAMPLE_PROFILES } from "@/lib/fna/sample-data";
import {
  Sparkles,
  Zap,
  Wand2,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

export const GettingStartedBanner: React.FC = () => {
  const {
    profile,
    isSamplePreset,
    goToWizardStep,
    setIsQuickCheckinOpen,
    loadPreset,
    resetProfile,
    isWelcomeGuideDismissed,
    setWelcomeGuideDismissed,
  } = useFinancialStore();

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // If permanently dismissed by user, don't show the large card
  if (isWelcomeGuideDismissed) {
    return null;
  }

  return (
    <div className="fin-card bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-indigo-500/30 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  New here? Start Your Money Plan
                </h2>
                {isSamplePreset && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sample Demo Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                Currently previewing example numbers for <strong>{profile.name}</strong>. Customize it with your own data:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 transition-colors"
              title={isMinimized ? "Expand guide" : "Minimize guide"}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setWelcomeGuideDismissed(true)}
              className="p-1 rounded-lg bg-white/10 hover:bg-rose-500/30 text-indigo-200 hover:text-white transition-colors"
              title="Dismiss guide (can be reopened from top bar)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* 3 Main Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Action 1: Full Guided Setup (Wizard) */}
              <button
                onClick={() => goToWizardStep(1)}
                className="p-3 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white rounded-2xl text-left border-2 border-indigo-400 dark:border-indigo-500 shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                      <Wand2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                      Step 1 of 5
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    🪄 5-Step Guided Setup
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    Enter your baseline income, bills, bank savings, loans, insurance & dream goals.
                  </p>
                </div>
                <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Start setup wizard <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Action 2: 1-Click Monthly Check-In */}
              <button
                onClick={() => setIsQuickCheckinOpen(true)}
                className="p-3 bg-amber-500/15 hover:bg-amber-500/25 text-white rounded-2xl text-left border border-amber-400/40 shadow-sm transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      ⚡ 30-Sec Pulse
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-amber-200">
                    ⚡ 1-Click Monthly Check-In
                  </h3>
                  <p className="text-[10px] text-indigo-200 mt-1 leading-snug">
                    Quickly update this month&apos;s paycheck, living bills, and auto-DCA investments.
                  </p>
                </div>
                <div className="text-[10px] font-extrabold text-amber-300 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open quick update <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Action 3: Preset Templates or Start Fresh */}
              <div className="relative">
                <button
                  onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                  className="w-full h-full p-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-left border border-white/15 shadow-sm transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-6 h-6 rounded-lg bg-white/20 text-indigo-200 flex items-center justify-center font-black">
                        <Users className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200">
                        Presets
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-white">
                      👥 Pick Stage or Start Clean
                    </h3>
                    <p className="text-[10px] text-indigo-200 mt-1 leading-snug">
                      Load a Fresh Grad, Young Family with Mortgage, or start with a 100% blank slate.
                    </p>
                  </div>
                  <div className="text-[10px] font-extrabold text-indigo-300 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Choose persona <ChevronDown className="w-3 h-3" />
                  </div>
                </button>

                {/* Dropdown Menu for Templates */}
                {isTemplateMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase px-2 py-1">
                      Choose Starting Template
                    </div>
                    <div className="space-y-1 mt-1">
                      {Object.entries(SAMPLE_PROFILES).map(([key, item]) => (
                        <button
                          key={key}
                          onClick={() => {
                            loadPreset(key);
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          resetProfile();
                          setIsTemplateMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Start Clean (Blank Profile)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3-Step Lifecycle Roadmap Infographic */}
            <div className="p-3 bg-black/25 backdrop-blur-sm rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-indigo-100">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block text-[11px]">Initial Baseline Input</strong>
                  <span className="text-[10px] text-indigo-200 leading-tight">
                    Click Guided Setup to enter your actual salary, bills &amp; assets.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block text-[11px]">Instant Gap Analysis</strong>
                  <span className="text-[10px] text-indigo-200 leading-tight">
                    Review radar shortfalls, 3-bucket goals, and net worth trajectory.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-amber-300 block text-[11px]">Regular 1-Click Updates</strong>
                  <span className="text-[10px] text-indigo-200 leading-tight">
                    Use 1-Click Monthly Check-In each month to keep numbers fresh.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
