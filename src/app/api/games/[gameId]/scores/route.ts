export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { computeLeaderboard } from '@/lib/game-logic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const [game, players, answers] = await Promise.all([
      store.getGame(gameId),
      store.listPlayers(gameId),
      store.listAnswers(gameId),
    ]);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const scores = computeLeaderboard(game, answers, players);
    return NextResponse.json(scores);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
