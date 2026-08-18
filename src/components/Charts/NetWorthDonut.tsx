"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={aggregatedData}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const val = Number(data.value) || 0;
                  const pct = Math.round((val / (total || 1)) * 100);
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1 pointer-events-none">
                      <div className="flex items-center gap-1.5 font-bold text-slate-100">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: data.payload?.color || "#64748b" }}
                        />
                        <span className="truncate max-w-[200px]">{data.name}</span>
                      </div>
                      <div className="text-emerald-400 font-extrabold text-sm pl-4">
                        {formatCurrency(val, currency)}
                        <span className="text-[11px] text-slate-300 font-medium ml-1.5">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Assets</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2">
        {aggregatedData.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div className="truncate text-[11px] text-slate-600 dark:text-slate-300">
              {item.name} ({Math.round((item.value / (total || 1)) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
