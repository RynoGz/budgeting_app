"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BudgetPage() {
  const [salary, setSalary] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");

  const [message, setMessage] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const currentDate = new Date();

    const { error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        salary: Number(salary),
        savings_goal: Number(savingsGoal),
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Budget saved!");
      setSalary("");
      setSavingsGoal("");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-6 rounded-lg"
      >
        <h1 className="text-2xl font-bold">
          Monthly Budget
        </h1>

        <input
          type="number"
          placeholder="Salary"
          value={salary}
          onChange={(e) =>
            setSalary(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Savings Goal"
          value={savingsGoal}
          onChange={(e) =>
            setSavingsGoal(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full border p-2 rounded"
        >
          Save Budget
        </button>

        {message && (
          <p className="text-sm">{message}</p>
        )}
      </form>
    </div>
  );
}