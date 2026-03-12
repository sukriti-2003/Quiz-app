"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow">
            Q
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            QuizPortal
          </span>
        </a>

        {/* Nav Links + Auth */}
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-5">
            <a
              href="/quizzes"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Explore
            </a>
            <a
              href="/leaderboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Leaderboard
            </a>
          </nav>

          {/* Auth Buttons */}
          {loading ? (
            <div className="w-20 h-9 bg-slate-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user.first_name || user.username}
                </span>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                  </div>
                )}
              </button>
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <a
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Dashboard
                    </a>
                    {user.is_staff && (
                      <>
                        <a
                          href="/admin"
                          className="block px-4 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          Admin Area
                        </a>
                        <a
                          href="/create"
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Create Quiz
                        </a>
                      </>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Log in
              </a>
              <a
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
