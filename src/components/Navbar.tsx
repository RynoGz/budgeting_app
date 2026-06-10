"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-8">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              BudgetChom
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                router.push("/history")
              }
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              History
            </button>

            <button
              onClick={() =>
                router.push("/create-budget")
              }
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Create Budget
            </button>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="
            px-4 py-2 rounded-lg
            bg-slate-100 dark:bg-slate-700
            text-slate-900 dark:text-white
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-600 dark:hover:text-red-400
            font-medium transition-all
            border border-transparent hover:border-red-200 dark:hover:border-red-800
          "
        >
          Logout
        </button>

      </div>
    </nav>
    );
}