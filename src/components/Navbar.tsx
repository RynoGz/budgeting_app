"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    }
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              BudgetChom
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/history")}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm"
            >
              History
            </button>
            <button
              onClick={() => router.push("/create-budget")}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm"
            >
              Create Budget
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Navigation Menu */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg py-2 z-10">
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    router.push("/history");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  History
                </button>
                <button
                  onClick={() => {
                    router.push("/create-budget");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Create Budget
                </button>
              </div>
            )}
          </div>

          {/* Install Button */}
          {showInstallButton && (
            <button
              onClick={handleInstall}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 font-medium transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}