/**
 * Immutable top-p (nucleus) sampling parameter wrapper.
 * Valid range typically `(0, 1]`.
 */
export interface AITopP {
  readonly value: number;
}

export function createTopP(value: number): AITopP {
  return Object.freeze({ value });
}
