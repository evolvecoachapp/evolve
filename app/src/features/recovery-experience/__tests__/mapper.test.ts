import { mapWorkspaceRecoveryToExperienceDto } from "../mappers/mapWorkspaceRecoveryToExperienceDto";
import { createRecoveryDay } from "../models";
import type { WorkspaceRecovery } from "../../unified-workspace/models/WorkspaceRecovery";

const TODAY = createRecoveryDay({
  id: "today",
  isoDate: "2026-08-11",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

const PRESENT_RECOVERY: WorkspaceRecovery = Object.freeze({
  athleteId: "athlete:1",
  present: true,
  card: null,
  status: "adequate",
  fatigueScore: 30,
  sleepLabel: "good",
  sleepHours: 7,
  signalSummaries: Object.freeze(["Sleep improving"]),
  summary: "Recovery stable",
});

describe("mapWorkspaceRecoveryToExperienceDto — buildAvailableDays", () => {
  it("gives Yesterday and Tomorrow distinct isoDate values shifted by one day", () => {
    const dto = mapWorkspaceRecoveryToExperienceDto({
      recovery: PRESENT_RECOVERY,
      day: TODAY,
    });

    const [yesterday, today, tomorrow] = dto.availableDays;

    expect(yesterday.isoDate).toBe("2026-08-10");
    expect(today.isoDate).toBe("2026-08-11");
    expect(tomorrow.isoDate).toBe("2026-08-12");

    const uniqueIsoDates = new Set(dto.availableDays.map((day) => day.isoDate));
    expect(uniqueIsoDates.size).toBe(3);
  });

  it("shifts correctly across a month boundary", () => {
    const monthEnd = createRecoveryDay({
      ...TODAY,
      id: "month-end",
      isoDate: "2026-08-31",
    });

    const dto = mapWorkspaceRecoveryToExperienceDto({
      recovery: PRESENT_RECOVERY,
      day: monthEnd,
    });

    const [yesterday, , tomorrow] = dto.availableDays;
    expect(yesterday.isoDate).toBe("2026-08-30");
    expect(tomorrow.isoDate).toBe("2026-09-01");
  });

  it("preserves distinct isoDate values on the empty-dashboard path", () => {
    const emptyRecovery: WorkspaceRecovery = Object.freeze({
      ...PRESENT_RECOVERY,
      present: false,
    });

    const dto = mapWorkspaceRecoveryToExperienceDto({
      recovery: emptyRecovery,
      day: TODAY,
    });

    const uniqueIsoDates = new Set(dto.availableDays.map((day) => day.isoDate));
    expect(uniqueIsoDates.size).toBe(3);
  });
});
