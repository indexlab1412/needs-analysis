"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { formatCurrency, parseNumberInput } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ListOrdered,
  Layers,
  Clock,
  Zap,
  GraduationCap,
  CreditCard,
  HeartPulse,
  Wallet,
  Sliders,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export interface PriorityItem {
  id: string;
  level: number;
  category: "emergency" | "insurance" | "debt" | "education" | "retirement";
  title: string;
  description: string;
  whyItMatters: string;
  targetCost: number; // either total lump sum or monthly cost
  isMonthlyCost: boolean;
  currentAllocated: number;
  isCompleted: boolean;
  isActiveFocus: boolean;
}

export const PriorityPlannerView: React.FC = () => {
  const { summary, profile, currency, setActiveTab } = useFinancialStore();
  const { netWorth, cashFlow, shortfalls, computedGoals, retirementDetails } = summary;

  const monthlyFreeCashflow = Math.max(0, cashFlow.monthlyNetSavings + cashFlow.totalMonthlyDCAInvestments);
  const [customMonthlyBudget, setCustomMonthlyBudget] = useState<number>(monthlyFreeCashflow || 500);

  // Default Priorities
  const initialPriorities: PriorityItem[] = [
    {
      id: "p1-emergency",
      level: 1,
      category: "emergency",
      title: "1. Liquid Emergency Cash Cushion",
      description: `Build a 6-month cash stash of ${formatCurrency(cashFlow.essentialMonthlyExpenses * 6, currency)} in high-yield bank accounts.`,
      whyItMatters: "Prevents you from taking high-interest credit card loans or panic-selling investments during unexpected retrenchment or family emergencies.",
      targetCost: Math.max(0, (cashFlow.essentialMonthlyExpenses * 6) - netWorth.liquidAssets),
      isMonthlyCost: false,
      currentAllocated: netWorth.liquidAssets,
      isCompleted: netWorth.liquidAssets >= (cashFlow.essentialMonthlyExpenses * 6),
      isActiveFocus: true,
    },
    {
      id: "p2-insurance",
      level: 2,
      category: "insurance",
      title: "2. Catastrophe Protection Shield",
      description: "Secure Hospital Shield Plan + basic 4-year Critical Illness salary replacement.",
      whyItMatters: "A single cancer diagnosis or major medical event can cost $100k+ and wipe out 10 years of savings overnight if uninsured.",
      targetCost: 180, // estimated monthly premium
      isMonthlyCost: true,
      currentAllocated: profile.insurancePolicies.reduce((s, p) => s + Math.round((p.annualPremium || 0) / 12), 0),
      isCompleted: shortfalls
        .filter((s) => s.category === "critical_illness" || s.category === "life_protection")
        .every((s) => s.status === "on_track" || s.status === "surplus"),
      isActiveFocus: true,
    },
    {
      id: "p3-debt",
      level: 3,
      category: "debt",
      title: "3. High-Interest Debt Elimination",
      description: "Clear personal loans, study loans, or credit card balances to stop interest leakage.",
      whyItMatters: "Paying off a 6-10% loan gives a guaranteed, risk-free return on your money equal to that interest rate.",
      targetCost: profile.liabilities
        .filter((l) => l.category !== "mortgage_primary" && l.category !== "mortgage_investment")
        .reduce((s, l) => s + (l.outstandingBalance || 0), 0),
      isMonthlyCost: false,
      currentAllocated: 0,
      isCompleted: profile.liabilities.filter((l) => l.category !== "mortgage_primary" && l.category !== "mortgage_investment").length === 0,
      isActiveFocus: profile.liabilities.filter((l) => l.category !== "mortgage_primary" && l.category !== "mortgage_investment").length > 0,
    },
    {
      id: "p4-education",
      level: 4,
      category: "education",
      title: "4. Child Education & Life Goals",
      description: "Set up auto-DCA sinking funds for children's university or home downpayment.",
      whyItMatters: "Tuition inflates at 5.0% per year. Funding early allows 15+ years of compounding to do 60% of the heavy lifting.",
      targetCost: profile.dependents.filter((d) => d.relationship === "child").length > 0 ? 300 : 0,
      isMonthlyCost: true,
      currentAllocated: 0,
      isCompleted: profile.dependents.filter((d) => d.relationship === "child").length === 0 || false,
      isActiveFocus: profile.dependents.filter((d) => d.relationship === "child").length > 0,
    },
    {
      id: "p5-retirement",
      level: 5,
      category: "retirement",
      title: "5. Wealth Engine & Early Retirement",
      description: `Invest surplus into diversified global index funds to build your ${formatCurrency(retirementDetails.totalNestEggRequired, currency)} nest egg.`,
      whyItMatters: "Achieves financial freedom so you have the choice to work on your own terms and retire comfortably.",
      targetCost: Math.max(100, customMonthlyBudget - 180),
      isMonthlyCost: true,
      currentAllocated: cashFlow.totalMonthlyDCAInvestments,
      isCompleted: false,
      isActiveFocus: true,
    },
  ];

  const [priorities, setPriorities] = useState<PriorityItem[]>(initialPriorities);

  // Toggle active focus
  const togglePriorityFocus = (id: string) => {
    setPriorities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActiveFocus: !item.isActiveFocus } : item))
    );
  };

  // Move priority up or down
  const movePriority = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= priorities.length) return;
    const updated = [...priorities];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPriorities(updated);
  };

  // Calculate Roadmap Timeline
  const activeList = priorities.filter((p) => p.isActiveFocus && !p.isCompleted);
  const emergencyItem = priorities.find((p) => p.id === "p1-emergency");
  const emergencyRemaining = emergencyItem && !emergencyItem.isCompleted ? emergencyItem.targetCost : 0;
  const monthsToEmergencyTarget = customMonthlyBudget > 0 && emergencyRemaining > 0
    ? Math.ceil(emergencyRemaining / customMonthlyBudget)
    : 0;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="fin-card p-4 sm:p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4" /> Smart Budget & Priority Sequencer
          </span>
          <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-200">
            Work on What Matters Most
          </span>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            Can't Plan For Everything at Once? Sequence It!
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            When budget is limited, trying to solve all gaps simultaneously causes stress. Use the 5-Stage Priority Sequencer to channel your monthly savings step-by-step without spreading yourself too thin.
          </p>
        </div>

        {/* Monthly Free Cashflow Budget Slider */}
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Your Available Monthly Free Cashflow:
            </span>
            <span className="text-sm font-black text-emerald-400">
              +{formatCurrency(customMonthlyBudget, currency)} / month
            </span>
          </div>

          <input
            type="range"
            min={100}
            max={Math.max(3000, monthlyFreeCashflow * 2 || 2000)}
            step={50}
            value={customMonthlyBudget}
            onChange={(e) => setCustomMonthlyBudget(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Tight: {currency}100/mo</span>
            <span>Current Inflow: {formatCurrency(monthlyFreeCashflow, currency)}/mo</span>
            <span>Aggressive: {currency}3,000/mo</span>
          </div>
        </div>
      </div>

      {/* Phased Action Roadmap Preview */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Your Tailored 3-Phase Action Roadmap ({formatCurrency(customMonthlyBudget, currency)}/mo)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Phase 1 */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-900 dark:text-amber-200 text-[11px] uppercase">
                Phase 1: Security Shield
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                {monthsToEmergencyTarget > 0 ? `Next ${monthsToEmergencyTarget} Mo` : "Complete ✅"}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              Channel <strong>{formatCurrency(customMonthlyBudget, currency)}/mo</strong> to lock in your 6-Month Emergency Cash Buffer ({formatCurrency(cashFlow.essentialMonthlyExpenses * 6, currency)}).
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-indigo-900 dark:text-indigo-200 text-[11px] uppercase">
                Phase 2: Health & Safety Net
              </span>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                Ongoing ~$150/mo
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              Lock in cost-effective Term Life & Critical Illness coverage to protect against salary loss without overpaying on whole-life plans.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-900 dark:text-emerald-200 text-[11px] uppercase">
                Phase 3: Wealth Compounding
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Long-Term Horizon
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              With emergency & health secured, automate <strong>{formatCurrency(Math.max(100, customMonthlyBudget - 150), currency)}/mo</strong> into global index funds for education & retirement.
            </p>
          </div>
        </div>
      </div>

      {/* Priority Ranker Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Customize Your Focus Areas & Priority Order
            </h3>
            <p className="text-[11px] text-slate-500">
              Toggle items on or off based on what matters to you right now
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {priorities.map((item, idx) => {
            return (
              <div
                key={item.id}
                className={`fin-card p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  item.isCompleted
                    ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75"
                    : item.isActiveFocus
                    ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/80 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fully Funded
                      </span>
                    ) : (
                      <button
                        onClick={() => togglePriorityFocus(item.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          item.isActiveFocus
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {item.isActiveFocus ? "🎯 Active Focus" : "Paused"}
                      </button>
                    )}

                    {/* Move Up/Down */}
                    <div className="flex flex-col gap-0.5 ml-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => movePriority(idx, "up")}
                        className="text-[9px] px-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === priorities.length - 1}
                        onClick={() => movePriority(idx, "down")}
                        className="text-[9px] px-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                {/* Why This Area Matters Box */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-bold block mb-0.5 text-[11px]">
                    💡 Why You Must Plan For This:
                  </strong>
                  <span>{item.whyItMatters}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
