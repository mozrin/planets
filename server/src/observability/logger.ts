type LogFields = Record<string, string | number | boolean | null | undefined>;

export function log(event: string, fields: LogFields = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event, ...fields }));
}

export function logError(event: string, error: unknown, fields: LogFields = {}) {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), event, error: error instanceof Error ? error.message : "Unknown error", ...fields }));
}
