"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Budget = {
  id: string;
  salary: number;
  savings_goal: number;
};

type FixedExpense = {
  id: string;
  name: string;
  amount: number;
};

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [budget, setBudget] =
    useState<Budget | null>(null);

  const [fixedExpenses, setFixedExpenses] =
    useState<FixedExpense[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

    const [editingExpenseId, setEditingExpenseId] =
  useState<string | null>(null);

const [editDescription, setEditDescription] =
  useState("");

const [editAmount, setEditAmount] =
  useState("");

    const categories = [
  "Food",
  "Fuel",
  "Entertainment",
  "Shopping",
  "Medical",
  "Other",
  "Custom...",
];

const [category, setCategory] =
  useState("Food");

const [customCategory, setCustomCategory] =
  useState("");

const [description, setDescription] =
  useState("");

const [amount, setAmount] =
  useState("");

const [expenseMessage, setExpenseMessage] =
  useState("");

const [savingExpense, setSavingExpense] =
  useState(false);

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

      const {
        data: budgetData,
        error: budgetError,
      } = await supabase
        .from("monthly_budgets")
        .select(
          "id, salary, savings_goal"
        )
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .single();

      if (budgetError || !budgetData) {
        setLoading(false);
        return;
      }

      setBudget(budgetData);

      const {
  data: expenseRows,
  error: expenseRowsError,
} = await supabase
  .from("expenses")
  .select(
    "id, category, description, amount, expense_date"
  )
  .eq(
    "monthly_budget_id",
    budgetData.id
  );

if (!expenseRowsError && expenseRows) {
  setExpenses(expenseRows);
}

      const {
        data: expenseData,
        error: expenseError,
      } = await supabase
        .from("monthly_fixed_expenses")
        .select("id, name, amount")
        .eq(
          "monthly_budget_id",
          budgetData.id
        );

      if (!expenseError && expenseData) {
        setFixedExpenses(expenseData);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }
  async function handleAddExpense() {
  try {
    if (!budget) return;

    const finalCategory =
      category === "Custom..."
        ? customCategory.trim()
        : category;

    if (!finalCategory) {
      setExpenseMessage(
        "Please enter a category."
      );
      return;
    }

    if (!description.trim()) {
      setExpenseMessage(
        "Please enter a description."
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setExpenseMessage(
        "Please enter a valid amount."
      );
      return;
    }

    setSavingExpense(true);
    setExpenseMessage("");

    const newExpense = {
      monthly_budget_id: budget.id,
      category: finalCategory,
      description,
      amount: Number(amount),
      expense_date: new Date()
        .toISOString()
        .split("T")[0],
    };

    const { data, error } =
      await supabase
        .from("expenses")
        .insert(newExpense)
        .select()
        .single();

    if (error) {
      throw error;
    }

    setExpenses((prev) => [
      data,
      ...prev,
    ]);

    setCategory("Food");
    setCustomCategory("");
    setDescription("");
    setAmount("");

    setExpenseMessage(
      "Expense added successfully."
    );
  } catch (error) {
    console.error(error);

    setExpenseMessage(
      "Failed to save expense."
    );
  } finally {
    setSavingExpense(false);
  }
}

    async function handleDeleteExpense(
  id: string
) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  setExpenses((prev) =>
    prev.filter(
      (expense) => expense.id !== id
    )
  );
}

    async function handleSaveEdit(
  id: string
) {
  const { error } = await supabase
    .from("expenses")
    .update({
      description: editDescription,
      amount: Number(editAmount),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  setExpenses((prev) =>
    prev.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            description:
              editDescription,
            amount:
              Number(editAmount),
          }
        : expense
    )
  );

  setEditingExpenseId(null);
}

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  const totalFixedExpenses =
    fixedExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

  const availableToSpend =
    budget
      ? budget.salary -
        budget.savings_goal -
        totalFixedExpenses
      : 0;

      const spentThisMonth =
  expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    0
  );

const remaining =
  availableToSpend - spentThisMonth;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
  <h1 className="text-3xl font-bold">
    Dashboard
  </h1>

  <p className="text-gray-500">
  {new Date().toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    }
  )}
</p>
</div>

        <div className="flex gap-2 items-center">

           <button
    onClick={() =>
      router.push("/history")
    }
    className="border px-4 py-2 rounded"
  >
    History
  </button> 

  <button
    onClick={handleLogout}
    className="border px-4 py-2 rounded"
  >
    Logout
  </button>
</div>
      </div>

      {!budget ? (
        <div>
          <p>
  No budget exists for this month.
</p>

<p className="text-gray-500 mt-2">
  Create a monthly budget to start
  tracking your spending.
</p>

          <button
            onClick={() =>
              router.push(
                "/create-budget"
              )
            }
            className="mt-4 border px-4 py-2 rounded"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Income
              </h2>
              <p>
                R
                {budget.salary.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Savings Goal
              </h2>
              <p>
                R
                {budget.savings_goal.toLocaleString()}
              </p>
            </div>

         

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Fixed Expenses
              </h2>
              <p>
                R
                {totalFixedExpenses.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
              <h2 className="font-semibold">
                Available To Spend
              </h2>
              <p>
                R
                {availableToSpend.toLocaleString()}
              </p>
            </div>

            <div className="border p-4 rounded">
  <h2 className="font-semibold">
    Spent This Month
  </h2>

  <p>
    R
    {spentThisMonth.toLocaleString()}
  </p>
</div>

<div className="border p-4 rounded">
  <h2 className="font-semibold">
    Remaining
  </h2>

  <p>
    R
    {remaining.toLocaleString()}
  </p>
</div>

          </div>
          <div className="border p-4 rounded mb-6">
  <h2 className="font-semibold mb-4">
    Add Expense
  </h2>

  <div className="space-y-3">

    <select
      value={category}
      onChange={(e) =>
        setCategory(e.target.value)
      }
      className="w-full border p-2 rounded"
    >
      {categories.map((item) => (
        <option
          key={item}
          value={item}
        >
          {item}
        </option>
      ))}
    </select>

    {category === "Custom..." && (
      <input
        type="text"
        placeholder="Custom Category"
        value={customCategory}
        onChange={(e) =>
          setCustomCategory(
            e.target.value
          )
        }
        className="w-full border p-2 rounded"
      />
    )}

    <input
      type="text"
      placeholder="Description"
      value={description}
      onChange={(e) =>
        setDescription(
          e.target.value
        )
      }
      className="w-full border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Amount"
      value={amount}
      onChange={(e) =>
        setAmount(e.target.value)
      }
      className="w-full border p-2 rounded"
    />

    <button
      onClick={handleAddExpense}
      disabled={savingExpense}
      className="border px-4 py-2 rounded"
    >
      {savingExpense
        ? "Saving..."
        : "Save Expense"}
    </button>

    {expenseMessage && (
      <p className="text-sm">
        {expenseMessage}
      </p>
    )}
  </div>
</div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-4">
              Fixed Expenses
            </h2>

            <div className="space-y-2">
              {fixedExpenses.map(
                (expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between"
                  >
                    <span>
                      {expense.name}
                    </span>

                    <span>
                      R
                      {expense.amount.toLocaleString()}
                    </span>
                  </div>
                )
              )}
            </div>
            
          </div>
          <div className="border p-4 rounded mt-6">
  <h2 className="font-semibold mb-4">
    Recent Expenses
  </h2>

  {expenses.length === 0 ? (
    <p>No expenses yet.</p>
  ) : (
    <div className="space-y-2">
      {expenses.map((expense) => (
  <div
    key={expense.id}
    className="border rounded p-3"
  >
    {editingExpenseId ===
    expense.id ? (
      <div className="space-y-2">
        <input
          type="text"
          value={editDescription}
          onChange={(e) =>
            setEditDescription(
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          value={editAmount}
          onChange={(e) =>
            setEditAmount(
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        />

        <button
          onClick={() =>
            handleSaveEdit(
              expense.id
            )
          }
          className="border px-3 py-1 rounded"
        >
          Save
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-between">
          <span>
            {expense.description ||
              expense.category}
          </span>

          <span>
            R
            {expense.amount.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              setEditingExpenseId(
                expense.id
              );

              setEditDescription(
                expense.description ??
                  ""
              );

              setEditAmount(
                expense.amount.toString()
              );
            }}
            className="border px-3 py-1 rounded"
          >
            Edit
          </button>

          <button
            onClick={() =>
              handleDeleteExpense(
                expense.id
              )
            }
            className="border px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </>
    )}
  </div>
))}
    </div>
  )}
</div>

        </>
        
      )}
      
    </div>
  );
}