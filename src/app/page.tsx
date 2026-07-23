import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              BudgetChom
            </h1>
          </div>
          
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Hero Section */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Smart Budget Management
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent block mt-2">
                Made Simple
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Take control of your finances. Track expenses, manage budgets, and achieve your financial goals with BudgetChom.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/register"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Budget Planning</h3>
              <p className="text-slate-600 dark:text-slate-400">Create and manage monthly budgets with savings goals and fixed expenses.</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Track Expenses</h3>
              <p className="text-slate-600 dark:text-slate-400">Log and categorize your daily expenses easily with detailed descriptions.</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">View spending history and analytics to understand your financial patterns.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 dark:text-slate-400">
          <p>© 2026 BudgetChom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
