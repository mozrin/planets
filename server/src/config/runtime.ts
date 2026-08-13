import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const runtime = {
  port: Number(process.env.PORT ?? 3000),
  dataDirectory: process.env.DATA_DIRECTORY ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "data"),
  backupDirectory: process.env.BACKUP_DIRECTORY ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "backups"),
  sessionDurationMilliseconds: 7 * 24 * 60 * 60 * 1000,
  planetSyncIntervalMilliseconds: 24 * 60 * 60 * 1000,
  authAttemptLimit: 10,
  authAttemptWindowMilliseconds: 15 * 60 * 1000,
};
