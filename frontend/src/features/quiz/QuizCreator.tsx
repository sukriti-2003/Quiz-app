"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function QuizCreator() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(600);
  const [questions, setQuestions] = useState([
    { text: '', points: 10, choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }] }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', points: 10, choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }] }]);
  };

  const handleAddChoice = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices.push({ text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Must be logged in to create a quiz.");
    
    setLoading(true);
    try {
      const quizRes = await api.post('/quizzes/', {
        title, description, time_limit_seconds: timeLimit, is_published: true
      });
      const quizId = quizRes.data.id;

      for (let i = 0; i < questions.length; i++) {
        await api.post(`/quizzes/${quizId}/add_question/`, {
          ...questions[i],
          order: i
        });
      }

      router.push(`/quizzes/${quizId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-10 text-center text-slate-500">Please log in to create a quiz.</div>;
  }
  
  if (!user.is_staff) {
    return <div className="p-10 text-center text-slate-500">You do not have permission to create quizzes. Admin access is required.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Quiz Title</label>
        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">Time Limit (seconds)</label>
        <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-4">Question {qIndex + 1}</h4>
            <div className="mb-4">
              <input placeholder="Question text" required value={q.text} onChange={e => {
                const newQ = [...questions];
                newQ[qIndex].text = e.target.value;
                setQuestions(newQ);
              }} className="w-full border border-slate-300 rounded-lg p-3 outline-none"/>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600">Choices:</p>
              {q.choices.map((c, cIndex) => (
                <div key={cIndex} className="flex items-center gap-3">
                  <input type="radio" name={`correct-${qIndex}`} checked={c.is_correct} onChange={() => {
                    const newQ = [...questions];
                    newQ[qIndex].choices.forEach((choice, i) => choice.is_correct = i === cIndex);
                    setQuestions(newQ);
                  }} className="w-5 h-5 text-blue-600"/>
                  <input placeholder="Choice text" required value={c.text} onChange={e => {
                    const newQ = [...questions];
                    newQ[qIndex].choices[cIndex].text = e.target.value;
                    setQuestions(newQ);
                  }} className="flex-1 border border-slate-300 rounded-lg p-2 outline-none"/>
                </div>
              ))}
              <button type="button" onClick={() => handleAddChoice(qIndex)} className="text-sm text-blue-600 font-medium hover:text-blue-700">+ Add Choice</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
        <button type="button" onClick={handleAddQuestion} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-medium transition-colors">Add Question</button>
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 ml-auto">
          {loading ? 'Publishing...' : 'Publish Quiz'}
        </button>
      </div>
    </form>
  );
}
