export function formatCapabilities(
  capabilities: readonly string[],
): readonly string[] {
  return Object.freeze([...capabilities]);
}
