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
    <div className="max-w-3xl mx-auto mt-10">
      <div className="space-y-6 border p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Budget Setup
        </h1>

        <input
          type="number"
          placeholder="Default Salary"
          value={salary}
          onChange={(e) =>
            setSalary(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Default Savings Goal"
          value={savingsGoal}
          onChange={(e) =>
            setSavingsGoal(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Fixed Expenses
          </h2>

          <div className="space-y-3">
            {fixedExpenses.map(
              (expense, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-3"
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
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
                  />

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
                    className="border p-2 rounded"
                  />
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={addExpenseRow}
            className="mt-4 border px-4 py-2 rounded"
          >
            + Add Fixed Expense
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={loading}
            className="border px-4 py-2 rounded"
          >
            {loading
              ? "Saving..."
              : "Save Template"}
          </button>
        </div>

        {message && (
          <p className="text-sm text-red-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}