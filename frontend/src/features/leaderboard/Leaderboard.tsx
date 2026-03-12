"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trophy, Medal, Award } from 'lucide-react';

type LeaderboardEntry = {
  id: number;
  username: string;
  avatar_url: string;
  total_score: number;
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/auth/leaderboard/');
        setEntries(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center py-20">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
        <h2 className="text-3xl font-extrabold mb-2">Global Leaderboard</h2>
        <p className="text-blue-100">The brightest minds on QuizPortal</p>
      </div>
      
      <div className="p-0">
        {entries.map((entry, index) => (
          <div key={entry.id} className={`flex items-center gap-6 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors
            ${index === 0 ? 'bg-yellow-50/30' : ''}
            ${index === 1 ? 'bg-slate-50' : ''}
            ${index === 2 ? 'bg-orange-50/30' : ''}
          `}>
            <div className="w-12 text-center font-bold text-2xl text-slate-400">
              {index + 1}
            </div>
            
            <div className="flex-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl relative">
                {entry.username.charAt(0)}
                {index === 0 && <Medal className="w-5 h-5 absolute -top-1 -right-1 text-yellow-500" fill="currentColor"/>}
                {index === 1 && <Award className="w-5 h-5 absolute -top-1 -right-1 text-slate-400" fill="currentColor"/>}
                {index === 2 && <Award className="w-5 h-5 absolute -top-1 -right-1 text-amber-600" fill="currentColor"/>}
              </div>
              <span className="font-semibold text-lg text-slate-800">{entry.username}</span>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-xl text-blue-600">{entry.total_score.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
