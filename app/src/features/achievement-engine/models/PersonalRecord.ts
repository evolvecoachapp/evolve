import type { Achievement } from "./Achievement";
import type { PersonalRecordEvidence } from "./PersonalRecordEvidence";
import type { PersonalRecordType } from "./PersonalRecordType";

/**
 * Immutable Personal Record achievement specialization.
 */
export interface PersonalRecord extends Achievement {
  readonly personalRecordType: PersonalRecordType;
  readonly evidence: PersonalRecordEvidence;
}
