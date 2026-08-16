"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { InvestmentTrajectoryPoint, AssetItem } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Sparkles, Plus, Wallet } from "lucide-react";

interface InvestmentGrowthChartProps {
  trajectory: InvestmentTrajectoryPoint[];
  assets: AssetItem[];
  insurancePolicies?: { id: string; policyName: string; policyType: string; currentCashValue?: number; projectedRetirementMaturityValue?: number; annualPremium?: number }[];
  currency: string;
  retirementAge: number;
}

export const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({
  trajectory,
  assets,
  insurancePolicies = [],
  currency,
  retirementAge,
}) => {
  const dcaAssets = assets.filter((a) => (Number(a.monthlyContribution) || 0) > 0 || (Number(a.currentValue) || 0) > 0);
  const cashPolicies = insurancePolicies.filter((p) => (Number(p.currentCashValue) || 0) > 0 || (Number(p.projectedRetirementMaturityValue) || 0) > 0);
  const totalMonthlyDCA = assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);

  const finalPoint = trajectory[trajectory.length - 1];

  return (
    <div className="space-y-4">
      {/* Top Highlight Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900">
          <span className="text-[10px] uppercase font-bold text-indigo-500 block">Monthly DCA Auto-Invest</span>
          <span className="text-sm sm:text-base font-extrabold text-indigo-700 dark:text-indigo-300 mt-0.5 block">
            {formatCurrency(totalMonthlyDCA, currency)}/mo
          </span>
          <span className="text-[10px] text-indigo-500/80">Across {dcaAssets.length} account(s)</span>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Future Pot at Age {retirementAge}</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 block">
            {finalPoint ? formatCurrency(finalPoint.projectedValue, currency) : "$0"}
          </span>
          <span className="text-[10px] text-emerald-600/80">
            +{finalPoint ? formatCurrency(finalPoint.totalCompoundedGains, currency) : "$0"} gains
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Total Capital In</span>
          <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {finalPoint ? formatCurrency(finalPoint.totalInvestedPrincipal, currency) : "$0"}
          </span>
          <span className="text-[10px] text-slate-400">Cash you personally put in</span>
        </div>
      </div>

      {/* Interactive Growth Trajectory Area Chart */}
      <div className="fin-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Compounding Growth Curve
            </h4>
            <p className="text-[10px] text-slate-400">Projected value vs. what you contributed</p>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Capital In
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Compounded Pot
            </span>
          </div>
        </div>

        <div className="w-full h-52 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="clientAge"
                tickFormatter={(age) => `Age ${age}`}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as InvestmentTrajectoryPoint;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-indigo-300">
                          Age {data.clientAge} ({data.calendarYear})
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                          <span>Projected Pot:</span>
                          <span>{formatCurrency(data.projectedValue, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Total Invested:</span>
                          <span>{formatCurrency(data.totalInvestedPrincipal, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-indigo-300 pt-1 border-t border-slate-800 font-semibold">
                          <span>Compounded Gains:</span>
                          <span>+{formatCurrency(data.totalCompoundedGains, currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedValue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#growthGradient)"
                name="Projected Value"
              />
              <Area
                type="monotone"
                dataKey="totalInvestedPrincipal"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#principalGradient)"
                name="Total Capital"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Investment & Robo-Advisor Breakdown */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Active DCA Accounts & Portfolios
        </h4>

        {dcaAssets.map((asset) => {
          const dca = Number(asset.monthlyContribution) || 0;
          const currentVal = Number(asset.currentValue) || 0;
          const rate = Number(asset.expectedReturnRate) || 6.0;

          return (
            <div
              key={asset.id}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {asset.description}
                  </span>
                  {asset.platformOrVehicle && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-semibold truncate">
                      {asset.platformOrVehicle}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Current: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(currentVal, currency)}</strong> • Return: <strong>{rate}% p.a.</strong>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                  +{formatCurrency(dca, currency)}/mo
                </span>
                <span className="text-[10px] text-slate-400">Monthly DCA</span>
              </div>
            </div>
          );
        })}

        {/* Whole Life / Endowment Cash Value Policies */}
        {cashPolicies.map((pol) => {
          const cVal = Number(pol.currentCashValue) || 0;
          const matVal = Number(pol.projectedRetirementMaturityValue) || 0;

          return (
            <div
              key={pol.id}
              className="p-3 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl border border-cyan-200 dark:border-cyan-900 flex items-center justify-between gap-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {pol.policyName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900 text-[10px] text-cyan-700 dark:text-cyan-300 font-bold uppercase truncate">
                    {pol.policyType === "whole_life" ? "Whole Life" : pol.policyType === "endowment" ? "Endowment" : "ILP"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Current Cash Value: <strong className="text-cyan-700 dark:text-cyan-300">{formatCurrency(cVal, currency)}</strong>
                </div>
              </div>

              <div className="text-right shrink-0">
                {matVal > 0 ? (
                  <>
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 block">
                      {formatCurrency(matVal, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">At Retirement</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 block">
                      {formatCurrency(cVal, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">Cash Value</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
