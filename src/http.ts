import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { HuntApiClient, type HuntApiClientOptions } from "@huntapi/sdk";

import { createHuntApiMcpServer, type ToolClient } from "./server.js";

export const MCP_PATH = "/mcp";
export const DEFAULT_MAX_BODY_BYTES = 256 * 1024;

export interface HttpHandlerOptions {
  /** Origins accepted when a browser sends an Origin header. Empty rejects every browser origin. */
  readonly allowedOrigins?: readonly string[];
  readonly maxBodyBytes?: number;
  /** Builds the SDK client for one request; override in tests. */
  readonly clientFactory?: (options: HuntApiClientOptions) => ToolClient;
}

/**
 * Fetch-style handler for a stateless, authenticated Streamable HTTP endpoint. Each POST gets a fresh
 * server and transport; the caller's API key comes from the x-api-key header or a Bearer token.
 * Works on Node.js (see serve.ts), Cloudflare Workers, Deno, Bun and any Fetch-compatible runtime.
 */
export function createHttpHandler(
  options: HttpHandlerOptions = {},
): (request: Request) => Promise<Response> {
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const clientFactory =
    options.clientFactory ??
    ((clientOptions) => new HuntApiClient(clientOptions));

  return async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ status: "ok" });
    if (url.pathname !== MCP_PATH) return jsonError(404, "Not found.");
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    }
    const origin = request.headers.get("origin");
    if (origin !== null && !allowedOrigins.has(origin))
      return jsonError(403, "Origin not allowed.");
    const apiKey = readApiKey(request.headers);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Send your HuntAPI API key in the x-api-key header.",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
            "www-authenticate": 'Bearer realm="HuntAPI"',
          },
        },
      );
    }
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (declaredLength > maxBodyBytes)
      return jsonError(413, "Request body too large.");
    const body = await request.text();
    if (new TextEncoder().encode(body).length > maxBodyBytes)
      return jsonError(413, "Request body too large.");

    const server = createHuntApiMcpServer({
      client: clientFactory({ apiKey }),
      sensitiveValues: [apiKey],
    });
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
      return await transport.handleRequest(
        new Request(request.url, {
          method: "POST",
          headers: request.headers,
          body,
        }),
      );
    } finally {
      void server.close();
    }
  };
}

function readApiKey(headers: Headers): string | undefined {
  const direct = headers.get("x-api-key")?.trim();
  if (direct) return direct;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(headers.get("authorization") ?? "");
  return match?.[1];
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}
