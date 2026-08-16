"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import { DivorceSettings, WidowedSettings, MaritalStatus } from "@/lib/fna/types";
import { formatCurrency } from "@/lib/utils";
import {
  HeartCrack,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Users,
  Home,
  FileText,
} from "lucide-react";

export const LifeTransitionView: React.FC = () => {
  const { profile, updateProfile, summary, currency } = useFinancialStore();
  const { cashFlow, netWorth } = summary;

  const maritalStatus: MaritalStatus = profile.maritalStatus;

  // Local state for Divorce
  const divorceSettings: DivorceSettings = profile.divorceSettings || {
    childMaintenanceType: "receiving",
    childMaintenanceMonthlyAmount: 1200,
    maintenanceEndAgeOfChild: 21,
    housingDivisionPlan: "downsizing_hdb",
    soleCustodyOfDependents: true,
  };

  // Local state for Widowed
  const widowedSettings: WidowedSettings = profile.widowedSettings || {
    insuranceLumpSumReceived: 400000,
    cpfNominationPayoutReceived: 60000,
    hpsMortgageWipedOut: true,
    monthlyIncomeToReplace: 3000,
    familySupportYearsNeeded: 15,
  };

  const updateDivorce = (updates: Partial<DivorceSettings>) => {
    updateProfile((p) => ({
      ...p,
      divorceSettings: { ...(p.divorceSettings || divorceSettings), ...updates },
    }));
  };

  const updateWidowed = (updates: Partial<WidowedSettings>) => {
    updateProfile((p) => ({
      ...p,
      widowedSettings: { ...(p.widowedSettings || widowedSettings), ...updates },
    }));
  };

  const setMaritalStatus = (status: MaritalStatus) => {
    updateProfile((p) => ({ ...p, maritalStatus: status }));
  };

  // --- WIDOWED DRAWDOWN MATH ---
  const totalBereavementLumpSum =
    (widowedSettings.insuranceLumpSumReceived || 0) +
    (widowedSettings.cpfNominationPayoutReceived || 0);

  const monthlyFamilyDrawdown = widowedSettings.monthlyIncomeToReplace || 3000;
  const annualDrawdown = monthlyFamilyDrawdown * 12;
  const safeYieldRate = 0.035; // 3.5% conservative payout fund

  // Years payout will last: n = -ln(1 - (PV * r / PMT)) / ln(1 + r)
  const calculateLumpSumRunway = (pv: number, pmtAnnual: number, r: number) => {
    if (pv <= 0 || pmtAnnual <= 0) return 0;
    if (pv * r >= pmtAnnual) return 99; // Perpetual annuity
    const years = -Math.log(1 - (pv * r) / pmtAnnual) / Math.log(1 + r);
    return Math.round(years * 10) / 10;
  };

  const lumpSumRunwayYears = calculateLumpSumRunway(totalBereavementLumpSum, annualDrawdown, safeYieldRate);
  const isLumpSumSufficient = lumpSumRunwayYears >= (widowedSettings.familySupportYearsNeeded || 15);

  // --- DIVORCE SOLE PROVIDER MATH ---
  const maintenanceAdjustment =
    divorceSettings.childMaintenanceType === "receiving"
      ? divorceSettings.childMaintenanceMonthlyAmount
      : divorceSettings.childMaintenanceType === "paying"
      ? -divorceSettings.childMaintenanceMonthlyAmount
      : 0;

  const adjustedMonthlyIncome = Math.max(0, cashFlow.totalMonthlyIncome + maintenanceAdjustment);
  const totalUserLifeCover = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.deathBenefit) || 0), 0);
  const totalUserCiCover = profile.insurancePolicies.reduce((sum, p) => sum + (Number(p.majorCiBenefit) || 0), 0);
  const soleParentTargetLifeCover = cashFlow.totalMonthlyIncome * 12 * 10; // 10 years income for children

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          Life Transition & Single-Parent Planning
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Specialized financial navigation for life changes — restructuring finances after divorce, single parenthood, or managing bereavement payouts as a surviving spouse.
        </p>
      </div>

      {/* Marital Status Selector */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl grid grid-cols-4 gap-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => setMaritalStatus("single")}
          className={`py-2 rounded-xl transition-all ${
            maritalStatus === "single"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Single
        </button>
        <button
          onClick={() => setMaritalStatus("married")}
          className={`py-2 rounded-xl transition-all ${
            maritalStatus === "married"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Married
        </button>
        <button
          onClick={() => setMaritalStatus("divorced")}
          className={`py-2 rounded-xl transition-all ${
            maritalStatus === "divorced"
              ? "bg-rose-500 text-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Divorced
        </button>
        <button
          onClick={() => setMaritalStatus("widowed")}
          className={`py-2 rounded-xl transition-all ${
            maritalStatus === "widowed"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Widowed
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: DIVORCED / SINGLE PARENT PLANNING */}
      {/* ========================================================================= */}
      {maritalStatus === "divorced" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Divorce Verdict Card */}
          <div className="fin-card p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-300 flex items-center gap-1.5">
                <HeartCrack className="w-4 h-4 text-rose-400" /> Single-Earner Custodial Balance
              </span>
              <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-rose-200">
                Divorced Planning
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Maintenance In/Out</span>
                <span
                  className={`text-sm font-black block mt-0.5 ${
                    maintenanceAdjustment >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {maintenanceAdjustment >= 0 ? `+${formatCurrency(maintenanceAdjustment, currency)}` : formatCurrency(maintenanceAdjustment, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">Child support cashflow</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Adjusted Income</span>
                <span className="text-sm font-black text-white block mt-0.5">
                  {formatCurrency(adjustedMonthlyIncome, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">Net take-home budget</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-bold">Sole-Earner Life Cover</span>
                <span
                  className={`text-sm font-black block mt-0.5 ${
                    totalUserLifeCover >= soleParentTargetLifeCover ? "text-emerald-400" : "text-amber-300"
                  }`}
                >
                  {formatCurrency(totalUserLifeCover, currency)}
                </span>
                <span className="text-[9px] text-slate-400">Target: {formatCurrency(soleParentTargetLifeCover, currency)}</span>
              </div>
            </div>
          </div>

          {/* Divorce Parameters Form */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Child Maintenance & Custody Inputs
            </h3>

            {/* Maintenance Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Child Support / Spousal Maintenance Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateDivorce({ childMaintenanceType: "receiving" })}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    divorceSettings.childMaintenanceType === "receiving"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Receiving Support (+)
                </button>
                <button
                  type="button"
                  onClick={() => updateDivorce({ childMaintenanceType: "paying" })}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    divorceSettings.childMaintenanceType === "paying"
                      ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Paying Support (-)
                </button>
                <button
                  type="button"
                  onClick={() => updateDivorce({ childMaintenanceType: "none" })}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    divorceSettings.childMaintenanceType === "none"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  No Maintenance
                </button>
              </div>
            </div>

            {divorceSettings.childMaintenanceType !== "none" && (
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">
                    Monthly Maintenance Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={divorceSettings.childMaintenanceMonthlyAmount}
                    onChange={(e) => updateDivorce({ childMaintenanceMonthlyAmount: Number(e.target.value) || 0 })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">
                    Support Ends at Child's Age
                  </label>
                  <input
                    type="number"
                    value={divorceSettings.maintenanceEndAgeOfChild || 21}
                    onChange={(e) => updateDivorce({ maintenanceEndAgeOfChild: Number(e.target.value) || 21 })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: WIDOWED / BEREAVEMENT PLANNING */}
      {/* ========================================================================= */}
      {maritalStatus === "widowed" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Bereavement Runway Card */}
          <div className="fin-card p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bereavement Capital & Income Runway
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isLumpSumSufficient ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {isLumpSumSufficient ? `🟢 Safe for ${lumpSumRunwayYears} Years` : `⚠️ Runs Out in ${lumpSumRunwayYears} Years`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Total Payout Received</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 block mt-0.5">
                  {formatCurrency(totalBereavementLumpSum, currency)}
                </span>
                <span className="text-[9px] text-slate-400">Insurance + CPF Payout</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block font-bold">Monthly Family Need</span>
                <span className="text-sm sm:text-base font-black text-white block mt-0.5">
                  {formatCurrency(monthlyFamilyDrawdown, currency)}/mo
                </span>
                <span className="text-[9px] text-slate-400">To replace lost income</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-bold">Years of Safe Runway</span>
                <span className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">
                  {lumpSumRunwayYears >= 99 ? "Perpetual (>50 Yrs)" : `${lumpSumRunwayYears} Years`}
                </span>
                <span className="text-[9px] text-slate-400">Target: {widowedSettings.familySupportYearsNeeded} yrs</span>
              </div>
            </div>

            {/* Home Protection Scheme Callout */}
            {widowedSettings.hpsMortgageWipedOut && (
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200 text-[11px]">
                  <strong>Home Protection Scheme (HPS) Activated:</strong> The deceased spouse's share of the HDB housing loan has been cleared, reducing monthly debt obligations to $0!
                </span>
              </div>
            )}
          </div>

          {/* Bereavement Input Form */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Insurance Death Benefits & Family Protection Needs
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">
                  Spouse Life Insurance Payout ({currency})
                </label>
                <input
                  type="number"
                  value={widowedSettings.insuranceLumpSumReceived}
                  onChange={(e) => updateWidowed({ insuranceLumpSumReceived: Number(e.target.value) || 0 })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">
                  CPF Nomination Payout ({currency})
                </label>
                <input
                  type="number"
                  value={widowedSettings.cpfNominationPayoutReceived}
                  onChange={(e) => updateWidowed({ cpfNominationPayoutReceived: Number(e.target.value) || 0 })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">
                  Monthly Living Drawdown ({currency}/mo)
                </label>
                <input
                  type="number"
                  value={widowedSettings.monthlyIncomeToReplace}
                  onChange={(e) => updateWidowed({ monthlyIncomeToReplace: Number(e.target.value) || 0 })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">
                  Years of Family Support Needed
                </label>
                <input
                  type="number"
                  value={widowedSettings.familySupportYearsNeeded}
                  onChange={(e) => updateWidowed({ familySupportYearsNeeded: Number(e.target.value) || 15 })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            {/* HPS Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Home Protection Scheme (HPS) / Mortgage Insurance
                </span>
                <span className="text-[10px] text-slate-500">
                  Did mortgage insurance pay off the remaining housing loan?
                </span>
              </div>
              <input
                type="checkbox"
                checked={widowedSettings.hpsMortgageWipedOut}
                onChange={(e) => updateWidowed({ hpsMortgageWipedOut: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SINGLE & MARRIED GUIDANCE NOTE */}
      {(maritalStatus === "single" || maritalStatus === "married") && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Currently Viewing {maritalStatus === "single" ? "Single Individual" : "Married Couple"} Planning
          </h3>
          <p>
            You can switch to <strong>Divorced</strong> or <strong>Widowed</strong> above anytime to model single-parent alimony flows, sole-earner life coverage for children, or simulate how a spouse's insurance death payout and HPS mortgage cancellation protects your household.
          </p>
        </div>
      )}
    </div>
  );
};
