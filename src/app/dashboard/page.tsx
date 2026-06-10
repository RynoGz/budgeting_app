"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Budget = {
  salary: number;
  savings_goal: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);

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

      const { data } = await supabase
        .from("budgets")
        .select("salary, savings_goal")
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .single();

      if (data) {
        setBudget(data);
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
    return <div className="p-8">Loading...</div>;
  }

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
          <p>No budget created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="font-semibold">
              Salary
            </h2>
            <p>R{budget.salary}</p>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold">
              Savings Goal
            </h2>
            <p>R{budget.savings_goal}</p>
          </div>
        </div>
      )}
    </div>
  );
}

