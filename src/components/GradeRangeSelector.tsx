'use client';

import { GRADE_GROUPS } from '@/types/domain';

interface Props {
  gradeMin: number;
  gradeMax: number;
  onChange: (min: number, max: number) => void;
}

export function GradeRangeSelector({ gradeMin, gradeMax, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">学年</p>
      <div className="flex flex-col gap-2">
        {GRADE_GROUPS.map(group => {
          const isActive = gradeMin === group.min && gradeMax === group.max;
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => onChange(group.min, group.max)}
              className={[
                'h-14 rounded-[10px] font-bold text-base border-[3px] shadow-[3px_3px_0_#1A1A2E] active:shadow-[1px_1px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation flex items-center justify-between px-5',
                isActive
                  ? 'bg-pf-green text-white border-pf-dark'
                  : 'bg-white text-pf-dark border-pf-dark',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-dm)' }}
            >
              <span>{group.label}</span>
              <span className="text-sm opacity-70">{group.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
