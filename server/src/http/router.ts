import type { IncomingMessage, ServerResponse } from "node:http";

export type RouteContext = {
  request: IncomingMessage;
  response: ServerResponse;
  url: URL;
};

export type Route = {
  method: string;
  pathname: string;
  handle: (context: RouteContext) => void | Promise<void>;
};

export function requestUrl(request: IncomingMessage) {
  return new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
}

export function createRouter(routes: Route[]) {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const url = requestUrl(request);
    const route = routes.find((candidate) => candidate.method === request.method && candidate.pathname === url.pathname);
    if (!route) return false;
    await route.handle({ request, response, url });
    return true;
  };
}
