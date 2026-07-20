import {
  consumePendingExecutableSession,
  setPendingExecutableSession,
} from "../executableSessionHandoff";
import type { WorkoutSession } from "../../../training/application";

function createSession(id: string): WorkoutSession {
  return Object.freeze({
    id,
    title: "Upper A",
    subtitle: "Sample · Chest",
    status: "ready",
    dayId: "day:1",
    dayIndex: 0,
    programTitle: "Sample",
    goalLabel: "Hypertrophy",
    primaryFocus: Object.freeze(["Chest"]),
    exercises: Object.freeze([]),
    progressionReferences: Object.freeze([]),
    notes: null,
    startedAt: null,
    completedAt: null,
  });
}

describe("executableSessionHandoff", () => {
  it("returns the pending session when ids match and clears the slot", () => {
    const session = createSession("session:day:1");
    setPendingExecutableSession(session);

    expect(consumePendingExecutableSession("session:day:1")).toBe(session);
    expect(consumePendingExecutableSession("session:day:1")).toBeNull();
  });

  it("ignores a non-matching id without clearing a future match incorrectly", () => {
    const session = createSession("session:day:1");
    setPendingExecutableSession(session);

    expect(consumePendingExecutableSession("session:other")).toBeNull();
    expect(consumePendingExecutableSession("session:day:1")).toBe(session);
  });
});
