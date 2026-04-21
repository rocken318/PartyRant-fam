/**
 * seed-student-surveys.ts
 * Imports all 5 student survey JSON files from famquiz/0421/partyrant_student_surveys/
 * into Supabase as preset games with scene = '学生の実態調査'.
 *
 * Usage:
 *   pnpm tsx scripts/seed-student-surveys.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing Supabase env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY);

// ── helpers ───────────────────────────────────────────────────────────────────

function uid(): string { return crypto.randomUUID(); }

function joinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── types ─────────────────────────────────────────────────────────────────────

interface RawQuestion {
  text: string;
  options: string[];
  correctIndex: null;
  timeLimitSec: number;
}

interface RawGame {
  scene?: string;
  title: string;
  mode: 'polling';
  description: string;
  questions: RawQuestion[];
}

// ── batch runner ──────────────────────────────────────────────────────────────

async function batchRun<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ── per-file seed ─────────────────────────────────────────────────────────────

async function seedFile(
  filePath: string,
  filename: string
): Promise<{ file: string; inserted: number; failed: number }> {
  const raw: unknown[] = JSON.parse(readFileSync(filePath, 'utf-8'));
  const games: RawGame[] = raw.filter(
    (g): g is RawGame =>
      typeof g === 'object' && g !== null && 'questions' in g && Array.isArray((g as RawGame).questions)
  );
  const now = Date.now();

  const results = await batchRun(games, 5, async (game) => {
    const row = {
      id: uid(),
      event_id: null,
      host_id: null,
      join_code: joinCode(),
      mode: game.mode,
      game_mode: 'live',
      title: game.title,
      description: game.description ?? null,
      scene: '学生の実態調査',
      is_preset: true,
      questions: game.questions.map((q, i) => ({
        id: uid(),
        order: i,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimitSec: q.timeLimitSec,
      })),
      status: 'draft',
      current_question_index: 0,
      current_question_started_at: null,
      created_at: now,
      ended_at: null,
    };

    const { error } = await supabase.from('games').insert(row);
    if (error) {
      process.stderr.write(`  ✗ ${filename} / "${game.title}": ${error.message}\n`);
      return false;
    }
    return true;
  });

  const inserted = results.filter(Boolean).length;
  const failed = results.length - inserted;
  return { file: filename, inserted, failed };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const dir = 'Y:/webwork/famquiz/0421/partyrant_student_surveys';
  const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();

  // Delete existing student-survey presets to avoid duplicates
  const { error: delErr, count: delCount } = await supabase
    .from('games')
    .delete({ count: 'exact' })
    .eq('scene', '学生の実態調査')
    .eq('is_preset', true);
  if (delErr) {
    console.warn('⚠ Could not clear existing student survey presets:', delErr.message);
  } else {
    console.log(`Cleared ${delCount ?? 0} existing student survey presets.\n`);
  }

  console.log(`Seeding ${files.length} files...\n`);

  const results = await batchRun(files, 5, f => seedFile(join(dir, f), f));

  console.log('\n─────────────────────────────────────');
  let totalInserted = 0, totalFailed = 0;
  for (const r of results) {
    const icon = r.failed === 0 ? '✓' : '⚠';
    console.log(`  ${icon} ${r.file.replace('.json', '')} — ${r.inserted} games`);
    totalInserted += r.inserted;
    totalFailed += r.failed;
  }
  console.log('─────────────────────────────────────');
  console.log(`\nDone: ${totalInserted} inserted, ${totalFailed} failed.\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
