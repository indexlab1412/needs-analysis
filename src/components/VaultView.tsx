"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { YearlyReviewView } from "./YearlyReviewView";
import { PartnerMergeModal } from "./PartnerMergeModal";
import { formatCurrency } from "@/lib/utils";
import {
  FolderLock,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Trophy,
  History,
  Heart,
  Sparkles,
  Zap,
  Calendar,
  Wallet,
  Clock,
  QrCode,
  Wifi,
} from "lucide-react";

export const VaultView: React.FC = () => {
  const {
    profile,
    currency,
    summary,
    exportData,
    importData,
    resetProfile,
    closeMonthAndRollNext,
    syncConfig,
    isOnline,
    setIsSyncModalOpen,
    lastBackupExportedAt,
  } = useFinancialStore();
  const [activeTab, setActiveTab] = useState<"monthly_archive" | "yearly_review" | "backup_restore">("monthly_archive");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  const logs = (profile.monthlyLogs || []).slice().reverse(); // newest first
  const activeMonthYear = profile.activePlanningMonthYear || "2026-08";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus("Profile restored successfully!");
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus("Error: Invalid profile JSON file.");
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Sub-tab Pill Switcher */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1.5 border border-slate-200 dark:border-slate-700 shadow-inner">
        <button
          onClick={() => setActiveTab("monthly_archive")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "monthly_archive"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Monthly Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("yearly_review")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "yearly_review"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Annual YoY</span>
        </button>

        <button
          onClick={() => setActiveTab("backup_restore")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "backup_restore"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Vault &amp; Backups</span>
        </button>
      </div>

      {/* VIEW 1: MONTHLY SNAPSHOTS ARCHIVE */}
      {activeTab === "monthly_archive" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="fin-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Monthly Cashflow &amp; Snapshot Archive
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active live planning month: <strong className="text-slate-900 dark:text-white">{activeMonthYear}</strong>
              </p>
            </div>

            <button
              onClick={() => closeMonthAndRollNext()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
            >
              + Close &amp; Roll Month
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="fin-card p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
              <Zap className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Monthly Snapshots Archived Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Once each month finishes, closing the month will preserve your net worth and spending snapshot here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="fin-card p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-amber-500 rounded-3xl space-y-4 hover:shadow-md hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          {log.monthLabel || log.monthYear}
                        </h4>
                        <span className="text-[10px] text-slate-400">Recorded on {log.dateRecorded}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {log.savingsRatePercentage ? `${log.savingsRatePercentage}% Saved` : "Archived"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Income</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(log.totalIncome, currency)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Spending</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(log.totalExpenses, currency)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Savings</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        +{formatCurrency(log.netSavings, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Net Worth: <strong className="text-slate-900 dark:text-white">{formatCurrency(log.netWorthAtMonthEnd, currency)}</strong>
                    </span>
                    {log.keyNotes && <span className="text-[10px] text-slate-400 italic truncate max-w-[120px]">{log.keyNotes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: YEARLY REVIEW & YoY PROGRESS */}
      {activeTab === "yearly_review" && (
        <div className="animate-in fade-in duration-200">
          <YearlyReviewView />
        </div>
      )}

      {/* VIEW 3: BACKUP, EXPORT & RESTORE */}
      {activeTab === "backup_restore" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="fin-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Your Private Data Vault &amp; Cloud Sync
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Your financial data stays 100% on your device with zero cloud tracking. You can export an encrypted JSON backup anytime or securely pair other devices using QR codes.
            </p>
          </div>

          {importStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                importStatus.includes("Error")
                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
              }`}
            >
              {importStatus.includes("Error") ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
              <span>{importStatus}</span>
            </div>
          )}

          {/* 2-Column Responsive Grid on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (6 cols): Sync & Partner Merge */}
            <div className="lg:col-span-6 space-y-6">
              {/* Multi-Device QR Cloud Sync Card */}
              <div className="fin-card p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-3xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Device Cloud Sync</h3>
                        {syncConfig?.isSyncActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Not Paired
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        PIN-protected QR pairing with end-to-end encryption.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{syncConfig?.isSyncActive ? "Manage Sync" : "Pair via QR"}</span>
                  </button>
                </div>
              </div>

              {/* Merge Partner Profile Card */}
              <div className="fin-card p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-900 dark:to-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Merge Partner's Plan</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Combine both plans into a unified household</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMergeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Merge File
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Export & Import Cards */}
            <div className="lg:col-span-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="fin-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Export Backup</h3>
                        </div>
                      </div>

                      {lastBackupExportedAt ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Saved {new Date(lastBackupExportedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Not backed up
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Download full offline JSON snapshot.
                    </p>
                  </div>

                  <button
                    onClick={exportData}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="fin-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Restore Backup</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Load previously saved JSON file.
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-bold text-xs text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset / Clear Data */}
              <div className="fin-card p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">Clear All Local Data</h3>
                    <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">Wipes all stored profile numbers and starts fresh</p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset all data and start from scratch?")) {
                        resetProfile();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Partner Profile Modal */}
      <PartnerMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
      />
    </div>
  );
};
