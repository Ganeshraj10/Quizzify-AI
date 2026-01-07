
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

const LandingPage: React.FC<{ user: User }> = ({ user }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return setError('Please enter a code');
    navigate(`/quiz/${code.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-3xl mx-auto">
      <div className="mb-8 p-3 bg-indigo-50 rounded-2xl inline-block">
        <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Powered by Gemini AI</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
        Master Any Subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI-Powered Quizzes</span>
      </h1>
      
      <p className="text-xl text-slate-600 mb-12 max-w-2xl">
        Quizzify AI transforms the way you learn and teach. Generate personalized mock tests, join live challenges, and track your growth with advanced analytics.
      </p>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Enter Quiz Code</label>
            <input 
              type="text" 
              placeholder="Ex: ABC-123" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
            />
            {error && <p className="text-red-500 text-sm mt-2 text-left">{error}</p>}
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Join Quiz Now
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-4">Want to create your own quiz?</p>
          <button 
            onClick={() => navigate('/create')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Go to Quiz Builder &rarr;
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
        <FeatureCard 
          icon="⚡"
          title="Instant AI Generation"
          desc="Create complete quizzes in seconds by just typing a topic name."
        />
        <FeatureCard 
          icon="📊"
          title="Smart Analytics"
          desc="Identify knowledge gaps with AI-driven performance tracking."
        />
        <FeatureCard 
          icon="🏆"
          title="Gamified Learning"
          desc="Earn XP, badges, and compete on global leaderboards."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{desc}</p>
  </div>
);

export default LandingPage;
