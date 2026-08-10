import {
  createMinimalIdentityInput,
  createTestAthleteIdentityService,
  FIXED_IDENTITY_TIMESTAMP,
} from "../../../../features/athlete-identity/testSupport/fixtures";
import {
  createMinimalRuntimeInput,
  createTestRuntimeEnvironmentService,
  FIXED_RUNTIME_TIMESTAMP,
} from "../../../../features/runtime-environment/testSupport/fixtures";
import {
  createStubAthleteSnapshot,
  createTestUnifiedWorkspaceService,
  FIXED_WORKSPACE_TIMESTAMP,
} from "../../../../features/unified-workspace/testSupport/fixtures";
import { composeTestWorkspaceForAthlete } from "../../../../integrations/dashboard-projection/testSupport/fixtures";
import {
  createTestCoachTimelineService,
  createTimelineEntryRequest,
  FIXED_TIMELINE_TIMESTAMP,
} from "../../../../features/coach-timeline/testSupport/fixtures";
import {
  IdentityMapper,
  RuntimeMapper,
  WorkspaceMapper,
  SnapshotMapper,
  TimelineMapper,
} from "../../../sqlite/mappers";
import {
  AthleteIdentitySerializer,
  CoachTimelineSerializer,
  RuntimeEnvironmentSerializer,
  WorkspaceSerializer,
  WorkspaceSnapshotSerializer,
  createDomainRecord,
} from "../index";

describe("domain persistence serialization (Sprint 34.3)", () => {
  it("serializes and deserializes athlete identity", () => {
    const service = createTestAthleteIdentityService();
    const result = service.build(createMinimalIdentityInput());
    if (!result.success || !result.identity) {
      throw new Error("Failed to build identity fixture");
    }

    const roundTrip = AthleteIdentitySerializer.deserialize(
      AthleteIdentitySerializer.serialize(result.identity),
    );

    expect(roundTrip).toEqual(result.identity);
    expect(Object.isFrozen(roundTrip)).toBe(true);
  });

  it("serializes and deserializes runtime environment", () => {
    const service = createTestRuntimeEnvironmentService();
    const result = service.build(createMinimalRuntimeInput());
    if (!result.success || !result.runtime) {
      throw new Error("Failed to build runtime fixture");
    }

    const roundTrip = RuntimeEnvironmentSerializer.deserialize(
      RuntimeEnvironmentSerializer.serialize(result.runtime),
    );

    expect(roundTrip).toEqual(result.runtime);
    expect(Object.isFrozen(roundTrip)).toBe(true);
  });

  it("serializes and deserializes unified workspace", () => {
    const service = createTestUnifiedWorkspaceService();
    service.build({
      athleteId: "athlete:1",
      requestId: "req:workspace:1",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
    });
    composeTestWorkspaceForAthlete(service, "athlete:1");
    const workspace = service.getWorkspace("athlete:1");
    if (!workspace) {
      throw new Error("Failed to build workspace fixture");
    }

    const roundTrip = WorkspaceSerializer.deserialize(
      WorkspaceSerializer.serialize(workspace),
    );

    expect(roundTrip).toEqual(workspace);
    expect(Object.isFrozen(roundTrip)).toBe(true);
  });

  it("serializes and deserializes workspace snapshot", () => {
    const snapshot = createStubAthleteSnapshot();
    const roundTrip = WorkspaceSnapshotSerializer.deserialize(
      WorkspaceSnapshotSerializer.serialize(snapshot),
    );

    expect(roundTrip).toEqual(snapshot);
    expect(Object.isFrozen(roundTrip)).toBe(true);
  });

  it("serializes and deserializes coach timeline", () => {
    const service = createTestCoachTimelineService();
    service.appendEntry(
      createTimelineEntryRequest({
        id: "timeline:1",
        createdAt: FIXED_TIMELINE_TIMESTAMP,
      }),
    );
    const timeline = service.getTimeline("athlete:1");
    if (!timeline) {
      throw new Error("Failed to build timeline fixture");
    }

    const roundTrip = CoachTimelineSerializer.deserialize(
      CoachTimelineSerializer.serialize(timeline),
    );

    expect(roundTrip).toEqual(timeline);
    expect(Object.isFrozen(roundTrip)).toBe(true);
  });

  it("maps domain records through SQLite mappers with round-trip equality", () => {
    const identityService = createTestAthleteIdentityService();
    const identityResult = identityService.build(createMinimalIdentityInput());
    const runtimeService = createTestRuntimeEnvironmentService();
    const runtimeResult = runtimeService.build(createMinimalRuntimeInput());
    const workspaceService = createTestUnifiedWorkspaceService();
    workspaceService.build({
      athleteId: "athlete:1",
      requestId: "req:workspace:mapper",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
    });
    composeTestWorkspaceForAthlete(workspaceService, "athlete:1");
    const workspace = workspaceService.getWorkspace("athlete:1");
    const snapshot = createStubAthleteSnapshot();
    const timelineService = createTestCoachTimelineService();
    timelineService.appendEntry(
      createTimelineEntryRequest({ id: "timeline:mapper:1" }),
    );
    const timeline = timelineService.getTimeline("athlete:1");

    if (
      !identityResult.success ||
      !identityResult.identity ||
      !runtimeResult.success ||
      !runtimeResult.runtime ||
      !workspace ||
      !timeline
    ) {
      throw new Error("Failed to build mapper fixtures");
    }

    const identityRecord = createDomainRecord(
      identityResult.identity.athleteId,
      identityResult.identity,
    );
    const runtimeRecord = createDomainRecord(
      runtimeResult.runtime.id,
      runtimeResult.runtime,
    );
    const workspaceRecord = createDomainRecord(
      workspace.athleteId,
      workspace,
    );
    const snapshotRecord = createDomainRecord(snapshot.id, snapshot);
    const timelineRecord = createDomainRecord(timeline.athleteId, timeline);

    expect(IdentityMapper.toRecord(IdentityMapper.toRow(identityRecord))).toEqual(
      identityRecord,
    );
    expect(RuntimeMapper.toRecord(RuntimeMapper.toRow(runtimeRecord))).toEqual(
      runtimeRecord,
    );
    expect(WorkspaceMapper.toRecord(WorkspaceMapper.toRow(workspaceRecord))).toEqual(
      workspaceRecord,
    );
    expect(SnapshotMapper.toRecord(SnapshotMapper.toRow(snapshotRecord))).toEqual(
      snapshotRecord,
    );
    expect(TimelineMapper.toRecord(TimelineMapper.toRow(timelineRecord))).toEqual(
      timelineRecord,
    );
  });

  it("returns id-only records for empty legacy payloads", () => {
    expect(
      IdentityMapper.toRecord(
        Object.freeze({ id: "legacy:1", payload: "{}" }),
      ),
    ).toEqual({
      id: "legacy:1",
    });
  });

  it("preserves immutable restoration timestamps in serialized payloads", () => {
    const service = createTestAthleteIdentityService();
    const result = service.build(
      createMinimalIdentityInput({ generatedAt: FIXED_IDENTITY_TIMESTAMP }),
    );
    if (!result.success || !result.identity) {
      throw new Error("Failed to build identity fixture");
    }

    const payload = AthleteIdentitySerializer.serialize(result.identity);
    const restored = AthleteIdentitySerializer.deserialize(payload);

    expect(restored?.createdAt).toBe(FIXED_IDENTITY_TIMESTAMP);
    expect(RuntimeEnvironmentSerializer.deserialize(
      RuntimeEnvironmentSerializer.serialize(
        createTestRuntimeEnvironmentService()
          .build(createMinimalRuntimeInput({ generatedAt: FIXED_RUNTIME_TIMESTAMP }))
          .runtime!,
      ),
    )?.createdAt).toBe(FIXED_RUNTIME_TIMESTAMP);
  });
});
