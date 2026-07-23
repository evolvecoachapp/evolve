import type { ToolFailure } from "../models/ToolFailure";

export interface RecoveryPolicy {
  readonly id: string;
  canRecover(failure: ToolFailure): boolean;
  recoveryHint(failure: ToolFailure): string | null;
}

export class DefaultRecoveryPolicy implements RecoveryPolicy {
  readonly id = "policy:recovery:default";

  canRecover(_failure: ToolFailure): boolean {
    return false;
  }

  recoveryHint(failure: ToolFailure): string | null {
    return `No recovery for ${failure.code}`;
  }
}
