import type { ServerResponse } from "node:http";

export function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

export function sendJsonError(response: ServerResponse, status: number, error: string) {
  sendJson(response, status, { error });
}
