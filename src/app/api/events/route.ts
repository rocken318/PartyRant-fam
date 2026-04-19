export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { store } from '@/lib/store';
import { getSessionUser } from '@/lib/supabase/auth-server';

const createEventSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

    const event = await store.createEvent({ hostId: user.id, name: parsed.data.name });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const events = await store.listEvents(user.id);
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
