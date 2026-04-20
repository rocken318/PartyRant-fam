export type GameType = 'trivia' | 'polling';   // opinion removed
export type PlayMode = 'live' | 'self_paced';

/** @deprecated use GameType */
export type GameMode = GameType;

export type GameStatus =
  | 'draft'
  | 'lobby'
  | 'question'
  | 'reveal'
  | 'ended';

export type Subject =
  | 'japanese'   // 国語
  | 'math'       // 算数/数学
  | 'science'    // 理科
  | 'social'     // 社会
  | 'english'    // 英語
  | 'ethics';    // 道徳

export const SUBJECT_LABELS: Record<Subject, string> = {
  japanese: '国語',
  math:     '算数・数学',
  science:  '理科',
  social:   '社会',
  english:  '英語',
  ethics:   '道徳',
};

export const SUBJECT_ICONS: Record<Subject, string> = {
  japanese: '📖',
  math:     '🔢',
  science:  '🔬',
  social:   '🌏',
  english:  '🇬🇧',
  ethics:   '💭',
};

// grade: 1=小1 … 6=小6, 7=中1 … 9=中3, 10=高1 … 12=高3
export const GRADE_LABELS: Record<number, string> = {
  1: '小1', 2: '小2', 3: '小3', 4: '小4', 5: '小5', 6: '小6',
  7: '中1', 8: '中2', 9: '中3',
  10: '高1', 11: '高2', 12: '高3',
};

export const GRADE_GROUPS = [
  { label: '小学生', shortLabel: '小1〜小6', min: 1, max: 6 },
  { label: '中学生', shortLabel: '中1〜中3', min: 7, max: 9 },
  { label: '高校生', shortLabel: '高1〜高3', min: 10, max: 12 },
] as const;

export interface Question {
  id: string;
  order: number;
  text: string;
  imageUrl?: string;
  options: string[];
  correctIndex?: number;
  timeLimitSec: number;
  grade?: number;      // 1–12 (optional for backward compat)
  subject?: Subject;   // optional for backward compat
}

export interface Event {
  id: string;
  hostId: string;
  name: string;
  createdAt: number;
}

export interface Game {
  id: string;
  eventId?: string;
  hostId?: string;
  joinCode: string;
  mode: GameType;
  gameMode: PlayMode;
  title: string;
  description?: string;
  scene?: string;
  isPreset?: boolean;
  questions: Question[];
  status: GameStatus;
  currentQuestionIndex: number;
  currentQuestionStartedAt?: number;
  createdAt: number;
  endedAt?: number;
}

export interface Player {
  id: string;
  gameId: string;
  displayName: string;
  joinedAt: number;
}

export interface Answer {
  id: string;
  gameId: string;
  playerId: string;
  questionId: string;
  choiceIndex: number;
  answeredAt: number;
  responseTimeMs: number;
}

export interface Score {
  playerId: string;
  displayName: string;
  totalPoints: number;
  correctCount: number;
}
