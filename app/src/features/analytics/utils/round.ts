/** Round to two decimal places (matches workout volume helpers). */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
