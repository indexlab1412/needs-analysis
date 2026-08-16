"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserFinancialProfile, FNAReportSummary, PartnerProfile } from "@/lib/fna/types";
import { analyzeFinancialNeeds } from "@/lib/fna/engine";
import { SAMPLE_PROFILES, DEFAULT_BLANK_PROFILE } from "@/lib/fna/sample-data";
import { generateId } from "@/lib/utils";

type TabType = "dashboard" | "wizard" | "shortfall" | "simulator" | "vault";

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
  const [profile, setProfileState] = useState<UserFinancialProfile>(SAMPLE_PROFILES.fresh_grad.data);
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
          setProfileState(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load stored profile, using initial state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to local storage on profile changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to persist profile to localStorage:", e);
    }
  }, [profile, isInitialized]);

  // Compute live analysis whenever profile changes
  const summary = React.useMemo(() => {
    return analyzeFinancialNeeds(profile);
  }, [profile]);

  const updateProfile = (updater: (prev: UserFinancialProfile) => UserFinancialProfile) => {
    setProfileState((prev) => updater(prev));
  };

  const setProfile = (newProfile: UserFinancialProfile) => {
    setProfileState(newProfile);
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
    downloadAnchor.setAttribute("download", `FNA_Profile_${(profile.name || "User").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object" && parsed.id) {
        setProfileState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Merge partner's independent profile JSON into single combined household plan
  const mergePartnerProfile = (jsonStr: string): MergeResult => {
    try {
      const partnerData: UserFinancialProfile = JSON.parse(jsonStr);
      if (!partnerData || !partnerData.id) {
        return { success: false, error: "Invalid partner profile data." };
      }

      const partnerName = partnerData.name || "Partner";

      // Tag & merge incomes
      const mergedIncomes = [
        ...profile.incomes,
        ...partnerData.incomes.map((inc) => ({
          ...inc,
          id: generateId("inc-ptn"),
          description: `[${partnerName}] ${inc.description}`,
        })),
      ];

      // Tag & merge expenses
      const mergedExpenses = [
        ...profile.expenses,
        ...partnerData.expenses.map((exp) => ({
          ...exp,
          id: generateId("exp-ptn"),
          description: `[${partnerName}] ${exp.description}`,
        })),
      ];

      // Tag & merge assets
      const mergedAssets = [
        ...profile.assets,
        ...partnerData.assets.map((ast) => ({
          ...ast,
          id: generateId("ast-ptn"),
          description: `[${partnerName}] ${ast.description}`,
        })),
      ];

      // Tag & merge liabilities
      const mergedLiabilities = [
        ...profile.liabilities,
        ...partnerData.liabilities.map((lia) => ({
          ...lia,
          id: generateId("lia-ptn"),
          description: `[${partnerName}] ${lia.description}`,
        })),
      ];

      // Tag & merge insurance policies
      const mergedPolicies = [
        ...profile.insurancePolicies,
        ...partnerData.insurancePolicies.map((pol) => ({
          ...pol,
          id: generateId("pol-ptn"),
          policyName: `[${partnerName}] ${pol.policyName}`,
        })),
      ];

      // Tag & merge goals
      const mergedGoals = [
        ...profile.goals,
        ...(partnerData.goals || []).map((g) => ({
          ...g,
          id: generateId("goal-ptn"),
          name: `[${partnerName}] ${g.name}`,
        })),
      ];

      // Build PartnerProfile for Couple planning
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
