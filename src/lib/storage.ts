const PREFIX = 'campuskit.v1';

export const STORAGE_KEYS = {
  state: `${PREFIX}.state`,
  settings: `${PREFIX}.settings`,
  subscription: `${PREFIX}.subscription`,
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[CampusKit] Unable to read "${key}" from storage.`, error);
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[CampusKit] Unable to write "${key}" to storage.`, error);
    return false;
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[CampusKit] Unable to remove "${key}" from storage.`, error);
  }
}

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach(removeKey);
}

export function estimateStorageBytes(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value) total += value.length * 2;
  });
  return total;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
