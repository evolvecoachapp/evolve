import {
  formatSessionDuration,
  formatSessionVolumeKg,
} from "../sessionSummaryFormatters";

describe("sessionSummaryFormatters", () => {
  it("formats durations across second / minute / hour ranges", () => {
    expect(formatSessionDuration(45)).toBe("45s");
    expect(formatSessionDuration(120)).toBe("2 min");
    expect(formatSessionDuration(185)).toBe("3m 5s");
    expect(formatSessionDuration(3600)).toBe("1h");
    expect(formatSessionDuration(3900)).toBe("1h 5m");
  });

  it("formats volume compactly", () => {
    expect(formatSessionVolumeKg(920)).toBe("920 kg");
    expect(formatSessionVolumeKg(4200)).toBe("4.2k kg");
    expect(formatSessionVolumeKg(1000)).toBe("1k kg");
  });
});
