"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Clock, Users } from 'lucide-react';

type Quiz = {
  id: number;
  title: string;
  description: string;
  creator_name: string;
  time_limit_seconds: number;
};

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/');
        setQuizzes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <div className="text-center py-10">Loading quizzes...</div>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
          <h3 className="text-xl font-bold mb-2 text-slate-800">{quiz.title}</h3>
          <p className="text-slate-600 mb-4 line-clamp-2">{quiz.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
            <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> {Math.floor(quiz.time_limit_seconds / 60)} min</div>
            <div className="flex items-center gap-1"><Users className="w-4 h-4"/> {quiz.creator_name}</div>
          </div>
          <Link href={`/quizzes/${quiz.id}`} className="block w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg transition-colors">
            Start Quiz
          </Link>
        </div>
      ))}
      {quizzes.length === 0 && (
         <div className="col-span-full text-center py-10 text-slate-500">No quizzes available right now.</div>
      )}
    </div>
  );
}
