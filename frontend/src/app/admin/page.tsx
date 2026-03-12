"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { Users, FileText, Target, Trophy, Clock, Search, ChevronRight } from "lucide-react";

type TopUser = {
  id: number;
  username: string;
  avatar_url: string;
  total_score: number;
};

type RecentQuiz = {
  id: number;
  title: string;
  creator_name: string;
  created_at: string;
  time_limit_seconds: number;
  is_published: boolean;
};

type AdminStats = {
  total_users: number;
  total_quizzes: number;
  total_attempts: number;
  top_users: TopUser[];
  recent_quizzes: RecentQuiz[];
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic protection - if not logged in or not staff, redirect
    if (user === null) return; // Still loading user
    if (user && !user.is_staff) {
      window.location.href = "/dashboard";
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/admin/stats/');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!stats) return <div className="text-center py-20 text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-1">System overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link href="/create" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm flex items-center gap-2">
            Create Quiz
          </Link>
          <Link href="/quizzes" className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            View Portal
          </Link>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-4xl font-extrabold text-slate-900">{stats.total_users}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Quizzes</p>
            <p className="text-4xl font-extrabold text-slate-900">{stats.total_quizzes}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Attempts</p>
            <p className="text-4xl font-extrabold text-slate-900">{stats.total_attempts}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Quizzes */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Recent Quizzes
            </h2>
            <Link href="/quizzes" className="text-sm font-medium text-purple-600 hover:text-purple-700">View all</Link>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-2">
              {stats.recent_quizzes.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No quizzes created yet.</div>
              ) : (
                stats.recent_quizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">{quiz.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="font-medium">by {quiz.creator_name}</span>
                        <span>&bull;</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${quiz.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {quiz.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Top Performers
            </h2>
            <Link href="/leaderboard" className="text-sm font-medium text-amber-600 hover:text-amber-700">Full leaderboard</Link>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-2">
              {stats.top_users.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No active users yet.</div>
              ) : (
                stats.top_users.map((scorer, index) => (
                  <div key={scorer.id} className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                      #{index + 1}
                    </div>
                    {scorer.avatar_url ? (
                      <img src={scorer.avatar_url} alt={scorer.username} className="w-10 h-10 rounded-full mr-4 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mr-4 flex items-center justify-center text-white font-bold text-sm">
                        {scorer.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{scorer.username}</h3>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{scorer.total_score}</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Points</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
