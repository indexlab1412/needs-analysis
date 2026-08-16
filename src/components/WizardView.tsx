"use client";

import React, { useState } from "react";
import { useFinancialStore } from "@/context/financial-store";
import {
  Dependent,
  IncomeItem,
  ExpenseItem,
  AssetItem,
  LiabilityItem,
  InsurancePolicy,
  FinancialGoal,
} from "@/lib/fna/types";
import { generateId, parseNumberInput } from "@/lib/utils";
import {
  User,
  Users,
  Wallet,
  Building2,
  ShieldCheck,
  Target,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { RiskProfilerModal, RISK_PROFILES_META } from "./RiskProfilerModal";

export const WizardView: React.FC = () => {
  const { profile, updateProfile, currency, setActiveTab } = useFinancialStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);

  const totalSteps = 5;

  const addDependent = () => {
    const newDep: Dependent = {
      id: generateId("dep"),
      name: "Parent or Child",
      relationship: "parent",
      age: 55,
      yearsOfSupportNeeded: 15,
      monthlySupportAmount: 400,
    };
    updateProfile((p) => ({ ...p, dependents: [...p.dependents, newDep] }));
  };

  const removeDependent = (id: string) => {
    updateProfile((p) => ({ ...p, dependents: p.dependents.filter((d) => d.id !== id) }));
  };

  const updateDependent = (id: string, updates: Partial<Dependent>) => {
    updateProfile((p) => ({
      ...p,
      dependents: p.dependents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  const addIncome = () => {
    const newItem: IncomeItem = {
      id: generateId("inc"),
      category: "employment",
      description: "Side Gig / Bonus / Freelance",
      monthlyAmount: 500,
    };
    updateProfile((p) => ({ ...p, incomes: [...p.incomes, newItem] }));
  };

  const removeIncome = (id: string) => {
    updateProfile((p) => ({ ...p, incomes: p.incomes.filter((i) => i.id !== id) }));
  };

  const addExpense = () => {
    const newItem: ExpenseItem = {
      id: generateId("exp"),
      category: "lifestyle",
      description: "New Spending Item",
      monthlyAmount: 150,
      isEssential: false,
    };
    updateProfile((p) => ({ ...p, expenses: [...p.expenses, newItem] }));
  };

  const removeExpense = (id: string) => {
    updateProfile((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  };

  const addAsset = () => {
    const newItem: AssetItem = {
      id: generateId("ast"),
      category: "stocks_funds",
      description: "Robo-Advisor / ETF Account",
      platformOrVehicle: "Syfe / Endowus / Broker",
      currentValue: 3000,
      isLiquid: false,
      expectedReturnRate: 6.5,
      monthlyContribution: 100, // Default DCA $100/mo
      targetPurpose: "retirement",
    };
    updateProfile((p) => ({ ...p, assets: [...p.assets, newItem] }));
  };

  const removeAsset = (id: string) => {
    updateProfile((p) => ({ ...p, assets: p.assets.filter((a) => a.id !== id) }));
  };

  const addLiability = () => {
    const newItem: LiabilityItem = {
      id: generateId("lia"),
      category: "study_loan",
      description: "Student Loan / Personal Loan",
      outstandingBalance: 12000,
      monthlyRepayment: 300,
      interestRate: 2.5,
      tenureYearsRemaining: 4,
    };
    updateProfile((p) => ({ ...p, liabilities: [...p.liabilities, newItem] }));
  };

  const removeLiability = (id: string) => {
    updateProfile((p) => ({ ...p, liabilities: p.liabilities.filter((l) => l.id !== id) }));
  };

  const addPolicy = () => {
    const newPol: InsurancePolicy = {
      id: generateId("pol"),
      policyName: "Hospital Shield / Term Plan",
      insurer: "Insurance Provider",
      policyType: "term_life",
      deathBenefit: 200000,
      tpdBenefit: 200000,
      earlyCiBenefit: 50000,
      majorCiBenefit: 100000,
      disabilityIncomeMonthly: 0,
      annualPremium: 600,
      expiryAge: 65,
    };
    updateProfile((p) => ({ ...p, insurancePolicies: [...p.insurancePolicies, newPol] }));
  };

  const removePolicy = (id: string) => {
    updateProfile((p) => ({ ...p, insurancePolicies: p.insurancePolicies.filter((pol) => pol.id !== id) }));
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Wizard Progress Top Card */}
      <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">
            {currentStep === 1 && "About You & Your Family"}
            {currentStep === 2 && "Your Monthly Paycheck"}
            {currentStep === 3 && "Savings, Robos & Loans"}
            {currentStep === 4 && "Your Insurance Policies"}
            {currentStep === 5 && "Your Dream Goals & Timelines"}
          </span>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`h-2 rounded-full cursor-pointer transition-colors ${
                step <= currentStep ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Personal & Family */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Basic Details
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Let's set up your personal profile</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Name / Nickname</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Alex Lee"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Current Age</label>
                <input
                  type="number"
                  value={profile.currentAge || ""}
                  onChange={(e) => updateProfile((p) => ({ ...p, currentAge: parseNumberInput(e.target.value) }))}
                  className="mt-1 w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dream Retirement Age</label>
                <input
                  type="number"
                  value={profile.targetRetirementAge || ""}
                  onChange={(e) => updateProfile((p) => ({ ...p, targetRetirementAge: parseNumberInput(e.target.value) }))}
                  className="mt-1 w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Relationship Status</label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => updateProfile((p) => ({ ...p, maritalStatus: e.target.value as any }))}
                  className="mt-1 w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Type</label>
                <select
                  value={profile.employmentType}
                  onChange={(e) => updateProfile((p) => ({ ...p, employmentType: e.target.value as any }))}
                  className="mt-1 w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="employed">Full-Time Employee</option>
                  <option value="self-employed">Freelancer / Gig Worker</option>
                  <option value="business-owner">Business Owner / Founder</option>
                  <option value="civil-servant">Civil Servant</option>
                </select>
              </div>
            </div>

            {/* Investment Appetite & Risk Profiler */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Investment Risk Appetite
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Determines your portfolio expected growth rate
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRiskModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Min Diagnostic</span>
                </button>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {RISK_PROFILES_META[profile.riskProfile || "balanced"]?.title || "Balanced"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {RISK_PROFILES_META[profile.riskProfile || "balanced"]?.assetAllocation}
                  </span>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {profile.assumptions.investmentReturnRate}% p.a.
                </span>
              </div>
            </div>
          </div>

          {/* Dependents */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Loved Ones You Support
                </h3>
                <p className="text-[11px] text-slate-500">Parents you give allowances to, or children</p>
              </div>
              <button
                onClick={addDependent}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Person
              </button>
            </div>

            {profile.dependents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No dependents added. If you support parents or children, click "+ Add Person".
              </div>
            ) : (
              <div className="space-y-3">
                {profile.dependents.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={dep.name}
                        onChange={(e) => updateDependent(dep.id, { name: e.target.value })}
                        className="text-xs font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 px-1 py-0.5 outline-none flex-1"
                        placeholder="e.g. Mom / Dad / Child"
                      />
                      <select
                        value={dep.relationship}
                        onChange={(e) => updateDependent(dep.id, { relationship: e.target.value as any })}
                        className="text-[11px] bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="spouse">Spouse</option>
                        <option value="other">Other</option>
                      </select>
                      <button
                        onClick={() => removeDependent(dep.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold">Their Age</label>
                        <input
                          type="number"
                          value={dep.age || ""}
                          onChange={(e) => updateDependent(dep.id, { age: parseNumberInput(e.target.value) })}
                          className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold">Years of Support Needed</label>
                        <input
                          type="number"
                          value={dep.yearsOfSupportNeeded || ""}
                          onChange={(e) => updateDependent(dep.id, { yearsOfSupportNeeded: parseNumberInput(e.target.value) })}
                          className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Monthly Paycheck */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" /> Money Coming In (Monthly)
                </h3>
                <p className="text-[11px] text-slate-500">Your take-home salary, freelance gigs, or side hustles</p>
              </div>
              <button
                onClick={addIncome}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Income
              </button>
            </div>

            <div className="space-y-2">
              {profile.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="text"
                    value={inc.description}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        incomes: p.incomes.map((i) => (i.id === inc.id ? { ...i, description: e.target.value } : i)),
                      }))
                    }
                    className="flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    placeholder="e.g. Salary"
                  />
                  <div className="w-28 relative">
                    <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-semibold">{currency}</span>
                    <input
                      type="number"
                      value={inc.monthlyAmount || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          incomes: p.incomes.map((i) =>
                            i.id === inc.id ? { ...i, monthlyAmount: parseNumberInput(e.target.value) } : i
                          ),
                        }))
                      }
                      className="w-full bg-white dark:bg-slate-800 pl-8 pr-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                  <button onClick={() => removeIncome(inc.id)} className="text-rose-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-rose-500" /> Money Going Out (Monthly)
                </h3>
                <p className="text-[11px] text-slate-500">Rent, groceries, dining, phone bills, and fun spending</p>
              </div>
              <button
                onClick={addExpense}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bill
              </button>
            </div>

            <div className="space-y-2">
              {profile.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="text"
                    value={exp.description}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        expenses: p.expenses.map((ex) => (ex.id === exp.id ? { ...ex, description: e.target.value } : ex)),
                      }))
                    }
                    className="flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    placeholder="e.g. Groceries"
                  />
                  <div className="w-28 relative">
                    <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-semibold">{currency}</span>
                    <input
                      type="number"
                      value={exp.monthlyAmount || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          expenses: p.expenses.map((ex) =>
                            ex.id === exp.id ? { ...ex, monthlyAmount: parseNumberInput(e.target.value) } : ex
                          ),
                        }))
                      }
                      className="w-full bg-white dark:bg-slate-800 pl-8 pr-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                    />
                  </div>
                  <button onClick={() => removeExpense(exp.id)} className="text-rose-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Assets, Robos (with DCA) & Loans (with % & tenure) */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Assets & Robos */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Savings, Robos & Investments
                </h3>
                <p className="text-[11px] text-slate-500">Track current cash value + monthly DCA contributions (e.g. $100/mo)</p>
              </div>
              <button
                onClick={addAsset}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Account
              </button>
            </div>

            <div className="space-y-3">
              {profile.assets.map((ast) => (
                <div
                  key={ast.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={ast.description}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          assets: p.assets.map((a) => (a.id === ast.id ? { ...a, description: e.target.value } : a)),
                        }))
                      }
                      className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-1"
                      placeholder="e.g. Syfe Core Balanced"
                    />
                    <input
                      type="text"
                      value={ast.platformOrVehicle || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          assets: p.assets.map((a) => (a.id === ast.id ? { ...a, platformOrVehicle: e.target.value } : a)),
                        }))
                      }
                      className="text-[11px] bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 w-32"
                      placeholder="Platform / Broker"
                    />
                    <button onClick={() => removeAsset(ast.id)} className="text-rose-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Current Cash Value</label>
                      <input
                        type="number"
                        value={ast.currentValue || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            assets: p.assets.map((a) =>
                              a.id === ast.id ? { ...a, currentValue: parseNumberInput(e.target.value) } : a
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Monthly DCA ($/mo)</label>
                      <input
                        type="number"
                        value={ast.monthlyContribution || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            assets: p.assets.map((a) =>
                              a.id === ast.id ? { ...a, monthlyContribution: parseNumberInput(e.target.value) } : a
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-400"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Exp. Return (% p.a.)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={ast.expectedReturnRate || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            assets: p.assets.map((a) =>
                              a.id === ast.id ? { ...a, expectedReturnRate: parseNumberInput(e.target.value) } : a
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loans & Mortgages */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" /> Loans & Mortgages (with Amortization)
                </h3>
                <p className="text-[11px] text-slate-500">Track interest rate %, monthly repayments, and run-down schedule</p>
              </div>
              <button
                onClick={addLiability}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Loan
              </button>
            </div>

            <div className="space-y-3">
              {profile.liabilities.map((lia) => (
                <div
                  key={lia.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={lia.description}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          liabilities: p.liabilities.map((l) => (l.id === lia.id ? { ...l, description: e.target.value } : l)),
                        }))
                      }
                      className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-1"
                      placeholder="e.g. HDB Mortgage or Student Loan"
                    />
                    <button onClick={() => removeLiability(lia.id)} className="text-rose-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Remaining Debt</label>
                      <input
                        type="number"
                        value={lia.outstandingBalance || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            liabilities: p.liabilities.map((l) =>
                              l.id === lia.id ? { ...l, outstandingBalance: parseNumberInput(e.target.value) } : l
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Interest (% p.a.)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={lia.interestRate || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            liabilities: p.liabilities.map((l) =>
                              l.id === lia.id ? { ...l, interestRate: parseNumberInput(e.target.value) } : l
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold text-rose-600 dark:text-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Monthly Payment</label>
                      <input
                        type="number"
                        value={lia.monthlyRepayment || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            liabilities: p.liabilities.map((l) =>
                              l.id === lia.id ? { ...l, monthlyRepayment: parseNumberInput(e.target.value) } : l
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Years Left</label>
                      <input
                        type="number"
                        value={lia.tenureYearsRemaining || ""}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            liabilities: p.liabilities.map((l) =>
                              l.id === lia.id ? { ...l, tenureYearsRemaining: parseNumberInput(e.target.value) } : l
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Insurance Policies */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> Your Current Insurance Cover & Savings Plans
                </h3>
                <p className="text-[11px] text-slate-500">Term life, Whole Life, Endowments (with cash values), or Hospital plans</p>
              </div>
              <button
                onClick={addPolicy}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Policy
              </button>
            </div>

            {profile.insurancePolicies.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No policies recorded yet. If you have insurance, click "+ Add Policy".
              </div>
            ) : (
              <div className="space-y-3">
                {profile.insurancePolicies.map((pol) => {
                  const hasCashValue =
                    pol.policyType === "whole_life" ||
                    pol.policyType === "endowment" ||
                    pol.policyType === "ilp";

                  return (
                    <div
                      key={pol.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={pol.policyName}
                          onChange={(e) =>
                            updateProfile((p) => ({
                              ...p,
                              insurancePolicies: p.insurancePolicies.map((x) =>
                                x.id === pol.id ? { ...x, policyName: e.target.value } : x
                              ),
                            }))
                          }
                          className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-1"
                          placeholder="e.g. Great Eastern Whole Life"
                        />
                        <select
                          value={pol.policyType}
                          onChange={(e) =>
                            updateProfile((p) => ({
                              ...p,
                              insurancePolicies: p.insurancePolicies.map((x) =>
                                x.id === pol.id ? { ...x, policyType: e.target.value as any } : x
                              ),
                            }))
                          }
                          className="text-[11px] font-semibold bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700"
                        >
                          <option value="term_life">Term Life (Pure Protection)</option>
                          <option value="whole_life">Whole Life (Protection + Cash Value)</option>
                          <option value="endowment">Endowment / Savings Plan</option>
                          <option value="ilp">Investment-Linked (ILP)</option>
                          <option value="critical_illness">Critical Illness Plan</option>
                          <option value="hospital_surgical">Hospital / Shield Plan</option>
                        </select>
                        <button onClick={() => removePolicy(pol.id)} className="text-rose-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Protection Coverage Inputs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold">Life / Disability Payout</label>
                          <input
                            type="number"
                            value={pol.deathBenefit || ""}
                            onChange={(e) =>
                              updateProfile((p) => ({
                                ...p,
                                insurancePolicies: p.insurancePolicies.map((x) =>
                                  x.id === pol.id
                                    ? { ...x, deathBenefit: parseNumberInput(e.target.value), tpdBenefit: parseNumberInput(e.target.value) }
                                    : x
                                ),
                              }))
                            }
                            className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold">Critical Illness Payout</label>
                          <input
                            type="number"
                            value={pol.majorCiBenefit || ""}
                            onChange={(e) =>
                              updateProfile((p) => ({
                                ...p,
                                insurancePolicies: p.insurancePolicies.map((x) =>
                                  x.id === pol.id ? { ...x, majorCiBenefit: parseNumberInput(e.target.value) } : x
                                ),
                              }))
                            }
                            className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                      </div>

                      {/* Cash Value & Maturity Inputs for Savings/Whole Life/Endowment */}
                      {hasCashValue && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <span>💰 Cash Value & Savings Component</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold">
                                Current Cash / Surrender Value ({currency})
                              </label>
                              <input
                                type="number"
                                value={pol.currentCashValue || ""}
                                onChange={(e) =>
                                  updateProfile((p) => ({
                                    ...p,
                                    insurancePolicies: p.insurancePolicies.map((x) =>
                                      x.id === pol.id ? { ...x, currentCashValue: parseNumberInput(e.target.value) } : x
                                    ),
                                  }))
                                }
                                className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-700 dark:text-emerald-300"
                                placeholder="e.g. 5000"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold">
                                Projected Maturity Payout ({currency})
                              </label>
                              <input
                                type="number"
                                value={pol.projectedRetirementMaturityValue || ""}
                                onChange={(e) =>
                                  updateProfile((p) => ({
                                    ...p,
                                    insurancePolicies: p.insurancePolicies.map((x) =>
                                      x.id === pol.id
                                        ? { ...x, projectedRetirementMaturityValue: parseNumberInput(e.target.value) }
                                        : x
                                    ),
                                  }))
                                }
                                className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                                placeholder="e.g. 80000"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            💡 Cash values in Whole Life and Endowment policies are automatically counted toward your Net Worth and future retirement goal!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: Goals & Retirement in Today's Dollars */}
      {currentStep === 5 && (
        <div className="space-y-4">
          {/* Retirement in Today's Dollars Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" /> Desired Retirement Lifestyle (In Today's Value)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                How much monthly spending power would you like to have when you retire?
              </p>
            </div>

            {/* Lifestyle Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    desiredMonthlyRetirementSpendToday: 2000,
                    retirementLifestylePreset: "basic",
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  profile.desiredMonthlyRetirementSpendToday === 2000
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold block">🛋️ Lean / Basic</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{currency} 2,000/mo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    desiredMonthlyRetirementSpendToday: 3500,
                    retirementLifestylePreset: "comfortable",
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  profile.desiredMonthlyRetirementSpendToday === 3500
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold block">☕ Comfortable</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{currency} 3,500/mo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    desiredMonthlyRetirementSpendToday: 5500,
                    retirementLifestylePreset: "abundant",
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  profile.desiredMonthlyRetirementSpendToday === 5500
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold block">✈️ Travel & Active</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{currency} 5,500/mo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Desired Spend in Today's Dollars ({currency}/month)
                </label>
                <input
                  type="number"
                  value={profile.desiredMonthlyRetirementSpendToday || ""}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      desiredMonthlyRetirementSpendToday: parseNumberInput(e.target.value),
                      retirementLifestylePreset: "custom",
                    }))
                  }
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Plan Living Until Age (Longevity Horizon)
                </label>
                <input
                  type="number"
                  value={profile.lifeExpectancy || ""}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      lifeExpectancy: parseNumberInput(e.target.value),
                    }))
                  }
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
                />
              </div>
            </div>

            {/* Explanation Box */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              💡 <strong>How it works:</strong> If you want <strong>{currency} {(profile.desiredMonthlyRetirementSpendToday || 3000).toLocaleString()}/month</strong> today, the system automatically inflates it for {profile.targetRetirementAge - profile.currentAge} years of inflation so your future nest egg buys the exact same lifestyle from Age {profile.targetRetirementAge} to {profile.lifeExpectancy || 88} ({Math.max(5, (profile.lifeExpectancy || 88) - profile.targetRetirementAge)} years of retirement)!
            </div>
          </div>

          {/* CPF LIFE / Guaranteed Retirement Annuity Floor Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" /> CPF LIFE / Guaranteed Lifetime Annuity
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your government-backed monthly payout foundation starting from Age 65 for life
                </p>
              </div>
              <input
                type="checkbox"
                checked={profile.cpfLife?.isEnabled !== false}
                onChange={(e) =>
                  updateProfile((p) => ({
                    ...p,
                    cpfLife: {
                      ...(p.cpfLife || {
                        planTier: "full_frs",
                        estimatedMonthlyPayoutToday: 1650,
                        payoutStartAge: 65,
                      }),
                      isEnabled: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {profile.cpfLife?.isEnabled !== false && (
              <div className="space-y-3 pt-1">
                {/* CPF LIFE Tiers */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateProfile((p) => ({
                        ...p,
                        cpfLife: {
                          ...(p.cpfLife || { payoutStartAge: 65 }),
                          isEnabled: true,
                          planTier: "basic_brs",
                          estimatedMonthlyPayoutToday: 900,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      profile.cpfLife?.planTier === "basic_brs"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold block">Basic (BRS)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">~{currency} 900/mo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateProfile((p) => ({
                        ...p,
                        cpfLife: {
                          ...(p.cpfLife || { payoutStartAge: 65 }),
                          isEnabled: true,
                          planTier: "full_frs",
                          estimatedMonthlyPayoutToday: 1650,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      profile.cpfLife?.planTier === "full_frs" || !profile.cpfLife?.planTier
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold block">Full (FRS)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">~{currency} 1,650/mo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateProfile((p) => ({
                        ...p,
                        cpfLife: {
                          ...(p.cpfLife || { payoutStartAge: 65 }),
                          isEnabled: true,
                          planTier: "enhanced_ers",
                          estimatedMonthlyPayoutToday: 2600,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      profile.cpfLife?.planTier === "enhanced_ers"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold block">Enhanced (ERS)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">~{currency} 2,600/mo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">
                      Estimated Monthly Payout ({currency}/mo)
                    </label>
                    <input
                      type="number"
                      value={profile.cpfLife?.estimatedMonthlyPayoutToday ?? ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          cpfLife: {
                            ...(p.cpfLife || { planTier: "custom", payoutStartAge: 65 }),
                            isEnabled: true,
                            estimatedMonthlyPayoutToday: parseNumberInput(e.target.value),
                            planTier: "custom",
                          },
                        }))
                      }
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">
                      Payout Start Age (Govt Std: 65)
                    </label>
                    <input
                      type="number"
                      value={profile.cpfLife?.payoutStartAge || ""}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          cpfLife: {
                            ...(p.cpfLife || { planTier: "full_frs", estimatedMonthlyPayoutToday: 1650 }),
                            isEnabled: true,
                            payoutStartAge: parseNumberInput(e.target.value),
                          },
                        }))
                      }
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
                    />
                  </div>
                </div>

                {/* Retirement Split Callout */}
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>🛡️ Total Desired Spend:</span>
                    <span>{currency} {(profile.desiredMonthlyRetirementSpendToday || 3000).toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                    <span>- CPF LIFE Guaranteed Floor (Age 65+):</span>
                    <span>{currency} {(profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650).toLocaleString()}/mo</span>
                  </div>
                  <div className="pt-1 border-t border-emerald-200 dark:border-emerald-800 font-extrabold flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                    <span>= Remaining Private Gap to Invest For:</span>
                    <span>
                      {currency}{" "}
                      {Math.max(
                        0,
                        (profile.desiredMonthlyRetirementSpendToday || 3000) -
                          (profile.cpfLife?.estimatedMonthlyPayoutToday ?? 1650)
                      ).toLocaleString()}
                      /mo
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3-Bucket Milestone Goals Card */}
          <div className="fin-card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Short & Mid-Term Life Goals
                </h3>
                <p className="text-[11px] text-slate-500">Wedding, BTO house downpayment, renovation, or car</p>
              </div>
            </div>

            {/* Pre-set Templates */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const newG: FinancialGoal = {
                    id: generateId("goal"),
                    name: "Wedding & Honeymoon",
                    category: "wedding",
                    horizonBucket: "short_term",
                    targetYearsFromNow: 2,
                    targetAmount: 25000,
                    currentSavingsAssigned: 5000,
                    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
                  };
                  updateProfile((p) => ({ ...p, goals: [...p.goals, newG] }));
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                💍 + Add Wedding ($25k in 2y)
              </button>

              <button
                type="button"
                onClick={() => {
                  const newG: FinancialGoal = {
                    id: generateId("goal"),
                    name: "BTO House Downpayment",
                    category: "property",
                    horizonBucket: "mid_term",
                    targetYearsFromNow: 4,
                    targetAmount: 50000,
                    currentSavingsAssigned: 10000,
                    recommendedVehicle: "Balanced Robo-Advisor (4.5%)",
                  };
                  updateProfile((p) => ({ ...p, goals: [...p.goals, newG] }));
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                🏠 + Add BTO Downpmt ($50k in 4y)
              </button>

              <button
                type="button"
                onClick={() => {
                  const newG: FinancialGoal = {
                    id: generateId("goal"),
                    name: "Home Renovation",
                    category: "renovation",
                    horizonBucket: "short_term",
                    targetYearsFromNow: 3,
                    targetAmount: 30000,
                    currentSavingsAssigned: 5000,
                    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
                  };
                  updateProfile((p) => ({ ...p, goals: [...p.goals, newG] }));
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                🛋️ + Add Reno ($30k in 3y)
              </button>

              <button
                type="button"
                onClick={() => {
                  const newG: FinancialGoal = {
                    id: generateId("goal"),
                    name: "Dream Holiday",
                    category: "travel",
                    horizonBucket: "short_term",
                    targetYearsFromNow: 1.5,
                    targetAmount: 8000,
                    currentSavingsAssigned: 2000,
                    recommendedVehicle: "High-Yield Bank Cash (3.2%)",
                  };
                  updateProfile((p) => ({ ...p, goals: [...p.goals, newG] }));
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                ✈️ + Add Holiday ($8k in 1.5y)
              </button>
            </div>

            {/* Current Goals List */}
            {profile.goals.filter((g) => g.category !== "retirement").length > 0 && (
              <div className="space-y-2.5 pt-2">
                {profile.goals
                  .filter((g) => g.category !== "retirement")
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={goal.name}
                          onChange={(e) =>
                            updateProfile((p) => ({
                              ...p,
                              goals: p.goals.map((x) => (x.id === goal.id ? { ...x, name: e.target.value } : x)),
                            }))
                          }
                          className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => updateProfile((p) => ({ ...p, goals: p.goals.filter((x) => x.id !== goal.id) }))}
                          className="text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Target Cost ({currency})</label>
                          <input
                            type="number"
                            value={goal.targetAmount || ""}
                            onChange={(e) =>
                              updateProfile((p) => ({
                                ...p,
                                goals: p.goals.map((x) =>
                                  x.id === goal.id ? { ...x, targetAmount: parseNumberInput(e.target.value) } : x
                                ),
                              }))
                            }
                            className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Years to Goal</label>
                          <input
                            type="number"
                            step="0.5"
                            value={goal.targetYearsFromNow || ""}
                            onChange={(e) =>
                              updateProfile((p) => ({
                                ...p,
                                goals: p.goals.map((x) =>
                                  x.id === goal.id ? { ...x, targetYearsFromNow: parseNumberInput(e.target.value) } : x
                                ),
                              }))
                            }
                            className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Saved in Bank</label>
                          <input
                            type="number"
                            value={goal.currentSavingsAssigned || ""}
                            onChange={(e) =>
                              updateProfile((p) => ({
                                ...p,
                                goals: p.goals.map((x) =>
                                  x.id === goal.id ? { ...x, currentSavingsAssigned: parseNumberInput(e.target.value) } : x
                                ),
                              }))
                            }
                            className="w-full bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("shortfall")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> See My Safety Results
          </button>
        )}
      </div>

      <RiskProfilerModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} />
    </div>
  );
};
