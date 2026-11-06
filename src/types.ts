export type ParamType =
  "string" | "integer" | "number" | "boolean" | "array" | "object";

export interface ParamEntry {
  readonly name: string;
  readonly type: ParamType;
  readonly items?: ParamType;
  readonly required: boolean;
  readonly description: string;
  readonly enum?: readonly string[];
  readonly default?: unknown;
}

export interface EndpointEntry {
  readonly name: string;
  readonly title: string;
  readonly path: string;
  readonly methods: readonly ("GET" | "POST")[];
  readonly description: string;
  readonly params: readonly ParamEntry[];
}
