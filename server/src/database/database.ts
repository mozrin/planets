import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { runtime } from "../config/runtime.ts";

mkdirSync(runtime.dataDirectory, { recursive: true });
export const database = new DatabaseSync(join(runtime.dataDirectory, "planets.sqlite"));
