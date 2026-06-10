"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-8">
        Budget not found.
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
    <div className="p-8 max-w-5xl mx-auto">

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
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

        <button
          onClick={() =>
            router.push("/history")
          }
          className="border px-4 py-2 rounded"
        >
          Back
        </button>

      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <div className="border p-4 rounded">
          <h2>Income</h2>
          <p>
            R
            {budget.salary.toLocaleString()}
          </p>
        </div>

        <div className="border p-4 rounded">
          <h2>Savings Goal</h2>
          <p>
            R
            {budget.savings_goal.toLocaleString()}
          </p>
        </div>

        <div className="border p-4 rounded">
          <h2>Spent</h2>
          <p>
            R
            {spent.toLocaleString()}
          </p>
        </div>

        <div className="border p-4 rounded">
          <h2>Remaining</h2>
          <p>
            R
            {remaining.toLocaleString()}
          </p>
        </div>

      </div>

      <div className="border rounded p-4 mb-6">

        <h2 className="font-semibold mb-3">
          Fixed Expenses
        </h2>

        <div className="space-y-2">
          {fixedExpenses.map(
            (expense) => (
              <div
                key={expense.id}
                className="flex justify-between"
              >
                <span>
                  {expense.name}
                </span>

                <span>
                  R
                  {expense.amount.toLocaleString()}
                </span>
              </div>
            )
          )}
        </div>

      </div>

      <div className="border rounded p-4">

        <h2 className="font-semibold mb-3">
          Expenses
        </h2>

        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="border rounded p-3"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {expense.category}
                  </p>

                  <p className="text-sm text-gray-500">
                    {expense.description}
                  </p>
                </div>

                <span>
                  R
                  {expense.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}