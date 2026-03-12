"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { Trophy, Clock, Target, PlusCircle, LogOut } from "lucide-react";

type Attempt = {
  id: number;
  quiz: number;
  quiz_title?: string;
  start_time: string;
  end_time: string | null;
  score: number | null;
  status: string;
};

type Quiz = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  time_limit_seconds: number;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [attemptsRes, quizzesRes] = await Promise.all([
          api.get("/attempts/"),
          api.get("/quizzes/"),
        ]);
        
        // Let's get quiz titles for attempts since attempt might only return quizId
        const quizzesMap = new Map(quizzesRes.data.map((q: Quiz) => [q.id, q.title]));
        
        const mappedAttempts = attemptsRes.data.map((att: Attempt) => ({
          ...att,
          quiz_title: quizzesMap.get(att.quiz) || `Quiz #${att.quiz}`
        }));

        setAttempts(mappedAttempts);
        
        // The /quizzes/ endpoint might return all published quizzes AND user's own unpublished ones.
        // But since we want "Quizzes Created by Me", we'll filter them by creator on frontend or rely on backend if it doesn't return creator.
        // Wait, QuizViewSet get_queryset returns `is_published=True | creator=request.user`.
        // We'll need to check if the quiz has a creator field we can match, or if it doesn't we might need another endpoint.
        // The serialier has `creator_name`. Let's assume if creator_name == user.username it's ours.
        const myQuizzes = quizzesRes.data.filter((q: { id: number; title: string; time_limit_seconds: number; is_published: boolean; creator_name: string }) => q.creator_name === user.username);
        
        setCreatedQuizzes(myQuizzes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="text-center py-20 text-slate-500">Loading your dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white block" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.first_name?.[0] || user.username?.[0] || "U"}
                </div>
              )}
              <div className="text-center sm:text-left mt-2 sm:mt-10">
                <h1 className="text-2xl font-bold text-slate-900">{user.first_name} {user.last_name || user.username}</h1>
                <p className="text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {user.is_staff && (
                <Link href="/create" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                  <PlusCircle className="w-4 h-4" /> Create Quiz
                </Link>
              )}
              <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Score</p>
                <p className="text-2xl font-bold text-slate-900">{user.total_score}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Quizzes Taken</p>
                <p className="text-2xl font-bold text-slate-900">{attempts.length}</p>
              </div>
            </div>
            
            {user.is_staff && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Quizzes Created</p>
                  <p className="text-2xl font-bold text-slate-900">{createdQuizzes.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`grid gap-8 ${user.is_staff ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
        
        {/* Recent Attempts */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Attempts</h2>
            <Link href="/quizzes" className="text-sm text-blue-600 font-medium hover:text-blue-700">Take a quiz &rarr;</Link>
          </div>
          
          <div className="space-y-4">
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                You haven&apos;t taken any quizzes yet.
              </div>
            ) : (
              attempts.slice(0, 5).map((att) => (
                <Link key={att.id} href={`/results/${att.id}`} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{att.quiz_title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(att.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">
                      {att.status === 'COMPLETED' ? att.score : <span className="text-amber-500 text-sm">In Progress</span>}
                    </div>
                    {att.status === 'COMPLETED' && <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Points</div>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Quizzes - Admins Only */}
        {user.is_staff && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">My Quizzes</h2>
              <Link href="/create" className="text-sm text-purple-600 font-medium hover:text-purple-700">Create new &rarr;</Link>
            </div>
            
            <div className="space-y-4">
              {createdQuizzes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  You haven&apos;t created any quizzes yet.
                </div>
              ) : (
                createdQuizzes.slice(0, 5).map((quiz) => (
                  <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">{quiz.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${quiz.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {quiz.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span>{Math.floor(quiz.time_limit_seconds / 60)} min</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
