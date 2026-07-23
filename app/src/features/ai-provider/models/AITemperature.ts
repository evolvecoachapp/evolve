/**
 * Immutable temperature sampling parameter wrapper.
 * Valid range typically `[0, 2]`.
 */
export interface AITemperature {
  readonly value: number;
}

export function createTemperature(value: number): AITemperature {
  return Object.freeze({ value });
}
