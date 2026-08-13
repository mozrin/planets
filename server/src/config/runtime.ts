import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const runtime = {
  port: Number(process.env.PORT ?? 3000),
  dataDirectory: process.env.DATA_DIRECTORY ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "data"),
  sessionDurationMilliseconds: 7 * 24 * 60 * 60 * 1000,
  planetSyncIntervalMilliseconds: 24 * 60 * 60 * 1000,
};
