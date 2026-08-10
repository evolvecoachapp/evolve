import type { RuntimeEnvironment } from "../../../features/runtime-environment/models/RuntimeEnvironment";
import { createDomainSerializer } from "./createDomainSerializer";

function isRuntimeEnvironment(value: unknown): value is RuntimeEnvironment {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.device === "object" &&
    candidate.device !== null &&
    typeof candidate.platform === "object" &&
    candidate.platform !== null &&
    typeof candidate.application === "object" &&
    candidate.application !== null &&
    typeof candidate.capabilities === "object" &&
    candidate.capabilities !== null &&
    typeof candidate.featureSupport === "object" &&
    candidate.featureSupport !== null &&
    typeof candidate.locale === "object" &&
    candidate.locale !== null &&
    typeof candidate.connectivity === "object" &&
    candidate.connectivity !== null &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null
  );
}

export const RuntimeEnvironmentSerializer =
  createDomainSerializer<RuntimeEnvironment>({
    domain: "runtime-environment",
    isValid: isRuntimeEnvironment,
  });
