"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Budget History</h1>
            <p className="text-slate-600 dark:text-slate-400">View all your past monthly budgets</p>
          </div>

          {budgets.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No budgets found</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">You have not created any budgets yet.</p>
              <button
                onClick={() => router.push("/create-budget")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <h2 className="text-xl font-bold">
                      {new Date(
                        budget.year,
                        budget.month - 1
                      ).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Income</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        R{budget.salary.toLocaleString()}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Savings Goal</p>
                      <p className="text-2xl font-bold text-green-600">
                        R{budget.savings_goal.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/history/${budget.id}`
                        )
                      }
                      className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg group-hover:shadow-lg"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );

  
}