"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { SAMPLE_PROFILES } from "@/lib/fna/sample-data";
import {
  Heart,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Users,
  Building2,
  Zap,
} from "lucide-react";

interface PartnerMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerMergeModal: React.FC<PartnerMergeModalProps> = ({ isOpen, onClose }) => {
  const { mergePartnerProfile, profile } = useFinancialStore();
  const [jsonInput, setJsonInput] = useState<string>("");
  const [mergeStatus, setMergeStatus] = useState<{
    success?: boolean;
    partnerName?: string;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        executeMerge(content);
      }
    };
    reader.readAsText(file);
  };

  const executeMerge = (json: string) => {
    const result = mergePartnerProfile(json);
    if (result.success) {
      setMergeStatus({
        success: true,
        partnerName: result.partnerName,
        message: `Successfully combined with ${result.partnerName}'s profile! Merged ${result.mergedAssetsCount} assets, ${result.mergedDebtsCount} debts, and combined your CPF LIFE floors into a single household plan.`,
      });
      setTimeout(() => {
        onClose();
        setMergeStatus(null);
        setJsonInput("");
      }, 2500);
    } else {
      setMergeStatus({
        success: false,
        message: result.error || "Failed to merge partner profile. Please check the JSON format.",
      });
    }
  };

  // 1-Tap Sample Partner Data for instant testing
  const handleLoadSamplePartner = () => {
    const samplePartner = {
      ...SAMPLE_PROFILES.fresh_grad.data,
      id: "partner-chloe-tan",
      name: "Chloe Tan",
      currentAge: 24,
      targetRetirementAge: 58,
      incomes: [
        {
          id: "chloe-salary",
          category: "employment" as const,
          description: "Chloe's Tech Salary",
          monthlyAmount: 3600,
        },
      ],
      expenses: [
        {
          id: "chloe-personal",
          category: "food" as const,
          description: "Chloe's Personal Spend",
          monthlyAmount: 850,
          isEssential: true,
        },
      ],
      assets: [
        {
          id: "chloe-stashaway",
          category: "stocks_funds" as const,
          description: "Chloe's StashAway Robo",
          currentValue: 8500,
          isLiquid: false,
          expectedReturnRate: 6.5,
          monthlyContribution: 200,
        },
        {
          id: "chloe-ocbc-bank",
          category: "cash_savings" as const,
          description: "Chloe's OCBC 360 Cash",
          currentValue: 12000,
          isLiquid: true,
          expectedReturnRate: 3.2,
        },
      ],
      liabilities: [
        {
          id: "chloe-study-loan",
          category: "study_loan" as const,
          description: "Chloe's Study Loan",
          outstandingBalance: 10000,
          monthlyRepayment: 250,
          interestRate: 2.8,
          tenureYearsRemaining: 3,
        },
      ],
      insurancePolicies: [
        {
          id: "chloe-ci-shield",
          policyName: "Chloe's Great Eastern CI Term",
          insurer: "Great Eastern",
          policyType: "critical_illness" as const,
          deathBenefit: 250000,
          tpdBenefit: 250000,
          earlyCiBenefit: 60000,
          majorCiBenefit: 150000,
          disabilityIncomeMonthly: 0,
          annualPremium: 650,
        },
      ],
      cpfLife: {
        isEnabled: true,
        planTier: "full_frs" as const,
        estimatedMonthlyPayoutToday: 1650,
        payoutStartAge: 65,
      },
    };

    const json = JSON.stringify(samplePartner);
    setJsonInput(json);
    executeMerge(json);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Merge Partner / Spouse Profile
              </h3>
              <p className="text-[10px] text-slate-500">Combine 2 individual accounts into 1 joint plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {mergeStatus && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-start gap-2 ${
              mergeStatus.success
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200"
            }`}
          >
            {mergeStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="leading-snug">{mergeStatus.message}</div>
          </div>
        )}

        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
          <p>
            💍 <strong>Getting Married or Planning Together?</strong>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Your partner can export their profile from their phone and send it to you. When merged, both of your incomes, debts, robo accounts, and dual CPF LIFE payouts are unified into a refreshed single household view.
          </p>
        </div>

        {/* Upload File Option */}
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors">
            <Upload className="w-6 h-6 text-indigo-500 mb-1" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Upload Partner's Exported JSON File
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Select .json backup file from partner's device</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Or Paste JSON Text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Or Paste Profile JSON Code:</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste partner's exported profile text here..."
            rows={3}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => executeMerge(jsonInput)}
            disabled={!jsonInput.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Merge & Calculate Household Plan
          </button>

          <button
            type="button"
            onClick={handleLoadSamplePartner}
            className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" /> 1-Tap Test: Merge with "Chloe Tan (Partner)"
          </button>
        </div>
      </div>
    </div>
  );
};
