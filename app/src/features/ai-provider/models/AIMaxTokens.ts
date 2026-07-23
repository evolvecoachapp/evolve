/**
 * Immutable max-tokens generation limit wrapper.
 */
export interface AIMaxTokens {
  readonly value: number;
}

export function createMaxTokens(value: number): AIMaxTokens {
  return Object.freeze({ value });
}
