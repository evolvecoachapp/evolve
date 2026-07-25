import type { ExplanationPackage } from "../models/ExplanationPackage";
import { ExplanationSessionStatuses, type ExplanationSessionStatus } from "../models/ExplanationState";
import { freezePackage } from "../utils/FreezeExplanationState";

export class ExplainabilitySession {
  private package: ExplanationPackage | null = null;
  private status: ExplanationSessionStatus = ExplanationSessionStatuses.IDLE;
  private readonly startedAt: string;

  constructor(startedAt: string) {
    this.startedAt = startedAt;
  }

  put(pkg: ExplanationPackage, status: ExplanationSessionStatus = ExplanationSessionStatuses.READY): void {
    this.package = freezePackage(pkg);
    this.status = status;
  }

  getPackage(): ExplanationPackage | null {
    return this.package;
  }

  getStatus(): ExplanationSessionStatus {
    return this.status;
  }

  getStartedAt(): string {
    return this.startedAt;
  }
}

export function createExplainabilitySession(startedAt: string): ExplainabilitySession {
  return new ExplainabilitySession(startedAt);
}
