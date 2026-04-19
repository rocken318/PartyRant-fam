'use client';

export function useLocalPlayer(gameId: string) {
  const key = `partyrant_player_${gameId}`;

  function getPlayer(): { playerId: string; displayName: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function savePlayer(playerId: string, displayName: string) {
    localStorage.setItem(key, JSON.stringify({ playerId, displayName }));
  }

  function clearPlayer() {
    localStorage.removeItem(key);
  }

  return { getPlayer, savePlayer, clearPlayer };
}
