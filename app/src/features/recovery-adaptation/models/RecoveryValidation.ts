import type { RecoveryError } from "./RecoveryError";

export interface RecoveryValidation {
  readonly valid: boolean;
  readonly issues: readonly RecoveryError[];
}
