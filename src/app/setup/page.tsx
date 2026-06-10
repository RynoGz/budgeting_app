"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FixedExpense = {
  name: string;
  category: string;
  amount: string;
};

export default function SetupPage() {
  const router = useRouter();

  const [salary, setSalary] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");

  const [fixedExpenses, setFixedExpenses] = useState<
    FixedExpense[]
  >([
    {
      name: "",
      category: "",
      amount: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function addExpenseRow() {
    setFixedExpenses([
      ...fixedExpenses,
      {
        name: "",
        category: "",
        amount: "",
      },
    ]);
  }

  function updateExpense(
    index: number,
    field: keyof FixedExpense,
    value: string
  ) {
    const updatedExpenses = [...fixedExpenses];

    updatedExpenses[index][field] = value;

    setFixedExpenses(updatedExpenses);
  }

  async function handleSaveTemplate() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in.");
        return;
      }

      const { data: template, error: templateError } =
        await supabase
          .from("budget_templates")
          .insert({
            user_id: user.id,
            default_salary: Number(salary),
            default_savings_goal: Number(
              savingsGoal
            ),
          })
          .select()
          .single();

      if (templateError) {
        throw templateError;
      }

      const validExpenses = fixedExpenses.filter(
        (expense) =>
          expense.name.trim() &&
          expense.category.trim() &&
          expense.amount.trim()
      );

      if (validExpenses.length > 0) {
        const expensesToInsert =
          validExpenses.map((expense) => ({
            template_id: template.id,
            name: expense.name,
            category: expense.category,
            amount: Number(expense.amount),
          }));

        const { error: expensesError } =
          await supabase
            .from("fixed_expenses")
            .insert(expensesToInsert);

        if (expensesError) {
          throw expensesError;
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Budget Setup
          </h1>
          <p className="text-slate-600">Configure your default budget template</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">

          {/* Salary Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Default Monthly Salary
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-semibold">R</span>
              <input
                type="number"
                placeholder="0.00"
                value={salary}
                onChange={(e) =>
                  setSalary(e.target.value)
                }
                className="w-full pl-8 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Savings Goal Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Default Savings Goal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-semibold">R</span>
              <input
                type="number"
                placeholder="0.00"
                value={savingsGoal}
                onChange={(e) =>
                  setSavingsGoal(e.target.value)
                }
                className="w-full pl-8 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fixed Expenses Section */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Fixed Expenses
            </h2>

            <div className="space-y-3">
              {fixedExpenses.map(
                (expense, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="text"
                      placeholder="Expense Name"
                      value={expense.name}
                      onChange={(e) =>
                        updateExpense(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      className="px-4 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="text"
                      placeholder="Category"
                      value={expense.category}
                      onChange={(e) =>
                        updateExpense(
                          index,
                          "category",
                          e.target.value
                        )
                      }
                      className="px-4 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">R</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) =>
                          updateExpense(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        className="w-full pl-6 px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              onClick={addExpenseRow}
              className="mt-4 w-full px-4 py-2 border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              + Add Fixed Expense
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg text-sm border ${
              message.includes("success")
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-100 transition-all font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading
                ? "Saving..."
                : "Save Template"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}