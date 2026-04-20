'use client';

import { GRADE_LABELS } from '@/types/domain';

interface Props {
  gradeMin: number;
  gradeMax: number;
  onChange: (min: number, max: number) => void;
}

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export function GradeRangeSelector({ gradeMin, gradeMax, onChange }: Props) {
  const handleFrom = (g: number) => {
    onChange(g, Math.max(g, gradeMax));
  };
  const handleTo = (g: number) => {
    onChange(Math.min(gradeMin, g), g);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">学年</p>
        <span className="text-xs font-bold text-pf-green">
          {GRADE_LABELS[gradeMin]}
          {gradeMin !== gradeMax ? ` 〜 ${GRADE_LABELS[gradeMax]}` : ''}
        </span>
      </div>

      {/* から */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold text-gray-400">から</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GRADES.map(g => {
            const active = g === gradeMin;
            const inRange = g >= gradeMin && g <= gradeMax;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleFrom(g)}
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-[8px] text-xs font-bold border-[2px] touch-manipulation transition-colors duration-75',
                  active
                    ? 'bg-pf-green text-white border-pf-green shadow-[2px_2px_0_#1A1A2E]'
                    : inRange
                    ? 'bg-pf-green/20 text-pf-dark border-pf-green/40'
                    : 'bg-white text-pf-dark border-pf-dark',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-dm)' }}
              >
                {GRADE_LABELS[g]}
              </button>
            );
          })}
        </div>
      </div>

      {/* まで */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold text-gray-400">まで</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GRADES.map(g => {
            const active = g === gradeMax;
            const inRange = g >= gradeMin && g <= gradeMax;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleTo(g)}
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-[8px] text-xs font-bold border-[2px] touch-manipulation transition-colors duration-75',
                  active
                    ? 'bg-pf-green text-white border-pf-green shadow-[2px_2px_0_#1A1A2E]'
                    : inRange
                    ? 'bg-pf-green/20 text-pf-dark border-pf-green/40'
                    : 'bg-white text-pf-dark border-pf-dark',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-dm)' }}
              >
                {GRADE_LABELS[g]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
