"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateBudgetPage() {
  const router = useRouter();

  const [salary, setSalary] = useState("");
  const [savingsGoal, setSavingsGoal] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTemplate() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("budget_templates")
        .select(
          "id, default_salary, default_savings_goal"
        )
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSalary(
          data.default_salary.toString()
        );

        setSavingsGoal(
          data.default_savings_goal.toString()
        );
      }
    }

    loadTemplate();
  }, []);

  async function handleCreateBudget() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("User not found.");
        return;
      }

      const now = new Date();

      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: budget, error: budgetError } =
        await supabase
          .from("monthly_budgets")
          .insert({
            user_id: user.id,
            month,
            year,
            salary: Number(salary),
            savings_goal: Number(savingsGoal),
          })
          .select()
          .single();

      if (budgetError) {
        throw budgetError;
      }

      const { data: template, error: templateError } =
        await supabase
          .from("budget_templates")
          .select("id")
          .eq("user_id", user.id)
          .single();

      if (templateError) {
        throw templateError;
      }

      const {
        data: fixedExpenses,
        error: fixedExpensesError,
      } = await supabase
        .from("fixed_expenses")
        .select("*")
        .eq("template_id", template.id);

        console.log("Template:", template);
console.log("Fixed Expenses:", fixedExpenses);
console.log(
  "Fixed Expenses Error:",
  fixedExpensesError
);

      if (fixedExpensesError) {
        throw fixedExpensesError;
      }

      if (
        fixedExpenses &&
        fixedExpenses.length > 0
      ) {
        console.log(
  "Preparing to copy expenses:",
  fixedExpenses
);
        const expensesToInsert =
          fixedExpenses.map((expense) => ({
            monthly_budget_id: budget.id,
            name: expense.name,
            category: expense.category,
            amount: expense.amount,
          }));

        const { error: copyError } =
          await supabase
            .from("monthly_fixed_expenses")
            .insert(expensesToInsert);

        if (copyError) {
          throw copyError;
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
  setMessage(error.message);
} else {
  setMessage("Failed to create budget.");
}
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="border p-6 rounded-lg space-y-4">
        <h1 className="text-2xl font-bold">
          Create Monthly Budget
        </h1>

        <input
          type="number"
          value={salary}
          onChange={(e) =>
            setSalary(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          value={savingsGoal}
          onChange={(e) =>
            setSavingsGoal(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <button
          type="button"
          onClick={handleCreateBudget}
          disabled={loading}
          className="w-full border p-2 rounded"
        >
          {loading
            ? "Creating..."
            : "Create Budget"}
        </button>

        {message && (
          <p className="text-red-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}