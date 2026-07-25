export function formatKeyList(keys: readonly string[]): string {
  return keys.join(",");
}

export function formatOperationLabel(operation: string): string {
  return operation.toUpperCase();
}
