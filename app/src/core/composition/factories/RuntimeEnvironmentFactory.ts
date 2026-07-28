import {
  createRuntimeEnvironmentService,
  type RuntimeEnvironmentService,
} from "../../../features/runtime-environment/services/RuntimeEnvironmentService";

export interface RuntimeEnvironmentFactoryDeps {
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly service?: RuntimeEnvironmentService;
}

export const RuntimeEnvironmentFactory = {
  create(
    deps: RuntimeEnvironmentFactoryDeps = {},
  ): RuntimeEnvironmentService {
    return (
      deps.service ??
      createRuntimeEnvironmentService({
        clock: deps.clock,
        version: deps.version,
        schemaVersion: deps.schemaVersion,
      })
    );
  },
} as const;
