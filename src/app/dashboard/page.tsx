"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

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
        data: budgetsData,
        error: budgetError,
      } = await supabase
        .from("monthly_budgets")
        .select(
          "id, salary, savings_goal"
        )
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear());

      if (budgetError || !budgetsData || budgetsData.length === 0) {
        setLoading(false);
        return;
      }

      const budgetData = budgetsData[0];
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
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

  const categoryTotals =
  expenses.reduce(
    (acc, expense) => {
      acc[expense.category] =
        (acc[expense.category] || 0) +
        expense.amount;

      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {new Date().toLocaleString(
                    "default",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Main Remaining Balance Card */}
            {budget && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-lg text-white">
                <p className="text-blue-100 text-lg mb-2">Remaining This Month</p>
                <p className="text-5xl font-bold mb-2">R{remaining.toLocaleString()}</p>
                <div className="w-full bg-blue-400 rounded-full h-2 mt-4 overflow-hidden">
                  <div 
                    className="bg-blue-200 h-full rounded-full" 
                    style={{width: `${(spentThisMonth / availableToSpend) * 100}%`}}
                  ></div>
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  {((spentThisMonth / availableToSpend) * 100).toFixed(0)}% of available budget spent
                </p>
              </div>
            )}
          </div>

          {!budget ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 text-center">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No budget exists for this month</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create a monthly budget to start tracking your spending.
              </p>
              <button
                onClick={() => router.push("/create-budget")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Create Budget Now
              </button>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Income</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        R{budget.salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Savings Goal</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        R{budget.savings_goal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Fixed Expenses</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        R{totalFixedExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Available To Spend</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        R{availableToSpend.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2v-8a2 2 0 012-2h.5a2 2 0 01.5-.904l2.894-2.893a1 1 0 101.414-1.414l-2.894 2.893" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Spent This Month</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        R{spentThisMonth.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
                  remaining >= 0 
                    ? 'bg-white dark:bg-slate-800' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Remaining</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        remaining >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        R{remaining.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      remaining >= 0 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        remaining >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* Add Expense Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add Expense</h2>

                <div className="space-y-4">

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      onChange={(e) => setCustomCategory(
                        e.target.value
                      )}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(
                      e.target.value
                    )}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddExpense}
                      disabled={savingExpense}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {savingExpense
                        ? "Saving..."
                        : "Save Expense"}
                    </button>
                  </div>

                  {expenseMessage && (
                    <div className={`p-4 rounded-lg ${
                      expenseMessage.includes("success")
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    }`}>
                      {expenseMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Expenses Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Fixed Expenses</h2>

                {fixedExpenses.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400">No fixed expenses configured.</p>
                ) : (
                  <div className="space-y-3">
                    {fixedExpenses.map(
                      (expense) => (
                        <div
                          key={expense.id}
                          className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <span className="font-medium text-slate-900 dark:text-white">
                            {expense.name}
                          </span>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            R{expense.amount.toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                
                {/* Spending By Category */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Spending By Category</h2>

                  {Object.keys(categoryTotals)
                    .length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400">No expenses yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(
                        categoryTotals
                      ).map(
                        ([cat, total]) => (
                          <div
                            key={cat}
                            className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            <span className="font-medium text-slate-900 dark:text-white">{cat}</span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              R{total.toLocaleString()}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-slate-700 dark:text-slate-300">Total Expenses</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{expenses.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-slate-700 dark:text-slate-300">Categories</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{Object.keys(categoryTotals).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-slate-700 dark:text-slate-300">Budget Usage</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {availableToSpend > 0 ? ((spentThisMonth / availableToSpend) * 100).toFixed(0) : '100'}%
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Expenses Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Expenses</h2>

                {expenses.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400">No expenses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {editingExpenseId ===
                          expense.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(
                                e.target.value
                              )}
                              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(
                                e.target.value
                              )}
                              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(expense.id)}
                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-semibold"
                              >
                                Save
                              </button>

                              <button
                                onClick={() => {
                                  setEditingExpenseId(null);
                                  setEditDescription("");
                                  setEditAmount("");
                                }}
                                className="flex-1 px-3 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded transition-colors font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                                    {expense.category}
                                  </span>
                                </div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {expense.description}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {new Date(
                                    expense.expense_date
                                  ).toLocaleDateString('en-ZA')}
                                </p>
                              </div>
                              <span className="text-lg font-bold text-slate-900 dark:text-white ml-4">
                                R{expense.amount.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
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
                                className="flex-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded transition-colors text-sm font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteExpense(
                                  expense.id
                                )}
                                className="flex-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors text-sm font-semibold"
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
      </div>
    </>
  );
}