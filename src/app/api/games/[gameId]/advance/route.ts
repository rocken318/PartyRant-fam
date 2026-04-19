export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { broadcastGameEvent } from '@/lib/events/broadcast';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const game = await store.getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const prevStatus = game.status;
    const prevIndex = game.currentQuestionIndex;

    const updated = await store.advanceQuestion(gameId);

    if (prevStatus === 'lobby') {
      await broadcastGameEvent(gameId, {
        type: 'question_started',
        questionIndex: updated.currentQuestionIndex,
        startedAt: updated.currentQuestionStartedAt!,
      });
    } else if (prevStatus === 'question') {
      await broadcastGameEvent(gameId, {
        type: 'question_ended',
        questionIndex: prevIndex,
      });
    } else if (prevStatus === 'reveal') {
      if (updated.status === 'question') {
        await broadcastGameEvent(gameId, {
          type: 'question_started',
          questionIndex: updated.currentQuestionIndex,
          startedAt: updated.currentQuestionStartedAt!,
        });
      } else if (updated.status === 'ended') {
        await broadcastGameEvent(gameId, { type: 'game_ended', game: updated });
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
