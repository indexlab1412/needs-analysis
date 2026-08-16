"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { LoanRundownPoint, LiabilityItem } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import { Building2, CalendarCheck, Percent, ArrowDownRight } from "lucide-react";

interface LoanRundownChartProps {
  trajectory: LoanRundownPoint[];
  liabilities: LiabilityItem[];
  currency: string;
  totalLifetimeInterest: number;
}

export const LoanRundownChart: React.FC<LoanRundownChartProps> = ({
  trajectory,
  liabilities,
  currency,
  totalLifetimeInterest,
}) => {
  const totalBalance = liabilities.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);
  const totalMonthlyRepayment = liabilities.reduce((sum, l) => sum + (Number(l.monthlyRepayment) || 0), 0);

  const payoffPoint = trajectory.find((p) => p.remainingBalance === 0) || trajectory[trajectory.length - 1];
  const yearsToFreedom = payoffPoint ? payoffPoint.yearIndex : 0;
  const debtFreeAge = payoffPoint ? payoffPoint.clientAge : 0;

  if (totalBalance <= 0) {
    return (
      <div className="p-6 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900">
        <span className="text-2xl">🎉</span>
        <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-1">
          Zero Outstanding Debts
        </h4>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
          You are 100% debt-free! Every dollar of your savings goes towards your future freedom.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Loan Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">Total Outstanding Debt</span>
          <span className="text-sm sm:text-base font-extrabold text-rose-700 dark:text-rose-300 mt-0.5 block">
            {formatCurrency(totalBalance, currency)}
          </span>
          <span className="text-[10px] text-rose-500/80">{liabilities.length} active loan(s)</span>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Debt-Free Milestone</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 block">
            Age {debtFreeAge}
          </span>
          <span className="text-[10px] text-emerald-600/80">In ~{yearsToFreedom} years</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Lifetime Interest</span>
          <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {formatCurrency(totalLifetimeInterest, currency)}
          </span>
          <span className="text-[10px] text-slate-400">Total borrowing cost</span>
        </div>
      </div>

      {/* Loan Rundown Chart */}
      <div className="fin-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" /> Loan Payoff & Amortization Run-Down
            </h4>
            <p className="text-[10px] text-slate-400">Balance reducing over time as monthly repayments are made</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Balance Left
          </div>
        </div>

        <div className="w-full h-52 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    const data = payload[0].payload as LoanRundownPoint;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-rose-300">Age {data.clientAge} (Year {data.yearIndex})</div>
                        <div className="flex justify-between gap-4 text-rose-400 font-bold">
                          <span>Remaining Debt:</span>
                          <span>{formatCurrency(data.remainingBalance, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-300">
                          <span>Principal Paid:</span>
                          <span>{formatCurrency(data.principalPaidToDate, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Interest Paid:</span>
                          <span>{formatCurrency(data.interestPaidToDate, currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="remainingBalance"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#e11d48" }}
                activeDot={{ r: 6 }}
                name="Remaining Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Loan List with Interest % and Monthly Payment */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Your Loans & Mortgages
        </h4>

        {liabilities.map((loan) => (
          <div
            key={loan.id}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {loan.description}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                  {loan.interestRate}% p.a.
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Balance: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(loan.outstandingBalance, currency)}</strong> • {loan.tenureYearsRemaining || 5} yrs remaining
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {formatCurrency(loan.monthlyRepayment, currency)}/mo
              </span>
              <span className="text-[10px] text-slate-400">Repayment</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
