import { mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { database } from "./database.ts";

const quote = (value: string) => value.replaceAll("'", "''");

export function createDatabaseBackup(directory: string, retain = 7) {
  mkdirSync(directory, { recursive: true });
  const path = join(directory, `planets-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.sqlite`);
  database.exec(`VACUUM INTO '${quote(path)}'`);
  const backups = readdirSync(directory).filter((file) => file.endsWith(".sqlite")).sort();
  backups.slice(0, Math.max(0, backups.length - retain)).forEach((file) => unlinkSync(join(directory, file)));
  return path;
}
