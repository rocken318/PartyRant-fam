'use client';

import { SUBJECT_LABELS, SUBJECT_ICONS } from '@/types/domain';
import type { Subject } from '@/types/domain';

interface Props {
  value: Subject | null;
  onChange: (subject: Subject) => void;
  hiddenSubjects?: Subject[];
  multiValue?: Subject[];
  onMultiChange?: (subjects: Subject[]) => void;
}

export function SubjectSelector({ value, onChange, hiddenSubjects, multiValue, onMultiChange }: Props) {
  const subjects = (Object.keys(SUBJECT_LABELS) as Subject[]).filter(
    s => !hiddenSubjects?.includes(s)
  );
  const isMulti = multiValue !== undefined && onMultiChange !== undefined;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">教科</p>
      <div className="grid grid-cols-3 gap-2">
        {subjects.map(subject => {
          const isActive = isMulti ? multiValue.includes(subject) : value === subject;
          return (
            <button
              key={subject}
              type="button"
              onClick={() => {
                if (isMulti) {
                  const newArray = isActive
                    ? multiValue.filter(s => s !== subject)
                    : [...multiValue, subject];
                  onMultiChange(newArray);
                } else {
                  onChange(subject);
                }
              }}
              className={[
                'h-16 rounded-[10px] font-bold text-sm border-[3px] border-pf-dark shadow-[3px_3px_0_#1A1A2E] active:shadow-[1px_1px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation flex flex-col items-center justify-center gap-1',
                isActive
                  ? 'bg-pf-yellow text-pf-dark'
                  : 'bg-white text-pf-dark',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-dm)' }}
            >
              <span className="text-xl">{SUBJECT_ICONS[subject]}</span>
              <span className="text-xs leading-tight text-center">{SUBJECT_LABELS[subject]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
