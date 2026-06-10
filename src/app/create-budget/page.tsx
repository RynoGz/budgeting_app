"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

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
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Create Monthly Budget</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Set up your monthly budget and fixed expenses</p>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 space-y-6">

            {/* Salary Section */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                Monthly Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500 font-semibold">R</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) =>
                    setSalary(e.target.value)
                  }
                  placeholder="0.00"
                  className="w-full pl-8 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Savings Goal Section */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                Monthly Savings Goal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500 font-semibold">R</span>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) =>
                    setSavingsGoal(e.target.value)
                  }
                  placeholder="0.00"
                  className="w-full pl-8 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fixed Expenses Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Fixed Expenses
              </h2>

              {fixedExpenses.length > 0 && (
                <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  {fixedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex gap-3 items-center bg-white dark:bg-slate-700 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {expense.name}
                        </p>
                      </div>

                      <div className="relative w-32">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">R</span>
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) =>
                            updateExpenseAmount(
                              expense.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-full pl-6 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Fixed Expense Form */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Add Fixed Expense
                </h3>

                <div className="space-y-3">

                  <input
                    type="text"
                    placeholder="Expense Name (e.g., Rent, Internet)"
                    value={newExpenseName}
                    onChange={(e) =>
                      setNewExpenseName(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Category (e.g., Housing, Utilities)"
                    value={newExpenseCategory}
                    onChange={(e) =>
                      setNewExpenseCategory(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-500">R</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpenseAmount}
                      onChange={(e) =>
                        setNewExpenseAmount(
                          e.target.value
                        )
                      }
                      className="w-full pl-8 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addFixedExpense}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Add Fixed Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) =>
                  setSaveAsDefault(
                    e.target.checked
                  )
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-slate-900 dark:text-slate-200 font-medium">
                Save as my default budget template
              </span>
            </label>

            {/* Error/Success Message */}
            {message && (
              <div className={`p-4 rounded-lg text-sm border ${
                message.includes("success") || message.includes("success")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
              }`}>
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateBudget}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading
                  ? "Creating..."
                  : "Create Budget"}
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}