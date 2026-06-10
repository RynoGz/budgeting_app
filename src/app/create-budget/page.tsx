"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FixedExpense = {
  id: string;
  name: string;
  category: string;
  amount: number;
};

export default function CreateBudgetPage() {
  const router = useRouter();

  const [salary, setSalary] = useState("");
  const [savingsGoal, setSavingsGoal] =
    useState("");
  const [fixedExpenses, setFixedExpenses] =
    useState<FixedExpense[]>([]);

  const [saveAsDefault, setSaveAsDefault] =
    useState(false);

  const [newExpenseName, setNewExpenseName] =
    useState("");

  const [newExpenseCategory, setNewExpenseCategory] =
    useState("");

  const [newExpenseAmount, setNewExpenseAmount] =
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

        const {
        data: expenseData,
        error: expenseError,
        } = await supabase
        .from("fixed_expenses")
        .select("*")
        .eq("template_id", data.id);

        if (!expenseError && expenseData) {
        setFixedExpenses(expenseData);
        }
    }
      }
      

    loadTemplate();
  }, []);

  function updateExpenseAmount(
  id: string,
  value: number
) {
  setFixedExpenses((prev) =>
    prev.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            amount: value,
          }
        : expense
    )
  );
}
    function addFixedExpense() {
  if (
    !newExpenseName.trim() ||
    !newExpenseCategory.trim() ||
    !newExpenseAmount
  ) {
    return;
  }

  setFixedExpenses((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      name: newExpenseName,
      category: newExpenseCategory,
      amount: Number(newExpenseAmount),
    },
  ]);

  setNewExpenseName("");
  setNewExpenseCategory("");
  setNewExpenseAmount("");
}

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

      if (saveAsDefault) {
  for (const expense of fixedExpenses) {
  const isNewExpense =
    expense.id.length > 30;

  if (isNewExpense) {
    const {
      error: insertError,
    } = await supabase
      .from("fixed_expenses")
      .insert({
        template_id: template.id,
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
      });

    if (insertError) {
      throw insertError;
    }
  } else {
    const {
      error: updateError,
    } = await supabase
      .from("fixed_expenses")
      .update({
        amount: expense.amount,
      })
      .eq("id", expense.id);

    if (updateError) {
      throw updateError;
    }
  }
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

        <label className="block mb-1 font-medium">
        Salary
       </label>
        <input
          type="number"
          value={salary}
          onChange={(e) =>
            setSalary(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <label className="block mb-1 font-medium">
          Savings Goal
        </label>
        <input
          type="number"
          value={savingsGoal}
          onChange={(e) =>
            setSavingsGoal(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

                <div>
        <h2 className="font-semibold mb-3">
            Fixed Expenses
        </h2>

        <div className="space-y-3">
            {fixedExpenses.map((expense) => (
            <div
                key={expense.id}
                className="flex gap-2 items-center"
            >
                <span className="w-40">
                {expense.name}
                </span>

                <input
                type="number"
                value={expense.amount}
                onChange={(e) =>
                    updateExpenseAmount(
                    expense.id,
                    Number(e.target.value)
                    )
                }
                className="flex-1 border p-2 rounded"
                />
            </div>
            ))}
        </div>
        </div>
        <div className="border-t pt-4 mt-4">
  <h3 className="font-medium mb-3">
    Add Fixed Expense
  </h3>

  <div className="space-y-3">

    <input
      type="text"
      placeholder="Expense Name"
      value={newExpenseName}
      onChange={(e) =>
        setNewExpenseName(
          e.target.value
        )
      }
      className="w-full border p-2 rounded"
    />

    <input
      type="text"
      placeholder="Category"
      value={newExpenseCategory}
      onChange={(e) =>
        setNewExpenseCategory(
          e.target.value
        )
      }
      className="w-full border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Amount"
      value={newExpenseAmount}
      onChange={(e) =>
        setNewExpenseAmount(
          e.target.value
        )
      }
      className="w-full border p-2 rounded"
    />

    <button
      type="button"
      onClick={addFixedExpense}
      className="border px-4 py-2 rounded"
    >
      Add Fixed Expense
    </button>
  </div>
</div>

                <label className="flex items-center gap-2">
        <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) =>
            setSaveAsDefault(
                e.target.checked
            )
            }
        />

        Save these changes as my new defaults
        </label>

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