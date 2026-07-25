export function formatKeyList(keys: readonly string[]): string {
  return keys.join(",");
}

export function formatId(prefix: string, ...parts: readonly string[]): string {
  return [prefix, ...parts].join(":");
}
