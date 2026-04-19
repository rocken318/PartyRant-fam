'use client';

import { useTranslations } from 'next-intl';
import type { Game } from '@/types/domain';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const MODE_KEY: Record<string, string> = {
  trivia:  'modeTrivia',
  polling: 'modePolling',
  opinion: 'modeOpinion',
};

interface PresetPreviewDrawerProps {
  preset: Game | null;
  onClose: () => void;
}

export default function PresetPreviewDrawer({ preset, onClose }: PresetPreviewDrawerProps) {
  const t = useTranslations('presets');

  return (
    <Sheet open={preset !== null} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:w-[420px] sm:max-w-[420px] flex flex-col p-0 overflow-hidden"
      >
        {preset && (
          <>
            <SheetHeader className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <SheetTitle className="text-left text-base font-bold text-pr-dark leading-tight">
                {preset.title}
              </SheetTitle>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span>{t(MODE_KEY[preset.mode] ?? 'modeTrivia')}</span>
                <span>·</span>
                <span>{t('previewQuestionCount', { count: preset.questions.length })}</span>
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {preset.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-gray-50 rounded-[8px] border border-gray-200 p-4"
                >
                  <p className="text-sm font-bold text-pr-dark mb-3">
                    Q{i + 1}. {q.text}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {q.options.map((opt, j) => (
                      <li
                        key={`${q.id}-${j}`}
                        className="text-xs text-gray-600 bg-white border border-gray-200 rounded-[6px] px-3 py-2"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <SheetFooter className="px-5 py-4 border-t border-gray-200 flex-shrink-0">
              <Button variant="outline" className="w-full" onClick={onClose}>
                {t('previewClose')}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
