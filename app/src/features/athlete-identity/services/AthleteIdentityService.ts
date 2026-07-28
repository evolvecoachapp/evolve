import type { AthleteIdentity } from "../models/AthleteIdentity";
import type { AthleteIdentityResult } from "../models/AthleteIdentityResult";
import type { AthletePreferences } from "../models/AthletePreferences";
import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteSettings } from "../models/AthleteSettings";
import {
  buildAthleteIdentity,
  type BuildAthleteIdentityInput,
} from "./buildAthleteIdentity";
import { validateIdentity } from "./validateIdentity";

export interface AthleteIdentityServiceDeps {
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
}

type IdentityBuildInput = Omit<
  BuildAthleteIdentityInput,
  "generatedAt" | "version" | "schemaVersion" | "validationOptions"
> & {
  readonly generatedAt?: string;
};

/**
 * Athlete Identity composition facade (Sprint 29.1).
 * Compose only — holds latest identity by athlete in memory.
 */
export class AthleteIdentityService {
  private readonly clock: () => string;
  private readonly version: string;
  private readonly schemaVersion: string;
  private readonly latestByAthlete = new Map<string, AthleteIdentity>();
  private readonly identityIds = new Set<string>();

  constructor(deps: AthleteIdentityServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? "29.1";
    this.schemaVersion = deps.schemaVersion ?? "1.0";
  }

  build(input: IdentityBuildInput): AthleteIdentityResult {
    const generatedAt = input.generatedAt ?? this.clock();
    const previous = this.latestByAthlete.get(input.athleteId) ?? null;
    const knownAthleteIds = new Set(
      [...this.latestByAthlete.keys()].filter(
        (athleteId) => athleteId !== input.athleteId,
      ),
    );
    const knownIdentityIds = new Set(this.identityIds);
    if (previous) {
      knownIdentityIds.delete(previous.id);
    }

    const result = buildAthleteIdentity({
      ...input,
      generatedAt,
      version: this.version,
      schemaVersion: this.schemaVersion,
      validationOptions: {
        knownAthleteIds,
        knownIdentityIds,
      },
    });

    if (result.success && result.identity) {
      if (previous) {
        this.identityIds.delete(previous.id);
      }
      this.latestByAthlete.set(input.athleteId, result.identity);
      this.identityIds.add(result.identity.id);
    }

    return result;
  }

  getAthleteIdentity(athleteId: string): AthleteIdentity | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getAthleteProfile(athleteId: string): AthleteProfile | null {
    return this.getAthleteIdentity(athleteId)?.profile ?? null;
  }

  getPreferences(athleteId: string): AthletePreferences | null {
    return this.getAthleteIdentity(athleteId)?.preferences ?? null;
  }

  getSettings(athleteId: string): AthleteSettings | null {
    return this.getAthleteIdentity(athleteId)?.settings ?? null;
  }

  validate(athleteId: string) {
    return validateIdentity(this.getAthleteIdentity(athleteId));
  }
}

export function createAthleteIdentityService(
  deps: AthleteIdentityServiceDeps = {},
): AthleteIdentityService {
  return new AthleteIdentityService(deps);
}
