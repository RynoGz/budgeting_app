"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MonthlyBudget = {
  id: string;
  month: number;
  year: number;
  salary: number;
  savings_goal: number;
};

export default function HistoryPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [budgets, setBudgets] =
    useState<MonthlyBudget[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } =
        await supabase
          .from("monthly_budgets")
          .select(
            "id, month, year, salary, savings_goal"
          )
          .eq("user_id", user.id)
          .order("year", {
            ascending: false,
          })
          .order("month", {
            ascending: false,
          });

      if (!error && data) {
        setBudgets(data);
      }

      setLoading(false);
    }

    loadHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          History
        </h1>

        <button
          onClick={() =>
            router.push("/dashboard")
          }
          className="border px-4 py-2 rounded"
        >
          Dashboard
        </button>
      </div>

      {budgets.length === 0 ? (
  <p>No budgets found.</p>
) : (
  <div className="grid md:grid-cols-2 gap-6">
    {budgets.map((budget) => (
      <div
        key={budget.id}
        className="
          border
          rounded-xl
          p-6
          shadow-sm
          hover:shadow-md
          transition
        "
      >
        <h2 className="text-xl font-bold mb-4">
          {new Date(
            budget.year,
            budget.month - 1
          ).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">
              Income
            </p>

            <p className="font-semibold">
              R
              {budget.salary.toLocaleString()}
            </p>
          </div>

          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">
              Savings Goal
            </p>

            <p className="font-semibold">
              R
              {budget.savings_goal.toLocaleString()}
            </p>
          </div>
        </div>

        <button
  onClick={() =>
    router.push(
      `/history/${budget.id}`
    )
  }
  className="
    mt-4
    w-full
    border
    rounded
    py-2
  "
>
  View Details
</button>
      </div>
    ))}
  </div>
)}
    </div>
  );
}