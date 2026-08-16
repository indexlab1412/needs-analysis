"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { YearlyReviewView } from "./YearlyReviewView";
import { PartnerMergeModal } from "./PartnerMergeModal";
import {
  FolderLock,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Trophy,
  History,
  Heart,
  Sparkles,
} from "lucide-react";

export const VaultView: React.FC = () => {
  const { profile, exportData, importData, resetProfile } = useFinancialStore();
  const [activeTab, setActiveTab] = useState<"yearly_review" | "backup_restore">("yearly_review");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

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
    <div className="space-y-4 pb-24">
      {/* Sub-tab Pill Switcher */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("yearly_review")}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "yearly_review"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Yearly Progress & Check-In</span>
        </button>

        <button
          onClick={() => setActiveTab("backup_restore")}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "backup_restore"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <FolderLock className="w-3.5 h-3.5" />
          <span>Private Vault & Backups</span>
        </button>
      </div>

      {/* VIEW 1: YEARLY REVIEW & YoY PROGRESS */}
      {activeTab === "yearly_review" && (
        <div className="animate-in fade-in duration-200">
          <YearlyReviewView />
        </div>
      )}

      {/* VIEW 2: BACKUP, EXPORT & RESTORE */}
      {activeTab === "backup_restore" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-indigo-600" />
              Your Private Data Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your financial data stays 100% on your device. We don't upload or sell your information. You can export a backup anytime to keep on your phone or laptop.
            </p>
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                importStatus.startsWith("Error")
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {importStatus.startsWith("Error") ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
              <span>{importStatus}</span>
            </div>
          )}

          {/* Privacy Guarantee Box */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              <strong className="block font-bold mb-0.5">100% Private & Local Storage</strong>
              No login required. Your numbers, loans, and policy details are securely kept in your browser storage.
            </div>
          </div>

          {/* 💍 Partner Merge Action Card */}
          <div className="fin-card p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-900 dark:to-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                  Combine with Partner / Spouse Profile
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Import partner's independent plan to automatically merge assets, debts, and retirement into a single view.
              </p>
            </div>
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" /> Merge Partner
            </button>
          </div>

          {/* Export Action Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Save Backup File</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download a JSON backup of your current profile & analysis
              </p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          {/* Import Action Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Restore Backup</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Load a previously saved profile file from your phone or PC
              </p>
            </div>
            <label className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5" /> Import JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset Action */}
          <div className="fin-card p-4 bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">Reset All Data</h3>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Clear all custom inputs and start with a clean template
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to reset all your data? This cannot be undone unless you exported a backup.")) {
                  resetProfile();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Partner Merge Modal */}
      <PartnerMergeModal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} />
    </div>
  );
};
