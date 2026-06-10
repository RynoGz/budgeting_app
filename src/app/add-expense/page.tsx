"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const categories = [
  "Food",
  "Fuel",
  "Entertainment",
  "Shopping",
  "Medical",
  "Other",
];

export default function AddExpensePage() {
  const router = useRouter();

  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddExpense() {
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

      const {
        data: budget,
        error: budgetError,
      } = await supabase
        .from("monthly_budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .single();

      if (budgetError || !budget) {
        throw new Error(
          "No budget exists for this month."
        );
      }

      const { error } = await supabase
        .from("expenses")
        .insert({
          monthly_budget_id: budget.id,
          category,
          description,
          amount: Number(amount),
          expense_date: now
            .toISOString()
            .split("T")[0],
        });

      if (error) {
        throw error;
      }

      setDescription("");
      setAmount("");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Failed to add expense.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="border p-6 rounded-lg space-y-4">
        <h1 className="text-2xl font-bold">
          Add Expense
        </h1>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="w-full border p-2 rounded"
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
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
          disabled={loading}
          className="w-full border p-2 rounded"
        >
          {loading
            ? "Saving..."
            : "Add Expense"}
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