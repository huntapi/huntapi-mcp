import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  HuntApiApiError,
  HuntApiError,
  HuntApiSerializationError,
  type ApiResponse,
} from "@huntapi/sdk";

import { redact } from "./redaction.js";

/** Largest JSON text returned to the model, in characters. */
export const MAX_TEXT_CHARS = 200_000;
/** Largest file returned inline (image or embedded resource), in bytes. */
export const MAX_INLINE_BYTES = 4 * 1024 * 1024;

const INLINE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export function toToolResult(
  response: ApiResponse,
  path: string,
): CallToolResult {
  if (response.kind === "json") {
    const text = JSON.stringify(response.data, null, 2) ?? "null";
    return {
      content: [
        {
          type: "text",
          text:
            text.length > MAX_TEXT_CHARS
              ? `${text.slice(0, MAX_TEXT_CHARS)}\n… (truncated: ${text.length} characters in total)`
              : text,
        },
      ],
    };
  }
  const mimeType = (response.contentType ?? "application/octet-stream")
    .split(";", 1)[0]!
    .trim()
    .toLowerCase();
  const size = response.bytes.length;
  const summary = {
    type: "text" as const,
    text: `${mimeType} response from ${path} (${size} bytes).`,
  };
  if (size > MAX_INLINE_BYTES) {
    return {
      content: [
        {
          ...summary,
          text: `${summary.text} Too large to return inline; call the API directly or use the SDK.`,
        },
      ],
    };
  }
  const data = Buffer.from(response.bytes).toString("base64");
  if (INLINE_IMAGE_TYPES.has(mimeType)) {
    return { content: [{ type: "image", data, mimeType }, summary] };
  }
  const uri = `huntapi://response${path}`;
  if (
    mimeType.startsWith("text/") ||
    mimeType === "image/svg+xml" ||
    mimeType.endsWith("+xml")
  ) {
    return {
      content: [
        {
          type: "resource",
          resource: {
            uri,
            mimeType,
            text: Buffer.from(response.bytes).toString("utf8"),
          },
        },
        summary,
      ],
    };
  }
  return {
    content: [
      { type: "resource", resource: { uri, mimeType, blob: data } },
      summary,
    ],
  };
}

export function toErrorResult(
  error: unknown,
  sensitiveValues: readonly (string | null | undefined)[],
): CallToolResult {
  let text: string;
  if (error instanceof HuntApiApiError) {
    const body =
      error.responseBody === undefined
        ? ""
        : `\n${JSON.stringify(error.responseBody).slice(0, 2_000)}`;
    text = `HuntAPI API error ${error.status}: ${error.message}${body}`;
    if (error.status === 401) text += "\nCheck the HUNTAPI_API_KEY API key.";
    if (error.status === 402) text += "\nThe account has no credits left.";
    if (error.status === 429) text += "\nRate limit exceeded; retry later.";
  } else if (error instanceof HuntApiSerializationError) {
    text = `Invalid parameters: ${error.message}`;
  } else if (error instanceof HuntApiError) {
    text = `${error.name}: ${error.message}`;
  } else {
    text = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
  }
  return {
    isError: true,
    content: [{ type: "text", text: redact(text, sensitiveValues) }],
  };
}
