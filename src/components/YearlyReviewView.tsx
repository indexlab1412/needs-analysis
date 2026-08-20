"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { YearlySnapshot } from "@/lib/fna/types";
import { formatCurrency, generateId } from "@/lib/utils";
import {
  Calendar,
  Camera,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export const YearlyReviewView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { netWorth, cashFlow, overallFinancialHealthScore } = summary;

  const snapshots = (profile.yearlySnapshots || []).sort((a, b) => a.year - b.year);
  const currentYear = new Date().getFullYear();

  const [milestoneInput, setMilestoneInput] = useState<string>("");
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);

  // Capture or Update Snapshot for Current Year
  const handleCaptureSnapshot = () => {
    const totalInvestments = profile.assets
      .filter((a) => a.category !== "cash_savings" && a.category !== "fixed_deposit")
      .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0) +
      profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.currentCashValue) || 0), 0);

    const newSnapshot: YearlySnapshot = {
      id: generateId(`snap-${currentYear}`),
      year: currentYear,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalNetWorth: netWorth.netWorth,
      totalLiquidSavings: netWorth.liquidAssets,
      totalInvestments: totalInvestments,
      totalLiabilities: netWorth.totalLiabilities,
      annualIncome: cashFlow.totalMonthlyIncome * 12,
      annualSavingsRate: cashFlow.savingsRatePercentage,
      financialHealthScore: overallFinancialHealthScore,
      keyMilestoneAchieved: milestoneInput || "Updated yearly financial check-in & progress review.",
    };

    updateProfile((p) => {
      const existing = (p.yearlySnapshots || []).filter((s) => s.year !== currentYear);
      return {
        ...p,
        yearlySnapshots: [...existing, newSnapshot],
      };
    });

    setShowCaptureModal(false);
    setMilestoneInput("");
  };

  const removeSnapshot = (id: string) => {
    updateProfile((p) => ({
      ...p,
      yearlySnapshots: (p.yearlySnapshots || []).filter((s) => s.id !== id),
    }));
  };

  // Year-over-Year (YoY) Comparison
  const latestSnapshot = snapshots[snapshots.length - 1];
  const previousSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;

  let netWorthDelta = 0;
  let netWorthDeltaPct = 0;
  let investmentDelta = 0;
  let savingsDelta = 0;
  let debtDelta = 0;
  let scoreDelta = 0;

  if (latestSnapshot && previousSnapshot) {
    netWorthDelta = latestSnapshot.totalNetWorth - previousSnapshot.totalNetWorth;
    netWorthDeltaPct = previousSnapshot.totalNetWorth !== 0
      ? Math.round((netWorthDelta / Math.abs(previousSnapshot.totalNetWorth)) * 100)
      : 100;
    investmentDelta = latestSnapshot.totalInvestments - previousSnapshot.totalInvestments;
    savingsDelta = latestSnapshot.totalLiquidSavings - previousSnapshot.totalLiquidSavings;
    debtDelta = latestSnapshot.totalLiabilities - previousSnapshot.totalLiabilities;
    scoreDelta = latestSnapshot.financialHealthScore - previousSnapshot.financialHealthScore;
  }

  const getAnnualVerdict = () => {
    if (!previousSnapshot || !latestSnapshot) {
      return {
        title: "Initial Baseline Year Captured",
        desc: "You have recorded your first financial snapshot! Track next year to see your compound growth and debt reduction progress.",
        status: "good",
      };
    }
    if (netWorthDelta > 0 && debtDelta <= 0 && scoreDelta >= 0) {
      return {
        title: "🌟 Outstanding Year of Financial Growth!",
        desc: `You increased your net worth by ${formatCurrency(netWorthDelta, currency)} (${netWorthDeltaPct > 0 ? `+${netWorthDeltaPct}%` : ""}), while cutting down your debts and boosting your financial fitness score by +${scoreDelta} points!`,
        status: "excellent",
      };
    }
    if (netWorthDelta > 0) {
      return {
        title: "🚀 Solid Positive Progress Year!",
        desc: `Your wealth expanded by ${formatCurrency(netWorthDelta, currency)} year-over-year. Consistency in your monthly saving & DCA habits is paying off!`,
        status: "good",
      };
    }
    return {
      title: "🛡️ Consolidation / Transition Year",
      desc: "Net worth remained steady or adjusted as you managed life transitions. Focus on reinforcing your emergency stash and sticking to monthly DCA.",
      status: "neutral",
    };
  };

  const verdict = getAnnualVerdict();

  // Chart data formatting
  const chartData = snapshots.map((s) => ({
    year: `Year ${s.year}`,
    "Net Worth": s.totalNetWorth,
    Investments: s.totalInvestments,
    "Cash Savings": s.totalLiquidSavings,
    Debts: s.totalLiabilities,
  }));

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Annual Financial Check-In & YoY Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Capture your yearly financial balance sheet and track how much your savings, investments, and net worth level up over time.
            </p>
          </div>
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Capture</span> {currentYear}
          </button>
        </div>
      </div>

      {/* Annual Verdict Banner */}
      {latestSnapshot && (
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 text-slate-900 dark:text-white rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> {latestSnapshot.year} Annual Outcome
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full text-indigo-700 dark:text-indigo-300 font-bold">
              Score: {latestSnapshot.financialHealthScore}/100
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{verdict.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{verdict.desc}</p>
          </div>

          {/* YoY Delta Highlight Chips */}
          {previousSnapshot && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Net Worth YoY</span>
                <span
                  className={`text-xs font-black flex items-center gap-0.5 mt-0.5 ${
                    netWorthDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {netWorthDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatCurrency(netWorthDelta, currency)}
                </span>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Investments</span>
                <span
                  className={`text-xs font-black flex items-center gap-0.5 mt-0.5 ${
                    investmentDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {investmentDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatCurrency(investmentDelta, currency)}
                </span>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Cash Savings</span>
                <span
                  className={`text-xs font-black flex items-center gap-0.5 mt-0.5 ${
                    savingsDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {savingsDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatCurrency(savingsDelta, currency)}
                </span>
              </div>

              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Debts Paid</span>
                <span
                  className={`text-xs font-black flex items-center gap-0.5 mt-0.5 ${
                    debtDelta <= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {debtDelta <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {formatCurrency(Math.abs(debtDelta), currency)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Year Progression Chart */}
      {snapshots.length > 0 && (
        <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Multi-Year Growth Progression
          </h3>

          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                          <div className="font-bold text-indigo-300">{label}</div>
                          {payload.map((p, i) => (
                            <div key={i} className="flex justify-between gap-4" style={{ color: p.color }}>
                              <span>{p.name}:</span>
                              <span className="font-bold">{formatCurrency(Number(p.value), currency)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                <Bar dataKey="Net Worth" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Investments" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cash Savings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Debts" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Snapshot History Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Recorded Annual Snapshots
        </h3>

        {snapshots.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No snapshots recorded yet. Click "Capture {currentYear}" above to record your first annual baseline!
          </div>
        ) : (
          snapshots.slice().reverse().map((snap) => (
            <div
              key={snap.id}
              className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-amber-500 rounded-2xl space-y-3 hover:shadow-md hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Year {snap.year} Snapshot
                  </span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                    Score: {snap.financialHealthScore}/100
                  </span>
                </div>
                <button
                  onClick={() => removeSnapshot(snap.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Delete snapshot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Net Worth</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                    {formatCurrency(snap.totalNetWorth, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Investments</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {formatCurrency(snap.totalInvestments, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Cash Stash</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {formatCurrency(snap.totalLiquidSavings, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Debts</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                    {formatCurrency(snap.totalLiabilities, currency)}
                  </span>
                </div>
              </div>

              {/* Milestone Achieved */}
              {snap.keyMilestoneAchieved && (
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                  <strong className="text-indigo-900 dark:text-indigo-300">🏆 Milestone:</strong>{" "}
                  {snap.keyMilestoneAchieved}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Snapshot Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" />
                Capture Year {currentYear} Snapshot
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will save your current live numbers into your historical timeline:
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Net Worth:</span>
                <strong>{formatCurrency(netWorth.netWorth, currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Liquid Cash:</span>
                <strong>{formatCurrency(netWorth.liquidAssets, currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Debts:</span>
                <strong>{formatCurrency(netWorth.totalLiabilities, currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Health Score:</span>
                <strong>{overallFinancialHealthScore}/100</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Key Milestone or Achievement this Year:
              </label>
              <textarea
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                placeholder="e.g. Paid off $5k student loan, started $200/mo DCA in Syfe..."
                rows={2}
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCaptureModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCaptureSnapshot}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
