"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

export function QuizAttempt({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAttempt = async () => {
      try {
        const quizRes = await api.get(`/quizzes/${quizId}/`);
        setQuiz(quizRes.data);
        
        // Start attempt
        const attRes = await api.post('/attempts/', { quiz: quizId });
        setAttempt(attRes.data);
        setTimeLeft(quizRes.data.time_limit_seconds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initAttempt();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!loading && attempt && attempt.status !== 'COMPLETED') {
        handleSubmit();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const handleSelect = async (choiceId: number) => {
    const qId = quiz.questions[currentQuestionIdx].id;
    setSelectedChoices({ ...selectedChoices, [qId]: choiceId });
    try {
      await api.post(`/attempts/${attempt.id}/answer/`, {
        question: qId,
        selected_choice: choiceId
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/attempts/${attempt.id}/submit/`);
      router.push(`/results/${attempt.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to submit.");
    }
  };

  if (loading || !quiz) return <div className="text-center py-20">Preparing your quiz...</div>;

  const currentQ = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{quiz.title}</h2>
          <p className="text-sm text-slate-500">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg font-mono text-lg font-semibold text-slate-700">
          <Clock className="w-5 h-5 text-slate-500"/>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="mb-10 min-h-[200px]">
        <h3 className="text-xl font-medium text-slate-900 mb-6">{currentQ.text}</h3>
        <div className="space-y-3">
          {currentQ.choices.map((c: any) => {
            const isSelected = selectedChoices[currentQ.id] === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'}
                `}
              >
                <span>{c.text}</span>
                {isSelected && <CheckCircle className="w-5 h-5 text-blue-600"/>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button 
          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 disabled:opacity-50"
        >
          Previous
        </button>
        
        {currentQuestionIdx === quiz.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/30 transition-all"
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-medium transition-colors"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
