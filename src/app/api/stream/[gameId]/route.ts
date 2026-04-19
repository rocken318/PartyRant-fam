export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { store } from '@/lib/store';
import { getGameBroadcastTopic } from '@/lib/events/broadcast';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await context.params;
  const game = await store.getGame(gameId);
  if (!game) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      send({ type: 'connected', gameId });

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const topic = getGameBroadcastTopic(gameId);
      const channel = supabase.channel(topic, {
        config: { private: false },
      });
      channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
        send(payload);
      });
      channel.subscribe((status, error) => {
        if (status === 'SUBSCRIBED') return;
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('Supabase realtime stream subscription failed', {
            gameId,
            topic,
            status,
            error,
          });
          send({ type: 'stream_error', status });
        }
      });

      const pingInterval = setInterval(() => {
        if (closed) {
          clearInterval(pingInterval);
          void supabase.removeChannel(channel);
          return;
        }
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          closed = true;
          clearInterval(pingInterval);
          void supabase.removeChannel(channel);
        }
      }, 15000);

      req.signal.addEventListener('abort', async () => {
        closed = true;
        clearInterval(pingInterval);
        await supabase.removeChannel(channel);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
