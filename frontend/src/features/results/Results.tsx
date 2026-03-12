"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';

export function Results({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const attRes = await api.get(`/attempts/${attemptId}/`);
        setAttempt(attRes.data);
        const quizRes = await api.get(`/quizzes/${attRes.data.quiz}/`);
        setQuiz(quizRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading || !attempt || !quiz) return <div className="text-center py-20">Loading your results...</div>;

  const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);
  const percentage = Math.round((attempt.score / totalPoints) * 100) || 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
      <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 left-0"></div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl mb-6 mt-10">
          <Trophy className="w-12 h-12 text-yellow-500"/>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Completed!</h2>
        <p className="text-slate-600 mb-8">{quiz.title}</p>
        
        <div className="flex justify-center gap-8 mb-10">
          <div className="bg-slate-50 rounded-2xl p-6 min-w-[150px] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Your Score</p>
            <p className="text-4xl font-bold text-blue-600">{attempt.score}</p>
            <p className="text-sm text-slate-400 mt-1">out of {totalPoints}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 min-w-[150px] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Percentage</p>
            <p className="text-4xl font-bold text-purple-600">{percentage}%</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/leaderboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/30 transition-all">
            View Leaderboard
          </Link>
          <Link href="/quizzes" className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm transition-all">
            Try Another Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
