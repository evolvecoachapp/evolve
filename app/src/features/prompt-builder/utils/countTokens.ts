/**
 * Approximate token count — chars / 4.
 * Not a provider tokenizer. Composition budgeting only.
 */
export function countTokensApprox(text: string): number {
  if (!text) {
    return 0;
  }
  return Math.ceil(text.length / 4);
}

/**
 * Sum approximate tokens across statements.
 */
export function countStatementsTokensApprox(
  statements: readonly string[],
): number {
  return statements.reduce(
    (total, statement) => total + countTokensApprox(statement),
    0,
  );
}
