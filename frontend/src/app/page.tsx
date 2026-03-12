"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Globe, Trophy } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Master any subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">QuizPortal</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Create, share, and play interactive quizzes. Enhance learning with real-time feedback and global leaderboards.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/quizzes" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
            Start Learning <ArrowRight className="w-5 h-5" />
          </Link>
          {user?.is_staff && (
            <Link href="/create" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2">
              Create a Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Interactive Learning</h3>
          <p className="text-slate-600">Engage with dynamic questions and immediate feedback to accelerate your understanding.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Global Community</h3>
          <p className="text-slate-600">Discover quizzes created by experts and enthusiasts from around the world.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Compete & Lead</h3>
          <p className="text-slate-600">Climb the leaderboards and track your progress against friends and global players.</p>
        </div>
      </div>
    </div>
  );
}
