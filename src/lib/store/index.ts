import { SupabaseGameStore } from './supabase-store';
import type { GameStore } from './types';

export const store: GameStore = new SupabaseGameStore();
