"use client";

import { useState } from "react";

export default function SetupPage() {
  const [salary, setSalary] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="space-y-4 border p-6 rounded-lg">
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
      </div>
    </div>
  );
}