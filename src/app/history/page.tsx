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
    <div className="p-8 max-w-4xl mx-auto">
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
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="border p-4 rounded"
            >
              <h2 className="font-semibold text-lg">
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
              </h2>

              <div className="mt-2 space-y-1">
                <p>
                  Income: R
                  {budget.salary.toLocaleString()}
                </p>

                <p>
                  Savings Goal: R
                  {budget.savings_goal.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}