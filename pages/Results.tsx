
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizStore } from '../store/quizStore';
import { analyzePerformance } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Results: React.FC<{ user: any }> = ({ user }) => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

  useEffect(() => {
    const att = quizStore.getAttempts().find(a => a.id === attemptId);
    if (att) {
      setAttempt(att);
      const q = quizStore.getQuizzes().find(qi => qi.id === att.quizId);
      setQuiz(q);
      
      const fetchAnalysis = async () => {
        try {
          const analysis = await analyzePerformance(att);
          setAiAnalysis(analysis);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingAnalysis(false);
        }
      };
      fetchAnalysis();
    }
  }, [attemptId]);

  if (!attempt || !quiz) return <div>Loading results...</div>;

  const scorePercentage = (attempt.score / attempt.totalMarks) * 100;
  const data = [
    { name: 'Correct', value: attempt.score },
    { name: 'Incorrect', value: attempt.totalMarks - attempt.score }
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4">
          {scorePercentage >= 80 ? '🏆' : scorePercentage >= 50 ? '🥈' : '📚'}
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Quiz Complete!</h1>
        <p className="text-slate-500 max-w-lg">Great job finishing the {quiz.title}. Here's how you performed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Score Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-slate-900">{Math.round(scorePercentage)}%</p>
            <p className="text-slate-500 font-medium">Final Accuracy</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-100">
            <div className="text-center">
              <p className="text-emerald-600 font-bold text-xl">{attempt.score}</p>
              <p className="text-slate-400 text-xs font-bold uppercase">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-slate-900 font-bold text-xl">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</p>
              <p className="text-slate-400 text-xs font-bold uppercase">Time Taken</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             AI Intelligence Report
          </h3>
          
          {loadingAnalysis ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
              <div className="h-24 bg-white/20 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-indigo-100 mb-2 font-medium">Gemini Feedback:</p>
                <p className="text-lg leading-relaxed">{aiAnalysis.feedback}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Focus on these topics:</p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {aiAnalysis.weakTopics.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Improvement Tips:</p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {aiAnalysis.improvementTips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-8">Detailed Review</h3>
        <div className="space-y-12">
          {quiz.questions.map((q: any, i: number) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            return (
              <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">{q.text}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Your Answer</p>
                        <p className="font-bold">{userAns || 'No answer'}</p>
                      </div>
                      {!isCorrect && (
                        <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Correct Answer</p>
                          <p className="font-bold">{q.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-indigo-600 uppercase mb-2">💡 Explanation & Context</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-8">
        <Link to="/dashboard" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
          Back to Dashboard
        </Link>
        <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          Try Another Quiz
        </Link>
      </div>
    </div>
  );
};

export default Results;
