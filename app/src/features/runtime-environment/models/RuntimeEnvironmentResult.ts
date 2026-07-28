import type { ApplicationInfo } from "./ApplicationInfo";
import type { Capabilities } from "./Capabilities";
import type { EnvironmentMetadata } from "./EnvironmentMetadata";
import type { PlatformInfo } from "./PlatformInfo";
import type { RuntimeEnvironment } from "./RuntimeEnvironment";

export interface RuntimeEnvironmentValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building Runtime Environment.
 */
export interface RuntimeEnvironmentResult {
  readonly id: string;
  readonly success: boolean;
  readonly runtime: RuntimeEnvironment | null;
  readonly platform: PlatformInfo | null;
  readonly application: ApplicationInfo | null;
  readonly capabilities: Capabilities | null;
  readonly metadata: EnvironmentMetadata | null;
  readonly validation: RuntimeEnvironmentValidation;
  readonly message: string;
  readonly generatedAt: string;
}
