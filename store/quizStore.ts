
import { Quiz, QuizAttempt, User, UserRole } from '../types';

const STORAGE_KEYS = {
  QUIZZES: 'quizzify_quizzes',
  ATTEMPTS: 'quizzify_attempts',
  USER: 'quizzify_user'
};

const DEFAULT_USER: User = {
  id: 'user_' + Math.random().toString(36).substr(2, 5),
  name: '',
  email: '',
  role: UserRole.STUDENT,
  xp: 0,
  level: 1,
  badges: [],
  streak: 0,
  isOnboarded: false
};

export const quizStore = {
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  },
  
  saveQuiz: (quiz: Quiz) => {
    const quizzes = quizStore.getQuizzes();
    quizzes.push(quiz);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  },

  getQuizByCode: (code: string): Quiz | undefined => {
    return quizStore.getQuizzes().find(q => q.code.toUpperCase() === code.toUpperCase());
  },

  saveAttempt: (attempt: QuizAttempt) => {
    const attempts = quizStore.getAttempts();
    attempts.push(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    
    // Update user stats
    const user = quizStore.getUser();
    user.xp += attempt.score * 10;
    user.level = Math.floor(user.xp / 500) + 1;
    // Simple streak logic: if last attempt was today, keep it, if yesterday +1, if more reset. 
    // (Simplified for this demo)
    user.streak = (user.streak || 0) + 1;
    quizStore.saveUser(user);

    // Update attempt count for quiz
    const quizzes = quizStore.getQuizzes();
    const quizIdx = quizzes.findIndex(q => q.id === attempt.quizId);
    if (quizIdx !== -1) {
      quizzes[quizIdx].attemptsCount = (quizzes[quizIdx].attemptsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    }
  },

  getAttempts: (): QuizAttempt[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return data ? JSON.parse(data) : [];
  },

  getUser: (): User => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : DEFAULT_USER;
  },

  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};
