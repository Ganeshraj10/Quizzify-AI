
import React from 'react';
import { User, Quiz } from '../types';
import { quizStore } from '../store/quizStore';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC<{ user: User }> = ({ user }) => {
  const quizzes = quizStore.getQuizzes().filter(q => q.creatorId === user.id);
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attemptsCount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Educator Dashboard 🎓</h1>
          <p className="text-slate-500">Manage your quizzes, monitor student performance, and create new content.</p>
        </div>
        <Link to="/create" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Quiz
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TeacherStatCard title="Active Quizzes" value={quizzes.length} icon="📋" />
        <TeacherStatCard title="Total Student Attempts" value={totalAttempts} icon="👨‍🎓" />
        <TeacherStatCard title="Average Performance" value="78%" icon="📈" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Your Quizzes</h3>
          <div className="flex gap-2">
             <button className="px-4 py-2 text-sm bg-slate-50 text-slate-600 font-bold rounded-lg border">Filter</button>
             <button className="px-4 py-2 text-sm bg-slate-50 text-slate-600 font-bold rounded-lg border">Export</button>
          </div>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-6xl mb-4">🪄</div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">No quizzes yet</h4>
            <p className="text-slate-500 mb-8">Use our AI builder to create your first assessment in seconds.</p>
            <Link to="/create" className="text-indigo-600 font-bold hover:underline">Get started now &rarr;</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Quiz Detail</th>
                  <th className="px-8 py-4">Join Code</th>
                  <th className="px-8 py-4">Difficulty</th>
                  <th className="px-8 py-4">Attempts</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.reverse().map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{quiz.title}</div>
                      <div className="text-sm text-slate-500">{quiz.topic} • {quiz.questions.length} Questions</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold border border-indigo-100">
                        {quiz.code}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        quiz.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 
                        quiz.difficulty === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{quiz.attemptsCount}</p>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button className="text-slate-400 hover:text-red-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TeacherStatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex items-center justify-between">
    <div>
      <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">
      {icon}
    </div>
  </div>
);

export default TeacherDashboard;
