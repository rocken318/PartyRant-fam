export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { store } from '@/lib/store';
import type { Question } from '@/types/domain';

const schema = z.object({
  gradeMin: z.number().int().min(1).max(12),
  gradeMax: z.number().int().min(1).max(12),
  subject:  z.enum(['japanese', 'math', 'science', 'social', 'english', 'ethics'] as const),
  count:    z.number().int().min(3).max(20).default(10),
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const { gradeMin, gradeMax, subject, count } = parsed.data;

    const presets = await store.listPresets();
    const pool: Question[] = [];

    for (const preset of presets) {
      for (const q of preset.questions) {
        if (q.grade === undefined || q.subject === undefined) continue;
        if (q.grade < gradeMin || q.grade > gradeMax) continue;
        if (q.subject !== subject) continue;
        pool.push(q);
      }
    }

    if (pool.length === 0) {
      return NextResponse.json(
        { error: `${subject} の問題がまだありません。問題が追加されるまでお待ちください。` },
        { status: 404 }
      );
    }

    const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
    return NextResponse.json(selected);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '問題の取得に失敗しました' }, { status: 500 });
  }
}
