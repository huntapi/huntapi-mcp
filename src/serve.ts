import { createServer, type IncomingMessage, type Server } from "node:http";

import { createHttpHandler, type HttpHandlerOptions } from "./http.js";

export interface ServeOptions extends HttpHandlerOptions {
  readonly port: number;
  readonly host?: string;
}

/** Serves the Streamable HTTP handler with node:http. */
export async function startHttpServer(options: ServeOptions): Promise<Server> {
  const handler = createHttpHandler(options);
  const server = createServer((req, res) => {
    void (async () => {
      try {
        const response = await handler(await toRequest(req, options));
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch {
        if (!res.headersSent)
          res.writeHead(500, { "content-type": "application/json" });
        res.end('{"error":"Internal error."}');
      }
    })();
  });
  await new Promise<void>((resolve) =>
    server.listen(options.port, options.host ?? "127.0.0.1", resolve),
  );
  return server;
}

async function toRequest(
  req: IncomingMessage,
  options: ServeOptions,
): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(name, v));
    else if (value !== undefined) headers.set(name, value);
  }
  const url = `http://${options.host ?? "127.0.0.1"}:${options.port}${req.url ?? "/"}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method ?? "GET",
    headers,
    ...(hasBody ? { body: Buffer.concat(chunks) } : {}),
  });
}
