"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import {
  Download,
  HardDriveDownload,
  Clock,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const BackupReminderBanner: React.FC = () => {
  const {
    shouldShowBackupReminder,
    lastBackupExportedAt,
    exportData,
    snoozeBackupReminder,
    dismissBackupReminder,
  } = useFinancialStore();

  const [downloadedToast, setDownloadedToast] = useState(false);

  if (!shouldShowBackupReminder) {
    return null;
  }

  const handleDownload = () => {
    exportData();
    setDownloadedToast(true);
    setTimeout(() => {
      setDownloadedToast(false);
    }, 4000);
  };

  // Calculate human readable relative time
  let timeLabel = "Never backed up yet";
  let isOverdue = true;

  if (lastBackupExportedAt) {
    const days = Math.floor(
      (Date.now() - new Date(lastBackupExportedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) {
      timeLabel = "Backed up today";
      isOverdue = false;
    } else if (days === 1) {
      timeLabel = "Backed up 1 day ago";
      isOverdue = false;
    } else {
      timeLabel = `Backed up ${days} days ago`;
      isOverdue = days >= 14;
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 dark:border-amber-500/40 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 p-3.5 sm:p-4 text-slate-900 dark:text-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm mt-0.5">
            <HardDriveDownload className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                Protect Your Data: Save a Local Backup
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                {timeLabel}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Your financial data stays exclusively on this device. Download a private JSON copy so you never lose your progress if browser data is cleared.
            </p>

            {downloadedToast && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Backup file downloaded successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss cross */}
        <button
          type="button"
          onClick={dismissBackupReminder}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
          title="Dismiss reminder for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-end gap-2 pt-2.5 mt-1 border-t border-amber-200/60 dark:border-amber-900/50">
        <button
          type="button"
          onClick={() => snoozeBackupReminder(7)}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Remind in 7 days</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Backup (.json)</span>
        </button>
      </div>
    </div>
  );
};
