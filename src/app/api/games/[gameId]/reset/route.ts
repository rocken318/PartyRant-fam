export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const db = createServerClient();

    // Delete answers and players, then reset game to lobby
    await db.from('answers').delete().eq('game_id', gameId);
    await db.from('players').delete().eq('game_id', gameId);
    const { data, error } = await db
      .from('games')
      .update({
        status: 'lobby',
        current_question_index: -1,
        current_question_started_at: null,
        ended_at: null,
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Reset failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
