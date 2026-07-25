/** Deterministic ordinal / flag lookup only — no prescription invention. */
export interface ConsistencyEvaluation {
  readonly ordinal: number;
  readonly label: string;
  readonly present: boolean;
  readonly matchedKeys: readonly string[];
}

const ORDINAL_TABLE: Readonly<Record<string, number>> = Object.freeze({"consistency":2,"decision:key:consistency":2});

const PREFIXES: readonly string[] = Object.freeze(["consistency","decision:key:consistency"]);

function labelForOrdinal(ordinal: number): string {
  if (ordinal <= 0) return "critical";
  if (ordinal === 1) return "high";
  if (ordinal === 2) return "normal";
  return "low";
}

export function evaluateConsistency(signalKeys: readonly string[]): ConsistencyEvaluation {
  const matched: string[] = [];
  let ordinal = 3;
  for (const key of signalKeys) {
    for (const prefix of PREFIXES) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        matched.push(key);
        const tableOrdinal = ORDINAL_TABLE[prefix] ?? ORDINAL_TABLE[key] ?? 2;
        if (tableOrdinal < ordinal) ordinal = tableOrdinal;
      }
    }
  }
  const present = matched.length > 0;
  return Object.freeze({
    ordinal: present ? ordinal : 3,
    label: labelForOrdinal(present ? ordinal : 3),
    present,
    matchedKeys: Object.freeze([...matched].sort()),
  });
}
