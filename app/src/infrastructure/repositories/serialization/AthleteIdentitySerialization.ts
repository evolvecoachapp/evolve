import type { AthleteIdentity } from "../../../features/athlete-identity/models/AthleteIdentity";
import { createDomainSerializer } from "./createDomainSerializer";

function isAthleteIdentity(value: unknown): value is AthleteIdentity {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.athleteId === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.profile === "object" &&
    candidate.profile !== null &&
    typeof candidate.locale === "object" &&
    candidate.locale !== null &&
    typeof candidate.units === "object" &&
    candidate.units !== null &&
    typeof candidate.timeZone === "object" &&
    candidate.timeZone !== null &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null
  );
}

export const AthleteIdentitySerializer = createDomainSerializer<AthleteIdentity>({
  domain: "athlete-identity",
  isValid: isAthleteIdentity,
});
