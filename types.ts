
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  MATCHING = 'MATCHING'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  image?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  marks: number;
}

export type QuizTheme = 'standard' | 'royal' | 'cyber' | 'nature' | 'minimal';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  code: string;
  creatorId: string;
  createdAt: number;
  questions: Question[];
  difficulty: Difficulty;
  timeLimit: number; // in minutes
  isLive: boolean;
  attemptsCount: number;
  theme?: QuizTheme;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  isOnboarded: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalMarks: number;
  timeTaken: number;
  completedAt: number;
  answers: Record<string, any>;
  topicPerformance: Record<string, number>;
}
