export function formatCapabilities(
  capabilities: readonly string[],
): readonly string[] {
  return Object.freeze([...capabilities]);
}

export function formatMacroLine(input: {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
}): string {
  return `${input.calories} kcal · P ${input.proteinG}g · C ${input.carbsG}g · F ${input.fatG}g`;
}
