import type { GameEvent } from './types';

type Listener = (event: GameEvent) => void;

class GameEventBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(gameId: string, listener: Listener): () => void {
    if (!this.listeners.has(gameId)) {
      this.listeners.set(gameId, new Set());
    }
    this.listeners.get(gameId)!.add(listener);

    return () => {
      this.listeners.get(gameId)?.delete(listener);
    };
  }

  publish(gameId: string, event: GameEvent): void {
    this.listeners.get(gameId)?.forEach((listener) => listener(event));
  }
}

const globalForBus = globalThis as typeof globalThis & { __gameEventBus?: GameEventBus };

if (!globalForBus.__gameEventBus) {
  globalForBus.__gameEventBus = new GameEventBus();
}

export const gameEventBus: GameEventBus = globalForBus.__gameEventBus;
