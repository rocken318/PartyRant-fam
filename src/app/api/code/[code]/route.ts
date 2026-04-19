export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const game = await store.getGameByCode(code.toUpperCase());
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
