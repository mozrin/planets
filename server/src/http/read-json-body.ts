import type { IncomingMessage } from "node:http";

const defaultMaximumBytes = 20_000;

export function readJsonBody<T>(request: IncomingMessage, maximumBytes = defaultMaximumBytes): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk: Buffer) => {
      body += chunk;
      if (body.length > maximumBytes) {
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? (JSON.parse(body) as T) : ({} as T));
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });
}
