
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Difficulty, Quiz, QuestionType, UserRole, Question, QuizTheme } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { quizStore } from '../store/quizStore';

const THEMES: { id: QuizTheme; name: string; color: string; bg: string }[] = [
  { id: 'standard', name: 'Classic Blue', color: 'bg-indigo-600', bg: 'bg-slate-50' },
  { id: 'royal', name: 'Royal Gold', color: 'bg-amber-600', bg: 'bg-stone-50' },
  { id: 'cyber', name: 'Cyber Neon', color: 'bg-fuchsia-600', bg: 'bg-slate-900' },
  { id: 'nature', name: 'Forest Zen', color: 'bg-emerald-600', bg: 'bg-emerald-50/30' },
  { id: 'minimal', name: 'Clean Ink', color: 'bg-slate-800', bg: 'bg-white' },
];

const CreateQuiz: React.FC<{ user: User }> = ({ user }) => {
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [selectedTheme, setSelectedTheme] = useState<QuizTheme>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  
  // Manual Quiz State
  const [manualQuestions, setManualQuestions] = useState<Partial<Question>[]>([
    { id: '1', type: QuestionType.MCQ, text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: Difficulty.MEDIUM, marks: 1 }
  ]);

  const navigate = useNavigate();
  const isStudent = user.role === UserRole.STUDENT;

  const handleAIComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return setError('Please enter a topic');
    setIsLoading(true);
    setError('');

    try {
      const questions = await generateQuizQuestions(topic, numQuestions, difficulty);
      const newQuiz: Quiz = {
        id: Math.random().toString(36).substr(2, 9),
        title: isStudent ? `${topic} Mock Exam` : `${topic} Mastery Quiz`,
        description: isStudent ? `AI Practice for ${topic}` : `Assessment for ${topic}`,
        topic,
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
        creatorId: user.id,
        createdAt: Date.now(),
        questions: questions.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) })),
        difficulty,
        timeLimit: numQuestions * 2,
        isLive: false,
        attemptsCount: 0,
        theme: selectedTheme
      };

      quizStore.saveQuiz(newQuiz);
      setGeneratedQuiz(newQuiz);
      if (!isStudent) navigate('/dashboard');
    } catch (err) {
      setError('AI Generation failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = () => {
    if (!topic) return setError('Please enter a quiz title/topic');
    if (manualQuestions.some(q => !q.text || !q.correctAnswer)) {
      return setError('Please fill in all question texts and correct answers');
    }

    const newQuiz: Quiz = {
      id: Math.random().toString(36).substr(2, 9),
      title: topic,
      description: description || `Manual quiz about ${topic}`,
      topic,
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      creatorId: user.id,
      createdAt: Date.now(),
      questions: manualQuestions.map(q => ({
        ...q,
        id: q.id || Math.random().toString(36).substr(2, 9),
        type: q.type || QuestionType.MCQ,
        text: q.text || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || Difficulty.MEDIUM,
        marks: q.marks || 1
      } as Question)),
      difficulty,
      timeLimit: manualQuestions.length * 2,
      isLive: false,
      attemptsCount: 0,
      theme: selectedTheme
    };

    quizStore.saveQuiz(newQuiz);
    navigate('/dashboard');
  };

  const addManualQuestion = () => {
    setManualQuestions([...manualQuestions, { 
      id: Math.random().toString(36).substr(2, 5), 
      type: QuestionType.MCQ, 
      text: '', 
      options: ['', '', '', ''], 
      correctAnswer: '', 
      explanation: '', 
      difficulty: Difficulty.MEDIUM, 
      marks: 1 
    }]);
  };

  const updateManualQuestion = (idx: number, updates: Partial<Question>) => {
    const updated = [...manualQuestions];
    updated[idx] = { ...updated[idx], ...updates };
    setManualQuestions(updated);
  };

  if (generatedQuiz && isStudent) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Mock Test Ready!</h1>
        <p className="text-slate-500 mb-8">AI prepared {generatedQuiz.questions.length} questions on {generatedQuiz.topic}.</p>
        <button onClick={() => navigate(`/quiz/${generatedQuiz.code}`)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">Start Mock Test Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Quiz Builder</h1>
        <p className="text-slate-500">Create engaging assessments using AI or manual curation.</p>
        
        {!isStudent && (
          <div className="mt-8 flex justify-center p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
            <button 
              onClick={() => setMode('AI')}
              className={`px-8 py-2 rounded-xl font-bold transition-all ${mode === 'AI' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              🤖 AI Generator
            </button>
            <button 
              onClick={() => setMode('MANUAL')}
              className={`px-8 py-2 rounded-xl font-bold transition-all ${mode === 'MANUAL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              ✍️ Manual Builder
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Quiz Basics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Quiz Title/Topic</label>
                <input 
                  type="text" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. World Geography"
                />
              </div>
              {mode === 'MANUAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm" 
                    placeholder="Short description..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Style Template</h3>
            <div className="grid grid-cols-1 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedTheme === theme.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${theme.color} border border-white/20`} />
                  <span className={`text-sm font-bold ${selectedTheme === theme.id ? 'text-indigo-700' : 'text-slate-600'}`}>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          {mode === 'AI' ? (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-indigo-600">🤖</span> AI Quiz Parameters
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Level</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Questions</label>
                  <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <button 
                onClick={handleAIComplete} 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? 'Gemini is brainstorming...' : 'Generate with Gemini AI'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {manualQuestions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative group animate-in slide-in-from-bottom-4 duration-300">
                  <div className="absolute -left-3 top-8 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
                    {qIdx + 1}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Type your question here..." 
                        value={q.text} 
                        onChange={(e) => updateManualQuestion(qIdx, { text: e.target.value })}
                        className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-100 focus:border-indigo-600 outline-none pb-2 transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="relative">
                          <input 
                            type="text" 
                            placeholder={`Option ${oIdx + 1}`} 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...(q.options || [])];
                              newOpts[oIdx] = e.target.value;
                              updateManualQuestion(qIdx, { options: newOpts });
                            }}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all pr-12 ${q.correctAnswer === opt && opt !== '' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 focus:border-indigo-600 bg-slate-50'}`}
                          />
                          <button 
                            onClick={() => updateManualQuestion(qIdx, { correctAnswer: opt })}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-indigo-500'}`}
                          >
                            {q.correctAnswer === opt && opt !== '' && '✓'}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="https://..." 
                          value={q.image || ''} 
                          onChange={(e) => updateManualQuestion(qIdx, { image: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Explanation</label>
                        <input 
                          type="text" 
                          placeholder="Why is this correct?" 
                          value={q.explanation} 
                          onChange={(e) => updateManualQuestion(qIdx, { explanation: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setManualQuestions(manualQuestions.filter((_, i) => i !== qIdx))}
                    className="absolute -right-3 -top-3 w-8 h-8 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="flex flex-col gap-4">
                <button 
                  onClick={addManualQuestion}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all"
                >
                  + Add Question
                </button>
                
                <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-slate-500 text-sm">{manualQuestions.length} Questions Drafted</p>
                  <button 
                    onClick={handleManualSave}
                    className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-xl transition-all transform active:scale-95"
                  >
                    Finalize & Save Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold animate-shake">{error}</div>}
    </div>
  );
};

export default CreateQuiz;
