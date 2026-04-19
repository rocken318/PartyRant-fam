/**
 * seed-presets.ts
 * Imports files/partyrant_presets.json into Supabase as preset games.
 *
 * Usage:
 *   pnpm tsx scripts/seed-presets.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── types ────────────────────────────────────────────────────────────────────

interface PresetQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

interface PresetGame {
  scene: string;
  title: string;
  mode: 'trivia' | 'polling' | 'opinion';
  loseRule?: 'minority' | 'majority';
  description: string;
  questions: PresetQuestion[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const files = [
    '../files/partyrant_presets.json',
    '../files/partyrant_majority_quiz_pack.json',
  ];

  const presets: PresetGame[] = [];
  for (const f of files) {
    const filePath = join(__dirname, f);
    const data: PresetGame[] = JSON.parse(readFileSync(filePath, 'utf-8'));
    presets.push(...data);
    console.log(`  Loaded ${data.length} presets from ${f}`);
  }

  console.log(`Total: ${presets.length} presets to insert.`);

  // Delete existing presets first (clean re-seed)
  const { error: delErr } = await supabase.from('games').delete().eq('is_preset', true);
  if (delErr) {
    console.warn('Warning: could not delete existing presets:', delErr.message);
  } else {
    console.log('Cleared existing presets.');
  }

  let inserted = 0;
  let failed = 0;

  for (const preset of presets) {
    const gameId = generateId();
    const now = Date.now();

    const questions = preset.questions.map((q, i) => ({
      id: generateId(),
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      timeLimitSec: q.timeLimitSec,
      orderIndex: i,
    }));

    const row = {
      id: gameId,
      event_id: null,
      host_id: null,
      join_code: generateJoinCode(),
      mode: preset.mode,
      lose_rule: preset.loseRule ?? null,
      game_mode: 'live',
      title: preset.title,
      description: preset.description,
      scene: preset.scene,
      is_preset: true,
      questions,
      status: 'draft',
      current_question_index: 0,
      current_question_started_at: null,
      created_at: now,
      ended_at: null,
    };

    const { error } = await supabase.from('games').insert(row);
    if (error) {
      console.error(`  ✗ Failed: "${preset.title}" — ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ Inserted: [${preset.scene}] ${preset.title}`);
      inserted++;
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${failed} failed.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
