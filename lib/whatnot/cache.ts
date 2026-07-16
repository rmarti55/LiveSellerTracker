/** In-process TTL cache for RealWhatnot — keeps Whatnot traffic polite (~1 feed / 3 min). */

const TTL_MS = 180_000; // 3 minutes

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export async function withWhatnotCache<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const value = await fn();
  store.set(key, { value, expiresAt: now + TTL_MS });
  return value;
}
