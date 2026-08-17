"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  UserFinancialProfile,
  FNAReportSummary,
  PartnerProfile,
  PlanningCadence,
  PlanningScope,
  MonthlyCashflowLog,
  YearlySnapshot,
} from "@/lib/fna/types";
import { analyzeFinancialNeeds } from "@/lib/fna/engine";
import { SAMPLE_PROFILES, DEFAULT_BLANK_PROFILE } from "@/lib/fna/sample-data";
import { generateId } from "@/lib/utils";

type TabType = "dashboard" | "wizard" | "shortfall" | "priorities" | "simulator" | "vault";

interface MergeResult {
  success: boolean;
  partnerName?: string;
  mergedAssetsCount?: number;
  mergedDebtsCount?: number;
  mergedPoliciesCount?: number;
  error?: string;
}

interface FinancialStoreContextType {
  profile: UserFinancialProfile;
  summary: FNAReportSummary;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  updateProfile: (updater: (prev: UserFinancialProfile) => UserFinancialProfile) => void;
  setProfile: (newProfile: UserFinancialProfile) => void;
  setPlanningCadence: (cadence: PlanningCadence) => void;
  setPlanningScope: (scope: PlanningScope) => void;
  logMonthlyCashflow: (notes?: string) => void;
  closeMonthAndRollNext: (notes?: string) => void;
  captureYearlySnapshot: (milestone?: string, notes?: string) => void;
  loadPreset: (key: string) => void;
  resetProfile: () => void;
  exportData: () => void;
  importData: (json: string) => boolean;
  mergePartnerProfile: (json: string) => MergeResult;
  currency: string;
  setCurrency: (c: string) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isInitialized: boolean;
}

const STORAGE_KEY = "fna_user_profile_v1";

const FinancialStoreContext = createContext<FinancialStoreContextType | undefined>(undefined);

export function FinancialStoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserFinancialProfile>({
    ...SAMPLE_PROFILES.fresh_grad.data,
    planningCadence: "monthly",
    planningScope: "individual",
  });
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from local storage on first client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setProfileState((prev) => ({
            ...parsed,
            planningCadence: parsed.planningCadence || "monthly",
            planningScope: parsed.planningScope || (parsed.partner?.isEnabled ? "joint" : "individual"),
          }));
        }
      }
    } catch (e) {
      console.warn("Could not load stored profile, using initial state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to local storage on changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [profile, isInitialized]);

  // Compute live FNA summary
  const summary: FNAReportSummary = analyzeFinancialNeeds(profile);

  const updateProfile = (updater: (prev: UserFinancialProfile) => UserFinancialProfile) => {
    setProfileState((prev) => updater(prev));
  };

  const setProfile = (newProfile: UserFinancialProfile) => {
    setProfileState(newProfile);
  };

  const setPlanningCadence = (cadence: PlanningCadence) => {
    updateProfile((p) => ({ ...p, planningCadence: cadence }));
  };

  const setPlanningScope = (scope: PlanningScope) => {
    updateProfile((p) => {
      const isJoint = scope === "joint";
      return {
        ...p,
        planningScope: scope,
        partner: p.partner
          ? { ...p.partner, isEnabled: isJoint }
          : isJoint
          ? {
              isEnabled: true,
              name: "Chloe (Partner)",
              currentAge: Math.max(20, p.currentAge - 1),
              targetRetirementAge: p.targetRetirementAge,
              monthlyIncome: 3500,
              monthlyPersonalExpenses: 800,
              personalDebts: 8000,
              monthlyDebtRepayment: 200,
              liquidSavings: 12000,
              investmentsValue: 10000,
              monthlyDCA: 200,
              deathBenefit: 300000,
              ciBenefit: 150000,
              cpfLifeEstimatedMonthlyToday: 1650,
            }
          : undefined,
      };
    });
  };

  const logMonthlyCashflow = (notes?: string) => {
    const activeMY = profile.activePlanningMonthYear || "2026-08";
    const [yearStr, monthStr] = activeMY.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const dateObj = new Date(year, month - 1, 1);
    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const newLog: MonthlyCashflowLog = {
      id: generateId("log"),
      monthYear: activeMY,
      monthLabel,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalIncome: summary.cashFlow.totalMonthlyIncome,
      totalExpenses: summary.cashFlow.totalMonthlyExpenses,
      totalDcaInvested: summary.cashFlow.totalMonthlyDCAInvestments,
      netSavings: summary.cashFlow.monthlyNetSavings,
      savingsRatePercentage: summary.cashFlow.savingsRatePercentage,
      netWorthAtMonthEnd: summary.netWorth.netWorth,
      keyNotes: notes || `Recorded cashflow snapshot for ${monthLabel}.`,
      expensesSnapshot: JSON.parse(JSON.stringify(profile.expenses)),
    };

    updateProfile((p) => {
      const existing = p.monthlyLogs || [];
      const filtered = existing.filter((l) => l.monthYear !== activeMY);
      return { ...p, monthlyLogs: [...filtered, newLog].sort((a, b) => a.monthYear.localeCompare(b.monthYear)) };
    });
  };

  const closeMonthAndRollNext = (notes?: string) => {
    const activeMY = profile.activePlanningMonthYear || "2026-08";
    const [yearStr, monthStr] = activeMY.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const dateObj = new Date(year, month - 1, 1);
    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const newLog: MonthlyCashflowLog = {
      id: generateId("log"),
      monthYear: activeMY,
      monthLabel,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalIncome: summary.cashFlow.totalMonthlyIncome,
      totalExpenses: summary.cashFlow.totalMonthlyExpenses,
      totalDcaInvested: summary.cashFlow.totalMonthlyDCAInvestments,
      netSavings: summary.cashFlow.monthlyNetSavings,
      savingsRatePercentage: summary.cashFlow.savingsRatePercentage,
      netWorthAtMonthEnd: summary.netWorth.netWorth,
      keyNotes: notes || `Closed ${monthLabel} and archived snapshot.`,
      expensesSnapshot: JSON.parse(JSON.stringify(profile.expenses)),
    };

    // Calculate Next Month Year string
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthYear = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    updateProfile((p) => {
      const existing = p.monthlyLogs || [];
      const filtered = existing.filter((l) => l.monthYear !== activeMY);
      return {
        ...p,
        activePlanningMonthYear: nextMonthYear,
        monthlyLogs: [...filtered, newLog].sort((a, b) => a.monthYear.localeCompare(b.monthYear)),
      };
    });
  };

  const captureYearlySnapshot = (milestone?: string, notes?: string) => {
    const currentYear = new Date().getFullYear();
    const newSnap: YearlySnapshot = {
      id: generateId("snap"),
      year: currentYear,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalNetWorth: summary.netWorth.netWorth,
      totalLiquidSavings: summary.netWorth.liquidAssets,
      totalInvestments: summary.profile.assets
        .filter((a) => !a.isLiquid && a.category !== "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0),
      totalLiabilities: summary.netWorth.totalLiabilities,
      annualIncome: summary.cashFlow.totalMonthlyIncome * 12,
      annualSavingsRate: summary.cashFlow.savingsRatePercentage,
      financialHealthScore: summary.overallFinancialHealthScore,
      keyMilestoneAchieved: milestone || "Annual review snapshot captured.",
      reflectionNotes: notes || "Review completed.",
    };

    updateProfile((p) => {
      const existing = p.yearlySnapshots || [];
      const filtered = existing.filter((s) => s.year !== currentYear);
      return { ...p, yearlySnapshots: [...filtered, newSnap].sort((a, b) => a.year - b.year) };
    });
  };

  const loadPreset = (key: string) => {
    if (SAMPLE_PROFILES[key]) {
      setProfileState(JSON.parse(JSON.stringify(SAMPLE_PROFILES[key].data)));
    }
  };

  const resetProfile = () => {
    setProfileState(JSON.parse(JSON.stringify(DEFAULT_BLANK_PROFILE)));
  };

  const setCurrency = (c: string) => {
    updateProfile((p) => ({ ...p, currency: c }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `financial-plan-${profile.name.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.id && parsed.incomes && parsed.expenses) {
        setProfileState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const mergePartnerProfile = (jsonStr: string): MergeResult => {
    try {
      const partnerData: UserFinancialProfile = JSON.parse(jsonStr);
      if (!partnerData || !partnerData.id || !partnerData.name) {
        return { success: false, error: "Invalid financial plan file format." };
      }

      const partnerName = partnerData.name || "Partner";

      // Tag and merge incomes
      const mergedIncomes = [
        ...profile.incomes,
        ...partnerData.incomes.map((inc) => ({
          ...inc,
          id: generateId("p-inc"),
          description: `[${partnerName}] ${inc.description}`,
        })),
      ];

      // Tag and merge expenses
      const mergedExpenses = [
        ...profile.expenses,
        ...partnerData.expenses.map((exp) => ({
          ...exp,
          id: generateId("p-exp"),
          description: `[${partnerName}] ${exp.description}`,
        })),
      ];

      // Tag and merge assets
      const mergedAssets = [
        ...profile.assets,
        ...partnerData.assets.map((ast) => ({
          ...ast,
          id: generateId("p-ast"),
          description: `[${partnerName}] ${ast.description}`,
        })),
      ];

      // Tag and merge liabilities
      const mergedLiabilities = [
        ...profile.liabilities,
        ...partnerData.liabilities.map((lia) => ({
          ...lia,
          id: generateId("p-lia"),
          description: `[${partnerName}] ${lia.description}`,
        })),
      ];

      // Tag and merge insurance policies
      const mergedPolicies = [
        ...profile.insurancePolicies,
        ...partnerData.insurancePolicies.map((pol) => ({
          ...pol,
          id: generateId("p-pol"),
          policyName: `[${partnerName}] ${pol.policyName}`,
        })),
      ];

      // Merge goals
      const mergedGoals = [
        ...profile.goals,
        ...partnerData.goals.map((g) => ({
          ...g,
          id: generateId("p-goal"),
          name: `[${partnerName}] ${g.name}`,
        })),
      ];

      // Construct PartnerProfile
      const partnerMonthlyIncome = partnerData.incomes.reduce((sum, i) => sum + (Number(i.monthlyAmount) || 0), 0);
      const partnerMonthlyExpenses = partnerData.expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
      const partnerDebts = partnerData.liabilities.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);
      const partnerDebtRepay = partnerData.liabilities.reduce((sum, l) => sum + (Number(l.monthlyRepayment) || 0), 0);
      const partnerLiquidSavings = partnerData.assets
        .filter((a) => a.isLiquid || a.category === "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
      const partnerInvestments = partnerData.assets
        .filter((a) => !a.isLiquid && a.category !== "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
      const partnerDCA = partnerData.assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);
      const partnerDeath = partnerData.insurancePolicies.reduce((sum, p) => sum + (Number(p.deathBenefit) || 0), 0);
      const partnerCi = partnerData.insurancePolicies.reduce((sum, p) => sum + (Number(p.majorCiBenefit) || 0), 0);
      const partnerCpf = partnerData.cpfLife?.estimatedMonthlyPayoutToday ?? 1650;

      const newPartnerObj: PartnerProfile = {
        isEnabled: true,
        name: partnerName,
        currentAge: partnerData.currentAge || 25,
        targetRetirementAge: partnerData.targetRetirementAge || 58,
        monthlyIncome: partnerMonthlyIncome,
        monthlyPersonalExpenses: partnerMonthlyExpenses,
        personalDebts: partnerDebts,
        monthlyDebtRepayment: partnerDebtRepay,
        liquidSavings: partnerLiquidSavings,
        investmentsValue: partnerInvestments,
        monthlyDCA: partnerDCA,
        deathBenefit: partnerDeath,
        ciBenefit: partnerCi,
        cpfLifeEstimatedMonthlyToday: partnerCpf,
      };

      setProfileState((prev) => ({
        ...prev,
        maritalStatus: "married",
        planningScope: "joint",
        incomes: mergedIncomes,
        expenses: mergedExpenses,
        assets: mergedAssets,
        liabilities: mergedLiabilities,
        insurancePolicies: mergedPolicies,
        goals: mergedGoals,
        partner: newPartnerObj,
      }));

      return {
        success: true,
        partnerName,
        mergedAssetsCount: partnerData.assets.length,
        mergedDebtsCount: partnerData.liabilities.length,
        mergedPoliciesCount: partnerData.insurancePolicies.length,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to parse partner file." };
    }
  };

  return (
    <FinancialStoreContext.Provider
      value={{
        profile,
        summary,
        activeTab,
        setActiveTab,
        updateProfile,
        setProfile,
        setPlanningCadence,
        setPlanningScope,
        logMonthlyCashflow,
        closeMonthAndRollNext,
        captureYearlySnapshot,
        loadPreset,
        resetProfile,
        exportData,
        importData,
        mergePartnerProfile,
        currency: profile.currency || "SGD",
        setCurrency,
        isReportModalOpen,
        setIsReportModalOpen,
        isInitialized,
      }}
    >
      {children}
    </FinancialStoreContext.Provider>
  );
}

export function useFinancialStore() {
  const context = useContext(FinancialStoreContext);
  if (!context) {
    throw new Error("useFinancialStore must be used within a FinancialStoreProvider");
  }
  return context;
}
