import { z } from "zod";

import type { EndpointEntry, ParamEntry } from "./types.js";

/** Zod raw shape for one endpoint's parameters, used as an MCP tool input schema. */
export function inputShape(endpoint: EndpointEntry): Record<string, z.ZodType> {
  const shape: Record<string, z.ZodType> = {};
  for (const param of endpoint.params) {
    const schema = paramSchema(param).describe(describe(param));
    shape[param.name] = param.required ? schema : schema.optional();
  }
  return shape;
}

/** Strict object schema used to validate call_endpoint parameters. */
export function inputObject(
  endpoint: EndpointEntry,
): z.ZodType<Record<string, unknown>> {
  return z.object(inputShape(endpoint)).strict() as unknown as z.ZodType<
    Record<string, unknown>
  >;
}

function paramSchema(param: ParamEntry): z.ZodType {
  switch (param.type) {
    case "integer":
      return z.number().int();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "object":
      return z.record(z.string(), z.unknown());
    case "array":
      return param.items === "object"
        ? z.array(z.record(z.string(), z.unknown()))
        : z.array(z.string());
    default:
      return z.string();
  }
}

function describe(param: ParamEntry): string {
  const parts = [param.description];
  if (param.enum) parts.push(`Allowed values: ${param.enum.join(", ")}.`);
  if (param.default !== undefined)
    parts.push(`Default: ${JSON.stringify(param.default)}.`);
  return parts.filter(Boolean).join(" ");
}

/** Plain JSON description of an endpoint for get_endpoint. */
export function describeEndpoint(
  endpoint: EndpointEntry,
): Record<string, unknown> {
  return {
    name: endpoint.name,
    title: endpoint.title,
    http: `${endpoint.methods.join(" / ")} ${endpoint.path}`,
    description: endpoint.description,
    params: endpoint.params.map((p) => ({
      name: p.name,
      type: p.type === "array" ? `array<${p.items ?? "string"}>` : p.type,
      required: p.required,
      description: p.description,
      ...(p.enum ? { enum: p.enum } : {}),
      ...(p.default !== undefined ? { default: p.default } : {}),
    })),
  };
}
