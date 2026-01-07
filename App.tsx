
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { quizStore } from './store/quizStore';

// Page Components
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Results from './pages/Results';
import Onboarding from './pages/Onboarding';

const Navbar: React.FC<{ user: User; onSwitchRole: () => void }> = ({ user, onSwitchRole }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Quizzify<span className="text-indigo-600">AI</span></span>
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          <button onClick={onSwitchRole} className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 hover:bg-slate-200 transition-colors">
            Switch to {user.role === UserRole.STUDENT ? 'Teacher' : 'Student'}
          </button>
        </div>
        
        <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
            <p className="text-xs text-indigo-600 font-medium">Lvl {user.level} • {user.xp} XP</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User>(quizStore.getUser());

  const handleOnboardingComplete = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const switchRole = () => {
    const newRole = user.role === UserRole.STUDENT ? UserRole.TEACHER : UserRole.STUDENT;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    quizStore.saveUser(updatedUser);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50">
        {!user.isOnboarded && <Onboarding onComplete={handleOnboardingComplete} />}
        
        <Navbar user={user} onSwitchRole={switchRole} />
        
        <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-12">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/dashboard" element={
              user.role === UserRole.STUDENT ? <StudentDashboard user={user} /> : <TeacherDashboard user={user} />
            } />
            <Route path="/create" element={<CreateQuiz user={user} />} />
            <Route path="/quiz/:code" element={<TakeQuiz user={user} />} />
            <Route path="/results/:attemptId" element={<Results user={user} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
