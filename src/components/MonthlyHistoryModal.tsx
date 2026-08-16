"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { MonthlyCashflowLog } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Calendar,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  PieChart,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface MonthlyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyHistoryModal: React.FC<MonthlyHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, currency, summary } = useFinancialStore();
  const logs = profile.monthlyLogs || [];

  const [selectedLogId, setSelectedLogId] = useState<string | null>(
    logs.length > 0 ? logs[logs.length - 1].id : null
  );

  if (!isOpen) return null;

  const selectedLog: MonthlyCashflowLog | undefined =
    logs.find((l) => l.id === selectedLogId) || logs[logs.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Monthly Snapshots & Review Archive
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Track how your cashflow & savings evolved month by month
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                No Monthly Snapshots Archived Yet
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                As each month concludes, you can close the month to save an immutable financial snapshot here for review.
              </p>
            </div>
          ) : (
            <>
              {/* Monthly Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all flex items-center gap-1.5 ${
                      selectedLog?.id === log.id
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{log.monthLabel || log.monthYear}</span>
                  </button>
                ))}
              </div>

              {/* Active Selected Month Snapshot Display */}
              {selectedLog && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Top Stats Banner */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Snapshot Date</span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {selectedLog.monthLabel || selectedLog.monthYear}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {selectedLog.savingsRatePercentage ? `${selectedLog.savingsRatePercentage}% Savings Rate` : "Archived"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Inflow (Income)</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                          +{formatCurrency(selectedLog.totalIncome, currency)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Outflow (Spend)</span>
                        <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                          -{formatCurrency(selectedLog.totalExpenses, currency)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Net Saved / Invested</span>
                        <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                          +{formatCurrency(selectedLog.netSavings, currency)}
                        </span>
                      </div>
                    </div>

                    {selectedLog.keyNotes && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed italic">{selectedLog.keyNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Net Worth at Month End */}
                  <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-indigo-500" /> Net Worth Recorded at Month-End:
                    </span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(selectedLog.netWorthAtMonthEnd, currency)}
                    </span>
                  </div>

                  {/* Month's Itemized Spending Breakdown if available */}
                  {selectedLog.expensesSnapshot && selectedLog.expensesSnapshot.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Archived Spending Line-Items
                      </h5>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {selectedLog.expensesSnapshot.map((exp) => (
                          <div
                            key={exp.id}
                            className="p-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {exp.description}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(exp.monthlyAmount, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
