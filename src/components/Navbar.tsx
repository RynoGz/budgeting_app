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

    // Close menu when clicking outside (works on iOS)
    const handleClickOutside = (e: MouseEvent) => {
      const nav = document.querySelector("nav");
      if (nav && !nav.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

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
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 touch-manipulation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-4 sm:gap-8 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              BudgetChom
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 font-medium transition-colors text-sm whitespace-nowrap"
              type="button"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/history")}
              className="text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 font-medium transition-colors text-sm whitespace-nowrap"
              type="button"
            >
              History
            </button>
            <button
              onClick={() => router.push("/create-budget")}
              className="text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 font-medium transition-colors text-sm whitespace-nowrap"
              type="button"
            >
              Create Budget
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Navigation Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle menu"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Install Button */}
          {showInstallButton && (
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 active:text-blue-700 dark:active:text-blue-300 font-medium transition-colors text-xs sm:text-sm shrink-0 cursor-pointer"
              title="Install app"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white active:bg-red-50 dark:active:bg-red-900/20 active:text-red-600 dark:active:text-red-400 font-medium transition-all border border-transparent active:border-red-200 dark:active:border-red-800 text-sm sm:text-base shrink-0 cursor-pointer"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 fixed left-0 right-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => {
                router.push("/dashboard");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
              type="button"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push("/history");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
              type="button"
            >
              History
            </button>
            <button
              onClick={() => {
                router.push("/create-budget");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 active:text-blue-600 dark:active:text-blue-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
              type="button"
            >
              Create Budget
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
