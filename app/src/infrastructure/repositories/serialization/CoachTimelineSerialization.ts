import type { CoachTimeline } from "../../../features/coach-timeline/models/CoachTimeline";
import { createDomainSerializer } from "./createDomainSerializer";

function isCoachTimeline(value: unknown): value is CoachTimeline {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.athleteId === "string" &&
    Array.isArray(candidate.entries) &&
    typeof candidate.entryCount === "number" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

export const CoachTimelineSerializer = createDomainSerializer<CoachTimeline>({
  domain: "coach-timeline",
  isValid: isCoachTimeline,
});
