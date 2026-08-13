type SyncStatus = { completed_at: number | null; record_count: number; last_error: string | null };

export function readiness(sync: SyncStatus, maximumAgeMilliseconds: number, now = Date.now()) {
  const ageMilliseconds = sync.completed_at === null ? null : Math.max(0, now - sync.completed_at);
  const fresh = ageMilliseconds !== null && ageMilliseconds <= maximumAgeMilliseconds && !sync.last_error;
  return { ready: fresh, planetSync: { ...sync, ageMilliseconds, freshness: fresh ? "fresh" : "stale" } };
}
