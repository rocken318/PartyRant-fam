import type { GameEvent } from './types';

export function getGameBroadcastTopic(gameId: string): string {
  return `game-${gameId}`;
}

// Supabase Realtime REST broadcast works across Vercel serverless instances.
export async function broadcastGameEvent(gameId: string, event: GameEvent): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const topic = getGameBroadcastTopic(gameId);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'apikey': key,
      },
      body: JSON.stringify({
        messages: [{
          topic,
          event: 'game_event',
          payload: event,
          private: false,
        }],
      }),
    });

    if (!res.ok) {
      const message = await res.text().catch(() => '');
      console.error('Supabase realtime broadcast failed', {
        gameId,
        topic,
        status: res.status,
        message,
      });
    }
  } catch (error) {
    console.error('Supabase realtime broadcast error', { gameId, topic, error });
  }
}
