
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Quiz, QuestionType, QuizAttempt, QuizTheme } from '../types';
import { quizStore } from '../store/quizStore';

const THEME_STYLES: Record<QuizTheme, { body: string; card: string; text: string; primary: string; secondary: string }> = {
  standard: { body: 'bg-slate-50', card: 'bg-white', text: 'text-slate-900', primary: 'bg-indigo-600', secondary: 'text-slate-500' },
  royal: { body: 'bg-stone-100', card: 'bg-stone-50', text: 'text-stone-900', primary: 'bg-amber-600', secondary: 'text-stone-500' },
  cyber: { body: 'bg-slate-950', card: 'bg-slate-900', text: 'text-fuchsia-100', primary: 'bg-fuchsia-600', secondary: 'text-fuchsia-400' },
  nature: { body: 'bg-emerald-50/20', card: 'bg-white', text: 'text-emerald-950', primary: 'bg-emerald-600', secondary: 'text-emerald-700' },
  minimal: { body: 'bg-white', card: 'bg-white border-2 border-slate-100 shadow-none', text: 'text-slate-900', primary: 'bg-slate-900', secondary: 'text-slate-400' },
};

const TakeQuiz: React.FC<{ user: User }> = ({ user }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = quizStore.getQuizByCode(code || '');
    if (q) {
      setQuiz(q);
      setTimeLeft(q.timeLimit * 60);
      setLoading(false);
    } else {
      setTimeout(() => navigate('/'), 2000);
    }
  }, [code, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished && !loading) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, loading]);

  const handleAnswer = (val: any) => {
    if (!quiz) return;
    setAnswers({ ...answers, [quiz.questions[currentQuestionIdx].id]: val });
  };

  const handleSubmit = () => {
    if (!quiz || isFinished) return;
    setIsFinished(true);

    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      quizId: quiz.id,
      userId: user.id,
      score,
      totalMarks: quiz.questions.reduce((sum, q) => sum + q.marks, 0),
      timeTaken: quiz.timeLimit * 60 - timeLeft,
      completedAt: Date.now(),
      answers,
      topicPerformance: { [quiz.topic]: score }
    };

    quizStore.saveAttempt(attempt);
    navigate(`/results/${attempt.id}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 font-medium">Loading Quiz Experience...</p>
    </div>
  );

  if (!quiz) return null;

  const currentTheme = THEME_STYLES[quiz.theme || 'standard'];
  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`min-h-screen -mt-20 pt-20 transition-colors duration-500 ${currentTheme.body}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between sticky top-16 pb-4 z-10">
          <div className="flex-1 mr-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${currentTheme.secondary}`}>Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
              <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white/50 shadow-sm'}`}>
                ⏱️ {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/50 rounded-full">
              <div className={`h-full rounded-full transition-all duration-300 ${currentTheme.primary}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className={`text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-md ${currentTheme.primary === 'bg-indigo-600' ? 'bg-emerald-600' : currentTheme.primary}`}
          >
            Submit
          </button>
        </header>

        <div className={`${currentTheme.card} p-8 md:p-12 rounded-[2.5rem] shadow-2xl min-h-[500px] flex flex-col border border-white/10`}>
          {currentQuestion.image && (
            <div className="mb-8 overflow-hidden rounded-2xl max-h-[300px]">
              <img src={currentQuestion.image} alt="Question visual" className="w-full h-full object-cover" />
            </div>
          )}
          
          <h2 className={`text-2xl md:text-3xl font-black mb-10 leading-tight ${currentTheme.text}`}>{currentQuestion.text}</h2>
          
          <div className="flex-1 space-y-4">
            {currentQuestion.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  answers[currentQuestion.id] === opt 
                    ? `border-indigo-600 bg-indigo-50/50 shadow-inner` 
                    : `border-slate-100/50 hover:border-slate-300 bg-white/5 shadow-sm`
                }`}
              >
                <span className={`text-lg font-bold ${currentTheme.text} ${answers[currentQuestion.id] === opt ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{opt}</span>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentQuestion.id] === opt ? `border-indigo-600 ${currentTheme.primary}` : 'border-slate-300 bg-white'
                }`}>
                  {answers[currentQuestion.id] === opt && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100/20 flex items-center justify-between">
            <button 
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="px-8 py-3 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-white/50 disabled:opacity-30 transition-all"
            >
              Back
            </button>
            
            <div className="hidden md:block">
              <span className={`text-xs font-bold px-4 py-2 rounded-full border border-slate-100 shadow-sm ${currentTheme.text}`}>
                {currentQuestion.difficulty} • {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
              </span>
            </div>

            {currentQuestionIdx === quiz.questions.length - 1 ? (
              <button onClick={handleSubmit} className={`px-10 py-3 rounded-2xl text-white font-bold transition-all shadow-lg transform active:scale-95 ${currentTheme.primary}`}>Finish Quiz</button>
            ) : (
              <button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} className={`px-10 py-3 rounded-2xl text-white font-bold transition-all shadow-lg transform active:scale-95 ${currentTheme.primary}`}>Continue &rarr;</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
