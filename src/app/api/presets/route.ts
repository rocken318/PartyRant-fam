import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = await store.listPresets();
    const presets = all.filter(p =>
      p.questions.length > 0 &&
      (p.questions[0] as { grade?: number }).grade !== undefined
    );
    return NextResponse.json(presets);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load presets' }, { status: 500 });
  }
}
