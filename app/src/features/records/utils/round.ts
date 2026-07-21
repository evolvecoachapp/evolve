/** Round to two decimal places (matches workout / analytics helpers). */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
