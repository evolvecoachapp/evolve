import type { RecoveryDay } from "../models";

export function changeRecoveryDay(input: { readonly day: RecoveryDay }): RecoveryDay {
  return Object.freeze({ ...input.day });
}
