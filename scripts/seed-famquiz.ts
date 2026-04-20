/**
 * seed-famquiz.ts
 * Imports all files from generated_quizzes/ into Supabase as family quiz presets.
 * Adds grade (1-12) and subject to every question based on filename.
 *
 * Usage:
 *   pnpm tsx scripts/seed-famquiz.ts
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

// ── mappings ─────────────────────────────────────────────────────────────────

function parseGrade(filename: string): number {
  const m = filename.match(/^(小学|中学|高校)(\d)年生/);
  if (!m) throw new Error(`Cannot parse grade from: ${filename}`);
  const n = parseInt(m[2]);
  if (m[1] === '小学') return n;        // 1-6
  if (m[1] === '中学') return 6 + n;   // 7-9
  return 9 + n;                          // 高校: 10-12
}

type Subject = 'japanese' | 'math' | 'science' | 'social' | 'english' | 'ethics';

function parseSubject(filename: string): Subject {
  if (filename.includes('国語')) return 'japanese';
  if (filename.includes('算数') || filename.includes('数学')) return 'math';
  if (filename.includes('理科')) return 'science';
  if (filename.includes('社会')) return 'social';
  if (filename.includes('英語')) return 'english';
  if (filename.includes('道徳')) return 'ethics';
  throw new Error(`Cannot parse subject from: ${filename}`);
}

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
  correctIndex: number;
  timeLimitSec: number;
}

interface RawGame {
  scene?: string;
  title: string;
  mode: 'trivia' | 'polling';
  description: string;
  questions: RawQuestion[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

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
  const grade = parseGrade(filename);
  const subject = parseSubject(filename);
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
      scene: game.scene ?? null,
      is_preset: true,
      questions: game.questions.map((q, i) => ({
        id: uid(),
        order: i,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimitSec: q.timeLimitSec,
        grade,
        subject,
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
  const dir = 'Y:/webwork/famquiz/generated_quizzes';
  const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();

  // Clear only family-quiz presets (those whose questions have a 'grade' field).
  // This avoids wiping party presets seeded by seed-presets.ts.
  const { data: existing, error: listErr } = await supabase
    .from('games')
    .select('id, questions')
    .eq('is_preset', true);
  if (listErr) {
    console.warn('⚠ Could not list existing presets:', listErr.message);
  } else {
    const famIds = (existing ?? [])
      .filter(r => (r.questions as { grade?: number }[])?.[0]?.grade !== undefined)
      .map(r => r.id as string);
    if (famIds.length > 0) {
      const { error: delErr } = await supabase.from('games').delete().in('id', famIds);
      if (delErr) console.warn('⚠ Could not clear existing family presets:', delErr.message);
      else console.log(`🗑  Cleared ${famIds.length} existing family presets.\n`);
    } else {
      console.log('🗑  No existing family presets to clear.\n');
    }
  }

  console.log(`📚 Seeding ${files.length} files (8 files at a time)...\n`);

  const results = await batchRun(files, 8, f => seedFile(join(dir, f), f));

  console.log('\n─────────────────────────────────────');
  let totalInserted = 0, totalFailed = 0;
  for (const r of results) {
    const icon = r.failed === 0 ? '✓' : '⚠';
    console.log(`  ${icon} ${r.file.replace('.json', '')} — ${r.inserted} games`);
    totalInserted += r.inserted;
    totalFailed += r.failed;
  }
  console.log('─────────────────────────────────────');
  console.log(`\n✅ Done: ${totalInserted} inserted, ${totalFailed} failed.\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
