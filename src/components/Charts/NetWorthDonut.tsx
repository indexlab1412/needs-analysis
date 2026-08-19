"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetWorthDonutProps {
  assets: { category: string; description: string; currentValue: number }[];
  insurancePolicies?: { policyName: string; currentCashValue?: number; policyType?: string }[];
  currency: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  cash_savings: "#10b981", // Emerald
  fixed_deposit: "#059669",
  stocks_funds: "#3b82f6", // Blue
  cpf_epf_pension: "#8b5cf6", // Purple
  property_primary: "#f59e0b", // Amber
  property_investment: "#d97706",
  insurance_cash_value: "#06b6d4", // Cyan
  business: "#6366f1",
  crypto: "#ec4899",
  other: "#94a3b8",
};

const CATEGORY_LABELS: { [key: string]: string } = {
  cash_savings: "Cash & Savings",
  fixed_deposit: "Fixed Deposits",
  stocks_funds: "Investments / Equities",
  cpf_epf_pension: "Retirement / Pension / CPF",
  property_primary: "Primary Property",
  property_investment: "Investment Property",
  insurance_cash_value: "Whole Life / Endowment Cash Value",
  business: "Business Assets",
  crypto: "Digital Assets",
  other: "Other Assets",
};

export const NetWorthDonut: React.FC<NetWorthDonutProps> = ({ assets, insurancePolicies, currency }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Aggregate by category
  const aggregatedData = React.useMemo(() => {
    const map: { [key: string]: number } = {};
    assets.forEach((a) => {
      const val = Number(a.currentValue) || 0;
      map[a.category] = (map[a.category] || 0) + val;
    });

    (insurancePolicies || []).forEach((p) => {
      const cVal = Number(p.currentCashValue) || 0;
      if (cVal > 0) {
        map["insurance_cash_value"] = (map["insurance_cash_value"] || 0) + cVal;
      }
    });

    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat] || cat,
        value: val,
        category: cat,
        color: CATEGORY_COLORS[cat] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets, insurancePolicies]);

  const total = aggregatedData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400">
        No asset data entered yet
      </div>
    );
  }

  const activeItem = activeIndex !== null && aggregatedData[activeIndex] ? aggregatedData[activeIndex] : null;

  return (
    <div className="space-y-3">
      {/* Donut Chart Container */}
      <div className="w-full h-52 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={aggregatedData}
              innerRadius={60}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
              cursor="pointer"
            >
              {aggregatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? "#ffffff" : "transparent"}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  className="transition-all duration-200"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Stable Center Total Readout (Never blocked by words) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block">
            Total Assets
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(total, currency)}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            100% Portfolio
          </span>
        </div>
      </div>

      {/* Active Slice Inspector Banner */}
      {activeItem ? (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1 duration-150 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: activeItem.color }} />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                {activeItem.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {Math.round((activeItem.value / (total || 1)) * 100)}% of total assets
              </span>
            </div>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white shrink-0 pl-2">
            {formatCurrency(activeItem.value, currency)}
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
          Tap or hover any slice to view breakdown details
        </div>
      )}

      {/* Interactive Category List with Proportional Progress Bars */}
      <div className="space-y-1.5 pt-1">
        {aggregatedData.map((item, idx) => {
          const pct = Math.round((item.value / (total || 1)) * 100);
          const isSelected = activeIndex === idx;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveIndex(isSelected ? null : idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`w-full p-2 rounded-xl text-left transition-all flex flex-col gap-1 cursor-pointer ${
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800 shadow-sm ring-1 ring-slate-300 dark:ring-slate-600"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between text-xs min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                    {formatCurrency(item.value, currency)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 min-w-[28px] text-right">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
