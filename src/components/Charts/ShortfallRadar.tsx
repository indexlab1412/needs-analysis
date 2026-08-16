"use client";

import React from "react";
import { ShortfallResult } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  HeartPulse,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ShortfallRadarProps {
  shortfalls: ShortfallResult[];
  currency: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORY_ICONS: { [key: string]: any } = {
  emergency_fund: Sparkles,
  life_protection: ShieldAlert,
  critical_illness: HeartPulse,
  retirement: Clock,
  education: GraduationCap,
};

export const ShortfallRadar: React.FC<ShortfallRadarProps> = ({
  shortfalls,
  currency,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-3">
      {shortfalls.map((item) => {
        const Icon = CATEGORY_ICONS[item.category] || ShieldAlert;
        const isDeficit = item.shortfallAmount > 0;
        const progressClamped = Math.min(100, item.coverageRatio);

        const statusBadge = () => {
          switch (item.status) {
            case "critical":
              return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Critical Gap
                </span>
              );
            case "warning":
              return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Partial Coverage
                </span>
              );
            case "on_track":
            case "surplus":
              return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Protected
                </span>
              );
          }
        };

        const getProgressBarColor = () => {
          if (item.coverageRatio >= 100) return "bg-emerald-500";
          if (item.coverageRatio >= 60) return "bg-amber-500";
          return "bg-rose-500";
        };

        return (
          <div
            key={item.category}
            onClick={() => onSelectCategory && onSelectCategory(item.category)}
            className="fin-card fin-card-interactive p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            {/* Top Bar: Icon, Title & Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === "critical"
                      ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                      : item.status === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <div className="shrink-0">{statusBadge()}</div>
            </div>

            {/* Financial Amounts (Required vs Existing vs Shortfall) */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-left">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Required</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {formatCurrency(item.requiredAmount, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Existing</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {formatCurrency(item.existingAmount, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {isDeficit ? "Shortfall" : "Surplus"}
                </div>
                <div
                  className={`text-xs font-extrabold ${
                    isDeficit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isDeficit
                    ? `- ${formatCurrency(item.shortfallAmount, currency)}`
                    : `+ ${formatCurrency(Math.abs(item.existingAmount - item.requiredAmount), currency)}`}
                </div>
              </div>
            </div>

            {/* Coverage Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Coverage Ratio</span>
                <span>{item.coverageRatio}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                  style={{ width: `${progressClamped}%` }}
                />
              </div>
            </div>

            {/* Recommendation Footnote */}
            <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              {item.recommendation}
            </div>
          </div>
        );
      })}
    </div>
  );
};
