
import React from 'react';
import { User, QuizAttempt } from '../types';
import { quizStore } from '../store/quizStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const attempts = quizStore.getAttempts().filter(a => a.userId === user.id);
  const chartData = attempts.map((a, i) => ({
    name: `Test ${i + 1}`,
    score: (a.score / a.totalMarks) * 100
  })).slice(-10);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}! 👋</h1>
          <p className="text-slate-500">You've completed {attempts.length} quizzes this week. Keep the streak going!</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            Join a Quiz
          </Link>
          <Link to="/create" className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
             AI Mock Generator
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Current Level" value={user.level} icon="⭐" color="bg-yellow-50 text-yellow-600" />
        <StatCard title="Total XP" value={user.xp} icon="💎" color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Quizzes Done" value={attempts.length} icon="📝" color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Day Streak" value={user.streak} icon="🔥" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Achievements</h3>
          <div className="space-y-4">
            {user.badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                  {badge === 'Quick Learner' ? '⚡' : badge === 'Perfect Score' ? '🎯' : '🔥'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{badge}</p>
                  <p className="text-xs text-slate-500">Unlocked on Level {idx + 2}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <button className="text-indigo-600 text-sm font-bold">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Quiz Topic</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.reverse().map((attempt) => {
                const quiz = quizStore.getQuizzes().find(q => q.id === attempt.quizId);
                return (
                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{quiz?.title || 'Practice Quiz'}</div>
                      <div className="text-xs text-slate-500">{quiz?.topic}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">{attempt.score}/{attempt.totalMarks}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${attempt.score/attempt.totalMarks > 0.7 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                          style={{ width: `${(attempt.score / attempt.totalMarks) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/results/${attempt.id}`} className="text-indigo-600 font-bold hover:underline">Review</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 leading-none mt-1">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
