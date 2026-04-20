'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { GradeRangeSelector } from '@/components/GradeRangeSelector';
import { SubjectSelector } from '@/components/SubjectSelector';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { Question, Subject } from '@/types/domain';

type SoloPhase = 'setup' | 'quiz' | 'result';
const COUNT_OPTIONS = [5, 10, 20] as const;

export default function SoloPage() {
  // Setup state
  const [phase, setPhase] = useState<SoloPhase>('setup');
  const [gradeMin, setGradeMin] = useState(1);
  const [gradeMax, setGradeMax] = useState(6);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [count, setCount] = useState<5 | 10 | 20>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; choiceIndex: number }[]>([]);
  const [startedAt, setStartedAt] = useState(0);

  const handleStart = async () => {
    if (!subject) { setError('教科を選んでください'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeMin, gradeMax, subject, count }),
      });
      if (!res.ok) {
        const data = await res.json() as { error: string };
        throw new Error(data.error ?? 'エラーが発生しました');
      }
      const qs = await res.json() as Question[];
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswers([]);
      setSelected(null);
      setStartedAt(Date.now());
      setPhase('quiz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((choiceIndex: number) => {
    if (selected !== null) return;
    const q = questions[currentIndex];
    setSelected(choiceIndex);
    const correct = q.correctIndex === choiceIndex;
    setAnswers(prev => [...prev, { correct, choiceIndex }]);
  }, [selected, questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setStartedAt(Date.now());
    }
  }, [currentIndex, questions.length]);

  // ── Setup ──────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <main className="flex flex-col min-h-screen bg-white max-w-[480px] mx-auto">
        <div className="bg-pf-dark px-4 py-4 flex items-center gap-3 rounded-b-[20px]">
          <Link href="/" className="text-white text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full border-[2px] border-white/30 touch-manipulation">
            ←
          </Link>
          <div>
            <span className="text-pf-green text-3xl tracking-wide" style={{ fontFamily: 'var(--font-bebas)' }}>
              ひとりで練習
            </span>
            <p className="text-gray-400 text-xs font-bold">学年と教科を選んでスタート</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 flex flex-col gap-6">
          <GradeRangeSelector
            gradeMin={gradeMin}
            gradeMax={gradeMax}
            onChange={(min, max) => { setGradeMin(min); setGradeMax(max); }}
          />

          <SubjectSelector value={subject} onChange={setSubject} />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">問題数</p>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={[
                    'flex-1 h-12 rounded-[10px] font-bold text-base border-[3px] border-pf-dark shadow-[3px_3px_0_#1A1A2E] active:shadow-[1px_1px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation',
                    count === n ? 'bg-pf-blue text-white' : 'bg-white text-pf-dark',
                  ].join(' ')}
                  style={{ fontFamily: 'var(--font-dm)' }}
                >
                  {n}問
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 rounded-[8px] px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!subject || loading}
            className="w-full h-16 bg-pf-green text-white text-xl font-bold rounded-[12px] border-[3px] border-pf-dark shadow-[5px_5px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-[transform,box-shadow] duration-75 disabled:opacity-50 touch-manipulation mt-auto"
            style={{ fontFamily: 'var(--font-dm)' }}
          >
            {loading ? '読み込み中...' : '🚀 スタート！'}
          </button>
        </div>
      </main>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentIndex];
    return (
      <main className="flex flex-col min-h-screen bg-white max-w-[480px] mx-auto">
        <div className="bg-pf-dark px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-dm)' }}>
            {currentIndex + 1} / {questions.length}
          </span>
          <CountdownTimer
            timeLimitSec={q.timeLimitSec}
            startedAt={startedAt}
            onExpired={() => { if (selected === null) handleAnswer(-1); }}
          />
        </div>

        <div className="flex-1 px-4 py-6 flex flex-col gap-6">
          <p className="text-pf-dark text-xl font-extrabold leading-snug" style={{ fontFamily: 'var(--font-dm)' }}>
            {q.text}
          </p>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              let cls = 'bg-white text-pf-dark border-pf-dark';
              if (selected !== null) {
                if (i === q.correctIndex) cls = 'bg-pf-green text-white border-pf-green';
                else if (i === selected)  cls = 'bg-red-500 text-white border-red-500';
                else                      cls = 'bg-gray-100 text-gray-400 border-gray-200';
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full min-h-[56px] px-4 text-left rounded-[10px] font-bold text-base border-[3px] shadow-[4px_4px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow,background-color] duration-150 disabled:cursor-not-allowed touch-manipulation ${cls}`}
                  style={{ fontFamily: 'var(--font-dm)' }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (() => {
            const isCorrect = q.correctIndex !== undefined && selected === q.correctIndex;
            const correctText = q.correctIndex !== undefined ? q.options[q.correctIndex] : null;
            const isLast = currentIndex + 1 >= questions.length;
            return (
              <div className={[
                'rounded-[12px] border-[3px] px-4 py-4 flex flex-col gap-3',
                isCorrect
                  ? 'bg-green-50 border-pf-green'
                  : 'bg-red-50 border-red-500',
              ].join(' ')}>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-dm)' }}>
                  {isCorrect ? '⭕️ 正解！' : '❌ 不正解'}
                </p>
                {correctText && (
                  <p className="text-sm font-bold text-pf-dark">
                    正解は「{correctText}」でした
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 bg-pf-green text-white font-bold text-base rounded-[10px] border-[3px] border-pf-dark shadow-[4px_4px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation"
                  style={{ fontFamily: 'var(--font-dm)' }}
                >
                  {isLast ? '結果を見る' : '次の問題 →'}
                </button>
              </div>
            );
          })()}
        </div>
      </main>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────
  const correctCount = answers.filter(a => a.correct).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <main className="flex flex-col min-h-screen bg-white max-w-[480px] mx-auto">
      <div className="bg-pf-dark px-4 py-4 rounded-b-[20px]">
        <span className="text-pf-green text-3xl tracking-wide" style={{ fontFamily: 'var(--font-bebas)' }}>
          結果
        </span>
      </div>

      <div className="flex-1 px-4 py-10 flex flex-col items-center gap-6">
        <div className="text-7xl">{pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '😅'}</div>
        <p className="text-5xl font-extrabold text-pf-dark" style={{ fontFamily: 'var(--font-bebas)' }}>
          {correctCount} / {total}問正解
        </p>
        <p className="text-2xl font-bold text-pf-green">{pct}%</p>

        {/* 問題別復習リスト */}
        <div className="w-full flex flex-col border-[3px] border-pf-dark rounded-[12px] overflow-hidden shadow-[4px_4px_0_#1A1A2E]">
          {questions.map((q, i) => {
            const a = answers[i];
            if (!a) return null;
            const correctText = q.correctIndex !== undefined ? q.options[q.correctIndex] : null;
            const myText = a.choiceIndex >= 0 ? q.options[a.choiceIndex] : null;
            return (
              <div key={q.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">{a.correct ? '⭕️' : '❌'}</span>
                  <p className="text-sm font-bold text-pf-dark leading-snug">{q.text}</p>
                </div>
                {correctText && (
                  <p className="text-xs font-bold text-pf-green mt-1 pl-6">
                    正解: {correctText}
                  </p>
                )}
                {!a.correct && myText && (
                  <p className="text-xs text-red-500 mt-0.5 pl-6">
                    あなた: {myText}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full flex flex-col gap-3 mt-6">
          <button
            type="button"
            onClick={() => { setPhase('setup'); setSelected(null); setAnswers([]); }}
            className="w-full h-14 bg-pf-green text-white font-bold text-lg rounded-[12px] border-[3px] border-pf-dark shadow-[4px_4px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation"
            style={{ fontFamily: 'var(--font-dm)' }}
          >
            もう一度やる
          </button>
          <Link
            href="/"
            className="w-full h-12 bg-white text-pf-dark font-bold text-base rounded-[12px] border-[3px] border-pf-dark shadow-[4px_4px_0_#1A1A2E] flex items-center justify-center touch-manipulation"
            style={{ fontFamily: 'var(--font-dm)' }}
          >
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
