'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Game } from '@/types/domain';

const MODE_LABEL: Record<string, string> = {
  trivia:  '🧠 クイズ',
  polling: '📊 実態調査',
  opinion: '⚔️ 多数派/少数派',
};

interface PresetPreviewDrawerProps {
  preset: Game | null;
  onClose: () => void;
}

export default function PresetPreviewDrawer({ preset, onClose }: PresetPreviewDrawerProps) {
  const t = useTranslations('presets');
  const isOpen = preset !== null;

  // Escape キーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ドロワーが開いているときはbodyスクロールをロック
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ドロワー */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={preset?.title ?? 'プレビュー'}
        className={[
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl',
          'w-full sm:w-[420px]',
          'transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {preset && (
          <>
            {/* ヘッダー */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-pr-dark text-base leading-tight" style={{ fontFamily: 'var(--font-dm)' }}>
                {preset.title}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span>{MODE_LABEL[preset.mode] ?? preset.mode}</span>
                <span>·</span>
                <span>{t('previewQuestionCount', { count: preset.questions.length })}</span>
              </p>
            </div>

            {/* 問題リスト */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {preset.questions.map((q, i) => (
                <div
                  key={`${q.id ?? i}`}
                  className="bg-gray-50 rounded-[8px] border border-gray-200 p-4"
                >
                  <p className="text-sm font-bold text-pr-dark mb-3">
                    Q{i + 1}. {q.text}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {q.options.map((opt, j) => (
                      <li
                        key={`${i}-${j}`}
                        className="text-xs text-gray-600 bg-white border border-gray-200 rounded-[6px] px-3 py-2"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* フッター */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-[6px] border-[2px] border-pr-dark text-pr-dark font-bold text-sm hover:bg-gray-50 transition-colors touch-manipulation"
                style={{ fontFamily: 'var(--font-dm)' }}
              >
                {t('previewClose')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
