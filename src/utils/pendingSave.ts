import { SavedCharacter } from '../types/game';

export const pendingSaveKey = (userId: string, characterId: string) =>
  `fragmentos-pending-save:${userId}:${characterId}`;

export function getPendingSave(userId: string, characterId: string): SavedCharacter | null {
  const key = pendingSaveKey(userId, characterId);
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as SavedCharacter;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function storePendingSave(userId: string, character: SavedCharacter) {
  localStorage.setItem(pendingSaveKey(userId, character.id), JSON.stringify(character));
}
