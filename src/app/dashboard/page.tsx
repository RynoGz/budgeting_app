"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Budget = {
  id: string;
  salary: number;
  savings_goal: number;
};

type FixedExpense = {
  id: string;
  name: string;
  amount: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [budget, setBudget] =
    useState<Budget | null>(null);

  const [fixedExpenses, setFixedExpenses] =
    useState<FixedExpense[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const now = new Date();

      const {
        data: budgetData,
        error: budgetError,
      } = await supabase
        .from("monthly_budgets")
        .select(
          "id, salary, savings_goal"
        )
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .single();

      if (budgetError || !budgetData) {
        setLoading(false);
        return;
      }

      setBudget(budgetData);

      const {
        data: expenseData,
        error: expenseError,
      } = await supabase
        .from("monthly_fixed_expenses")
        .select("id, name, amount")
        .eq(
          "monthly_budget_id",
          budgetData.id
        );

      if (!expenseError && expenseData) {
        setFixedExpenses(expenseData);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  const totalFixedExpenses =
    fixedExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

  const availableToSpend =
    budget
      ? budget.salary -
        budget.savings_goal -
        totalFixedExpenses
      : 0;

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="border px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {!budget ? (
        <div>
          <p>
            No budget created for this
            month.
          </p>

          <button
            onClick={() =>
              router.push(
                "/create-budget"
              )
            }
            className="mt-4 border px-4 py-2 rounded"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Income
              </h2>
              <p>
                R
                {budget.salary.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Savings Goal
              </h2>
              <p>
                R
                {budget.savings_goal.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Fixed Expenses
              </h2>
              <p>
                R
                {totalFixedExpenses.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Available To Spend
              </h2>
              <p>
                R
                {availableToSpend.toLocaleString()}
              </p>
            </div>

          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-4">
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
        </>
      )}
    </div>
  );
}