'use client';

import type { GameStatus } from '@/types/domain';

const STATUS_CONFIG: Record<GameStatus, { label: string; bg: string; fg: string }> = {
  draft:    { label: 'Draft',   bg: '#F5F5F5', fg: '#111111' },
  lobby:    { label: 'Lobby',   bg: '#3B82F6', fg: '#FFFFFF' },
  question: { label: '🔴 LIVE', bg: '#FF0080', fg: '#FFFFFF' },
  reveal:   { label: 'Results', bg: '#FFD600', fg: '#111111' },
  ended:    { label: 'Ended',   bg: '#111111', fg: '#FFFFFF' },
};

export function GameStatusBadge({ status }: { status: GameStatus }) {
  const { label, bg, fg } = STATUS_CONFIG[status];
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold border-[2px] border-pr-dark shadow-[2px_2px_0_#111] uppercase tracking-wide"
      style={{ backgroundColor: bg, color: fg, fontFamily: 'var(--font-bebas)', fontSize: '0.85rem' }}
    >
      {label}
    </span>
  );
}
