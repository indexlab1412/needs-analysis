"use client";

import React from "react";
import { useFinancialStore } from "@/context/financial-store";
import {
  Sparkles,
  ShieldAlert,
  Compass,
  Sliders,
  FolderLock,
  PieChart,
} from "lucide-react";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, summary } = useFinancialStore();

  const criticalShortfallsCount = summary.shortfalls.filter((s) => s.status === "critical").length;

  const tabs = [
    {
      id: "dashboard" as const,
      label: "Snapshot",
      icon: PieChart,
    },
    {
      id: "shortfall" as const,
      label: "Safety Gaps",
      icon: ShieldAlert,
      badge: criticalShortfallsCount > 0 ? criticalShortfallsCount : undefined,
    },
    {
      id: "wizard" as const,
      label: "Setup / Plan",
      icon: Compass,
      highlight: true,
    },
    {
      id: "simulator" as const,
      label: "What-If?",
      icon: Sliders,
    },
    {
      id: "vault" as const,
      label: "My Vault",
      icon: FolderLock,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950"
                      : "bg-slate-900 dark:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${isActive ? "font-bold" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
