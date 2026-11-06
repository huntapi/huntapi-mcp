/** Removes secrets from text before it reaches a model or a log. */
export function redact(
  text: string,
  sensitiveValues: readonly (string | null | undefined)[],
): string {
  let out = text;
  for (const value of sensitiveValues) {
    if (value && value.length >= 4) out = out.split(value).join("[REDACTED]");
  }
  return out;
}
