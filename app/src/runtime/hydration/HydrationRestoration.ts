import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";

/**
 * Structural restoration from repository contract records into composition services.
 * Uses record identifiers only — no domain interpretation.
 */
export function restoreIdentityRecords(
  service: AthleteIdentityService,
  records: readonly PersistenceRecord[],
  generatedAt: string,
): void {
  for (const record of records) {
    service.build({
      athleteId: record.id,
      requestId: `hydration:identity:${record.id}`,
      generatedAt,
      profile: {
        displayName: record.id,
        givenName: "Hydrated",
        familyName: "Athlete",
        sex: "unspecified",
        birthYear: 1990,
        experienceLevel: "intermediate",
      },
      locale: { languageTag: "en-US" },
      units: { system: "metric" },
      timeZone: { iana: "Etc/UTC", displayName: "UTC" },
    });
  }
}

export function restoreRuntimeRecords(
  service: RuntimeEnvironmentService,
  records: readonly PersistenceRecord[],
  generatedAt: string,
): void {
  if (records.length === 0) {
    return;
  }

  const record = records[0];
  service.build({
    requestId: `hydration:runtime:${record.id}`,
    generatedAt,
    device: {
      deviceId: record.id,
      model: "Hydrated Device",
      manufacturer: "EVOLVE",
      osVersion: "0.0.0",
      formFactor: "phone",
    },
    platform: {
      kind: "ios",
      version: "0.0.0",
    },
    application: {
      appId: "com.evolve.app",
      name: "EVOLVE",
      version: "0.6.0",
      buildNumber: "0",
      channel: "test",
    },
    locale: { languageTag: "en-US" },
  });
}

export function restoreWorkspaceRecords(
  service: UnifiedWorkspaceService,
  records: readonly PersistenceRecord[],
  generatedAt: string,
): void {
  for (const record of records) {
    service.build({
      athleteId: record.id,
      requestId: `hydration:workspace:${record.id}`,
      generatedAt,
    });
  }
}
