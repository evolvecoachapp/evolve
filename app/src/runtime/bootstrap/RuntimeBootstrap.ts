import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../core/composition/createCompositionRoot";
import {
  type CompositionRootOptions,
} from "../../core/composition/CompositionRoot";
import { SERVICE_TOKENS } from "../../core/composition/registry/ServiceMap";
import { createBootstrapResult } from "./BootstrapResult";
import { createBootstrapState } from "./BootstrapState";
import {
  getBootstrapStateHolder,
  resetBootstrapStateHolder,
  setBootstrapStateHolder,
} from "./BootstrapStateHolder";
import { BOOTSTRAP_STATUS } from "./BootstrapStatus";
import type { BootstrapResult } from "./BootstrapResult";
import { RuntimeBootstrapError } from "./RuntimeBootstrapError";
import {
  validateBootstrapCanStart,
  validateBootstrapState,
} from "./RuntimeBootstrapValidation";
import { RUNTIME_INITIALIZATION_PHASES } from "./RuntimeInitialization";

let bootstrapPromise: Promise<BootstrapResult> | null = null;

export interface RuntimeBootstrapOptions {
  readonly compositionRoot?: CompositionRootOptions;
  readonly clock?: () => string;
}

/**
 * Application Runtime Bootstrap gate.
 *
 * Creates the Composition Root, validates the Service Registry, freezes runtime
 * state, and exposes an immutable BootstrapResult. No persistence or business logic.
 */
export class RuntimeBootstrap {
  static bootstrap(options: RuntimeBootstrapOptions = {}): BootstrapResult {
    const current = getBootstrapStateHolder();
    validateBootstrapCanStart(current);

    const clock = options.clock ?? (() => new Date().toISOString());
    const startedAt = clock();

    setBootstrapStateHolder(
      createBootstrapState({
        status: BOOTSTRAP_STATUS.bootstrapping,
        startedAt,
      }),
    );

    try {
      getCompositionRoot(options.compositionRoot ?? {});

      const validatedAt = clock();
      const result = createBootstrapResult({
        serviceTokenCount: SERVICE_TOKENS.length,
        validatedAt,
        phases: RUNTIME_INITIALIZATION_PHASES,
      });

      const nextState = createBootstrapState({
        status: BOOTSTRAP_STATUS.ready,
        result,
        startedAt,
        completedAt: validatedAt,
      });
      validateBootstrapState(nextState);
      setBootstrapStateHolder(nextState);

      return result;
    } catch (error) {
      const bootstrapError =
        error instanceof RuntimeBootstrapError
          ? error
          : new RuntimeBootstrapError(
              error instanceof Error
                ? error.message
                : "Composition Root bootstrap failed",
              "composition_root_failed",
            );

      setBootstrapStateHolder(
        createBootstrapState({
          status: BOOTSTRAP_STATUS.failed,
          error: bootstrapError,
          startedAt,
          completedAt: clock(),
        }),
      );

      throw bootstrapError;
    }
  }

  static reset(): void {
    bootstrapPromise = null;
    resetBootstrapStateHolder();
    resetCompositionRoot();
  }
}

export function resetRuntimeBootstrap(): void {
  RuntimeBootstrap.reset();
}

export function getRuntimeBootstrapPromise(): Promise<BootstrapResult> | null {
  return bootstrapPromise;
}

export function setRuntimeBootstrapPromise(
  promise: Promise<BootstrapResult> | null,
): void {
  bootstrapPromise = promise;
}
