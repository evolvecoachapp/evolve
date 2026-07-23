import {
  validateCancellation,
  validateChunkOrder,
  validateCompletionIntegrity,
  validateLifecycleConsistency,
  validateStateTransition,
  validateStreamRequest,
} from "../validators";
import { StreamEventTypes } from "../models/StreamEventType";
import { EMPTY_STREAM_LIFECYCLE } from "../models/StreamLifecycle";
import { createInitialStreamState } from "../models/StreamState";
import { StreamStatuses } from "../models/StreamStatus";
import { NO_STREAM_CANCELLATION } from "../models/StreamCancellation";
import {
  createStreamChunkFixture,
  createStreamRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { createStreamEvent } from "../events/createStreamEvent";
import { freezeLifecycle } from "../utils/freezeObjects";

describe("streaming validators", () => {
  it("validateChunkOrder flags decreasing indexes", () => {
    const issues = validateChunkOrder([
      createStreamChunkFixture({ index: 1, delta: "B" }),
      createStreamChunkFixture({ index: 0, delta: "A" }),
    ]);
    expect(issues.some((i) => i.includes("stream_chunk_order_invalid"))).toBe(
      true,
    );
  });

  it("validateStateTransition allows pending → starting", () => {
    expect(
      validateStateTransition(StreamStatuses.PENDING, StreamStatuses.STARTING),
    ).toEqual([]);
  });

  it("validateStateTransition rejects completed → streaming", () => {
    expect(
      validateStateTransition(
        StreamStatuses.COMPLETED,
        StreamStatuses.STREAMING,
      ),
    ).toContain("stream_state_transition_invalid:completed->streaming");
  });

  it("validateCompletionIntegrity requires completion fields", () => {
    const state = {
      ...createInitialStreamState({
        streamId: "s1",
        requestId: "r1",
      }),
      status: StreamStatuses.COMPLETED,
    };
    const issues = validateCompletionIntegrity(state);
    expect(issues).toContain("stream_completion_flag_missing");
  });

  it("validateCancellation flags cancelled without flag", () => {
    const state = {
      ...createInitialStreamState({
        streamId: "s1",
        requestId: "r1",
      }),
      status: StreamStatuses.CANCELLED,
      cancellation: NO_STREAM_CANCELLATION,
      completedAt: FIXED_TIMESTAMP,
    };
    expect(validateCancellation(state.cancellation, state)).toContain(
      "stream_cancelled_without_cancellation_flag",
    );
  });

  it("validateLifecycleConsistency requires completed event", () => {
    const lifecycle = freezeLifecycle({
      ...EMPTY_STREAM_LIFECYCLE,
      status: StreamStatuses.COMPLETED,
      completedAt: FIXED_TIMESTAMP,
      events: Object.freeze([
        createStreamEvent({
          streamId: "s1",
          type: StreamEventTypes.STREAM_STARTED,
          occurredAt: FIXED_TIMESTAMP,
        }),
      ]),
    });
    expect(validateLifecycleConsistency(lifecycle)).toContain(
      "stream_lifecycle_missing_completed_event",
    );
  });

  it("validateStreamRequest requires id and provider", () => {
    const request = createStreamRequestFixture();
    const issues = validateStreamRequest({
      ...request,
      id: "",
      providerId: "",
    });
    expect(issues).toContain("stream_request_id_missing");
    expect(issues).toContain("stream_request_provider_id_missing");
  });
});
