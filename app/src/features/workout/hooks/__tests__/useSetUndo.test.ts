import { act, renderHook } from "@testing-library/react-native";
import { useSetUndo } from "../useSetUndo";

describe("useSetUndo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("offers undo and dismisses after the window expires", () => {
    const { result } = renderHook(() => useSetUndo(4000));

    act(() => {
      result.current.offerUndo({
        exerciseId: "exercise-1",
        setId: "set-1",
        snapshot: {
          id: "set-1",
          setNumber: 1,
          targetReps: 8,
          targetWeight: 100,
          completedReps: null,
          completedWeight: null,
          rpe: null,
          completed: false,
          restSeconds: 90,
        },
      });
    });

    expect(result.current.pendingUndo?.setId).toBe("set-1");
    expect(result.current.secondsRemaining).toBe(4);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.pendingUndo).toBeNull();
    expect(result.current.secondsRemaining).toBe(0);
  });

  it("dismisses undo immediately when requested", () => {
    const { result } = renderHook(() => useSetUndo(4000));

    act(() => {
      result.current.offerUndo({
        exerciseId: "exercise-1",
        setId: "set-1",
        snapshot: {
          id: "set-1",
          setNumber: 1,
          targetReps: 8,
          targetWeight: 100,
          completedReps: null,
          completedWeight: null,
          rpe: null,
          completed: false,
          restSeconds: 90,
        },
      });
      result.current.dismissUndo();
    });

    expect(result.current.pendingUndo).toBeNull();
  });
});
