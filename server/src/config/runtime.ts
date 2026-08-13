import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Environment = NodeJS.ProcessEnv;

function positiveInteger(value: string | undefined, fallback: number, name: string) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

export function readRuntime(environment: Environment = process.env) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  const nodeEnvironment = environment.NODE_ENV ?? "development";
  return {
    nodeEnvironment,
    port: positiveInteger(environment.PORT, 3000, "PORT"),
    dataDirectory: environment.DATA_DIRECTORY ?? join(root, "data"),
    backupDirectory: environment.BACKUP_DIRECTORY ?? join(root, "backups"),
    sessionDurationMilliseconds: 7 * 24 * 60 * 60 * 1000,
    planetSyncIntervalMilliseconds: 24 * 60 * 60 * 1000,
    authAttemptLimit: positiveInteger(environment.AUTH_ATTEMPT_LIMIT, 10, "AUTH_ATTEMPT_LIMIT"),
    authAttemptWindowMilliseconds: positiveInteger(environment.AUTH_ATTEMPT_WINDOW_MILLISECONDS, 15 * 60 * 1000, "AUTH_ATTEMPT_WINDOW_MILLISECONDS"),
  };
}

export const runtime = readRuntime();
