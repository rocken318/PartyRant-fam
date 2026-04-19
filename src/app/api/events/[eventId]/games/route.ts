export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const games = await store.listGamesByEvent(eventId);
    return NextResponse.json(games);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
