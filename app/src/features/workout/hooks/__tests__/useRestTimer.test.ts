import { act, renderHook } from "@testing-library/react-native";
import { useRestTimer } from "../useRestTimer";

describe("useRestTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("counts down automatically from the given duration", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(90);
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.secondsLeft).toBe(90);
    expect(result.current.totalSeconds).toBe(90);

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isActive).toBe(true);
  });

  it("falls back to the default duration when none is prescribed", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(null);
    });

    expect(result.current.totalSeconds).toBe(90);
  });

  it("fires onComplete and goes idle when the countdown reaches zero", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useRestTimer({ events: { onComplete } }));

    act(() => {
      result.current.start(5);
    });

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("skip stops the countdown immediately and fires onSkip, not onComplete", () => {
    const onSkip = jest.fn();
    const onComplete = jest.fn();
    const { result } = renderHook(() => useRestTimer({ events: { onSkip, onComplete } }));

    act(() => {
      result.current.start(90);
    });

    act(() => {
      result.current.skip();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("+10s extends the remaining time and grows the total", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(30);
    });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    expect(result.current.secondsLeft).toBe(20);

    act(() => {
      result.current.addTenSeconds();
    });

    expect(result.current.secondsLeft).toBe(30);
    expect(result.current.totalSeconds).toBe(30);
  });

  it("-10s shortens the remaining time without changing the total", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(30);
    });

    act(() => {
      result.current.subtractTenSeconds();
    });

    expect(result.current.secondsLeft).toBe(20);
    expect(result.current.totalSeconds).toBe(30);
  });

  it("-10s past zero ends the rest and fires onComplete", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useRestTimer({ events: { onComplete } }));

    act(() => {
      result.current.start(5);
    });

    act(() => {
      result.current.subtractTenSeconds();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when adjusting or skipping while idle", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.addTenSeconds();
      result.current.subtractTenSeconds();
      result.current.skip();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
  });
});
