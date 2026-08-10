import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";
import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createAthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createRuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import { createUnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { hydrateRuntime, getHydrationStatus } from "../application";
import { HYDRATION_PHASES } from "../HydrationInitialization";
import { HYDRATION_STATUS } from "../HydrationStatus";
import {
  RepositoryHydrationPipeline,
  resetRepositoryHydration,
} from "../RepositoryHydrationPipeline";
import { HydrationError } from "../HydrationError";

function createRecord(id: string): PersistenceRecord {
  return Object.freeze({ id });
}

function createMockIdentityRepository(
  records: readonly PersistenceRecord[] = [],
): IdentityRepository {
  return {
    repositoryId: "identity",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}

function createMockRuntimeRepository(
  records: readonly PersistenceRecord[] = [],
): RuntimeRepository {
  return {
    repositoryId: "runtime",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}

function createMockWorkspaceRepository(
  records: readonly PersistenceRecord[] = [],
): WorkspaceRepository {
  return {
    repositoryId: "workspace",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}

describe("RepositoryHydrationPipeline", () => {
  afterEach(() => {
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("hydrates runtime from repository contracts after bootstrap completes", async () => {
    RuntimeBootstrap.bootstrap({
      clock: () => "2026-08-10T10:00:00.000Z",
    });

    const athleteIdentityService = createAthleteIdentityService({
      clock: () => "2026-08-10T10:00:01.000Z",
    });
    const runtimeEnvironmentService = createRuntimeEnvironmentService({
      clock: () => "2026-08-10T10:00:01.000Z",
    });
    const unifiedWorkspaceService = createUnifiedWorkspaceService({
      clock: () => "2026-08-10T10:00:01.000Z",
    });

    const result = await RepositoryHydrationPipeline.hydrate({
      deps: {
        identityRepository: createMockIdentityRepository([
          createRecord("athlete:1"),
        ]),
        runtimeRepository: createMockRuntimeRepository([
          createRecord("runtime:1"),
        ]),
        workspaceRepository: createMockWorkspaceRepository([
          createRecord("athlete:1"),
        ]),
        athleteIdentityService,
        runtimeEnvironmentService,
        unifiedWorkspaceService,
        clock: () => "2026-08-10T10:00:01.000Z",
      },
    });

    expect(result.status).toBe("ready");
    expect(result.identityRecordCount).toBe(1);
    expect(result.runtimeRecordCount).toBe(1);
    expect(result.workspaceRecordCount).toBe(1);
    expect(result.restoredAt).toBe("2026-08-10T10:00:01.000Z");
    expect(result.phases).toEqual([...HYDRATION_PHASES]);
    expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
    expect(athleteIdentityService.getAthleteIdentity("athlete:1")).not.toBeNull();
    expect(runtimeEnvironmentService.getRuntimeEnvironment()).not.toBeNull();
    expect(unifiedWorkspaceService.getWorkspace("athlete:1")).toBeNull();
  });

  it("succeeds with an empty runtime when repositories return no records", async () => {
    RuntimeBootstrap.bootstrap();

    const athleteIdentityService = createAthleteIdentityService();
    const runtimeEnvironmentService = createRuntimeEnvironmentService();
    const unifiedWorkspaceService = createUnifiedWorkspaceService();

    const result = await RepositoryHydrationPipeline.hydrate({
      deps: {
        identityRepository: createMockIdentityRepository(),
        runtimeRepository: createMockRuntimeRepository(),
        workspaceRepository: createMockWorkspaceRepository(),
        athleteIdentityService,
        runtimeEnvironmentService,
        unifiedWorkspaceService,
      },
    });

    expect(result.identityRecordCount).toBe(0);
    expect(result.runtimeRecordCount).toBe(0);
    expect(result.workspaceRecordCount).toBe(0);
    expect(athleteIdentityService.getAthleteIdentity("athlete:1")).toBeNull();
    expect(runtimeEnvironmentService.getRuntimeEnvironment()).toBeNull();
    expect(unifiedWorkspaceService.getWorkspace("athlete:1")).toBeNull();
  });

  it("rejects duplicate hydration attempts", async () => {
    RuntimeBootstrap.bootstrap();

    const deps = {
      identityRepository: createMockIdentityRepository(),
      runtimeRepository: createMockRuntimeRepository(),
      workspaceRepository: createMockWorkspaceRepository(),
      athleteIdentityService: createAthleteIdentityService(),
      runtimeEnvironmentService: createRuntimeEnvironmentService(),
      unifiedWorkspaceService: createUnifiedWorkspaceService(),
    };

    await RepositoryHydrationPipeline.hydrate({ deps });

    await expect(RepositoryHydrationPipeline.hydrate({ deps })).rejects.toThrow(
      HydrationError,
    );
    await expect(RepositoryHydrationPipeline.hydrate({ deps })).rejects.toThrow(
      /already started/i,
    );
  });

  it("requires runtime bootstrap before hydration", async () => {
    await expect(
      RepositoryHydrationPipeline.hydrate({
        deps: {
          identityRepository: createMockIdentityRepository(),
          runtimeRepository: createMockRuntimeRepository(),
          workspaceRepository: createMockWorkspaceRepository(),
          athleteIdentityService: createAthleteIdentityService(),
          runtimeEnvironmentService: createRuntimeEnvironmentService(),
          unifiedWorkspaceService: createUnifiedWorkspaceService(),
        },
      }),
    ).rejects.toThrow(HydrationError);

    await expect(
      RepositoryHydrationPipeline.hydrate({
        deps: {
          identityRepository: createMockIdentityRepository(),
          runtimeRepository: createMockRuntimeRepository(),
          workspaceRepository: createMockWorkspaceRepository(),
          athleteIdentityService: createAthleteIdentityService(),
          runtimeEnvironmentService: createRuntimeEnvironmentService(),
          unifiedWorkspaceService: createUnifiedWorkspaceService(),
        },
      }),
    ).rejects.toThrow(/bootstrap must complete/i);
  });

  it("exposes hydrateRuntime as an idempotent application API", async () => {
    RuntimeBootstrap.bootstrap({
      clock: () => "2026-08-10T10:00:00.000Z",
    });

    const first = await hydrateRuntime();
    const second = await hydrateRuntime();

    expect(second).toBe(first);
    expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
  });
});
