'use client';

import { useEffect, useRef } from 'react';
import type { GameEvent } from '@/lib/events/types';

export function useGameStream(
  gameId: string | null,
  onEvent: (event: GameEvent) => void
): void {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!gameId) return;

    const es = new EventSource(`/api/stream/${gameId}`);

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as GameEvent;
        onEventRef.current(event);
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      es.close();
    };
  }, [gameId]);
}
