"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

type Budget = {
  id: string;
  month: number;
  year: number;
  salary: number;
  savings_goal: number;
};

type FixedExpense = {
  id: string;
  name: string;
  amount: number;
};

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
};

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [budget, setBudget] =
    useState<Budget | null>(null);

  const [fixedExpenses, setFixedExpenses] =
    useState<FixedExpense[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  useEffect(() => {
    async function loadBudget() {
      const budgetId = params.id;

      const {
        data: budgetData,
        error: budgetError,
      } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("id", budgetId)
        .single();

      if (budgetError || !budgetData) {
        setLoading(false);
        return;
      }

      setBudget(budgetData);

      const {
        data: fixedData,
      } = await supabase
        .from("monthly_fixed_expenses")
        .select("*")
        .eq(
          "monthly_budget_id",
          budgetId
        );

      if (fixedData) {
        setFixedExpenses(fixedData);
      }

      const {
        data: expenseData,
      } = await supabase
        .from("expenses")
        .select("*")
        .eq(
          "monthly_budget_id",
          budgetId
        );

      if (expenseData) {
        setExpenses(expenseData);
      }

      setLoading(false);
    }

    loadBudget();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading budget details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Budget not found</h2>
            <button
              onClick={() => router.push("/history")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalFixedExpenses =
    fixedExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

  const spent =
    expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

  const remaining =
    budget.salary -
    budget.savings_goal -
    totalFixedExpenses -
    spent;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                {new Date(
                  budget.year,
                  budget.month - 1
                ).toLocaleString(
                  "default",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Budget Details</p>
            </div>

            <button
              onClick={() =>
                router.push("/history")
              }
              className="px-6 py-3 rounded-lg border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-semibold"
            >
              ← Back
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Income</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    R{budget.salary.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Savings Goal</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    R{budget.savings_goal.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Spent</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    R{spent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
              remaining >= 0
                ? 'bg-white dark:bg-slate-800'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Remaining</p>
                  <p className={`text-3xl font-bold mt-2 ${
                    remaining >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    R{remaining.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  remaining >= 0
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <svg className={`w-6 h-6 ${
                    remaining >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Fixed Expenses Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Fixed Expenses
            </h2>

            {fixedExpenses.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No fixed expenses for this month.</p>
            ) : (
              <div className="space-y-3">
                {fixedExpenses.map(
                  (expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">
                        {expense.name}
                      </span>

                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        R{expense.amount.toLocaleString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

          </div>

          {/* Expenses Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Expenses
            </h2>

            {expenses.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No expenses recorded for this month.</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                            {expense.category}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {expense.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {new Date(expense.expense_date).toLocaleDateString('en-ZA')}
                        </p>
                      </div>

                      <span className="text-lg font-bold text-slate-900 dark:text-white ml-4">
                        R{expense.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}