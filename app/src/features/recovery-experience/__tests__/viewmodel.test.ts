import { createRecoveryDay, RecoveryLoadingStatuses } from "../models";
import {
  emptyMockRecoveryExperienceService,
  mockRecoveryExperienceService,
} from "../providers/MockRecoveryExperienceService";
import type { RecoveryExperienceService } from "../services";
import { RecoveryExperienceError } from "../services";
import { RecoveryExperienceViewModel } from "../viewmodels";

const TODAY = createRecoveryDay({
  id: "today",
  isoDate: "2026-07-29",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

describe("RecoveryExperienceViewModel", () => {
  it("loads dashboard recovery data", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    expect(viewModel.loading.status).toBe(RecoveryLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard?.headline).toContain("recovery");
  });

  it("exposes error state when provider fails", async () => {
    const failing: RecoveryExperienceService = {
      providerId: "mock",
      async getDashboard() {
        throw new RecoveryExperienceError("load failed", "mock");
      },
      async logSleep() {
        throw new RecoveryExperienceError("sleep failed", "mock");
      },
      async updateReadiness() {
        throw new RecoveryExperienceError("readiness failed", "mock");
      },
      async assessRecovery() {
        throw new RecoveryExperienceError("assess failed", "mock");
      },
    };
    const viewModel = new RecoveryExperienceViewModel({ service: failing, initialDay: TODAY });
    await viewModel.loadDashboard();
    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores dashboard after a transient error", async () => {
    let calls = 0;
    const service: RecoveryExperienceService = {
      providerId: "mock",
      async getDashboard(day) {
        calls += 1;
        if (calls === 1) {
          throw new RecoveryExperienceError("transient", "mock");
        }
        return mockRecoveryExperienceService.getDashboard(day);
      },
      logSleep: mockRecoveryExperienceService.logSleep,
      updateReadiness: mockRecoveryExperienceService.updateReadiness,
      assessRecovery: mockRecoveryExperienceService.assessRecovery,
    };
    const viewModel = new RecoveryExperienceViewModel({ service, initialDay: TODAY });
    await viewModel.loadDashboard();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard).not.toBeNull();
  });

  it("logs sleep through the mock provider", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    await viewModel.logSleep(8);
    expect(viewModel.dashboard?.sleep.hours).toBe(8);
    expect(viewModel.dashboard?.sleep.logged).toBe(true);
  });

  it("updates readiness through the mock provider", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    await viewModel.updateReadiness(82);
    expect(viewModel.dashboard?.readiness.score).toBe(82);
  });

  it("assesses recovery through the mock provider", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    await viewModel.assessRecovery();
    expect(viewModel.dashboard?.recoveryScore).toBeGreaterThan(0);
  });

  it("applyHydratedRecovery marks runtime-driven state", () => {
    const viewModel = new RecoveryExperienceViewModel({ athleteId: "athlete:1" });
    viewModel.applyHydratedRecovery({
      day: TODAY,
      availableDays: Object.freeze([TODAY]),
      headline: "72% recovery",
      summary: "Recovery stable",
      todaysGoal: "Protect sleep",
      recoveryScore: 72,
      status: "adequate",
      sleep: Object.freeze({
        hours: 7,
        quality: 70,
        label: "good",
        logged: true,
        destination: null,
      }),
      readiness: Object.freeze({
        score: 72,
        label: "good",
        destination: null,
      }),
      signals: Object.freeze([]),
      assessmentAvailable: true,
      historyDestination: null,
    });
    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard?.recoveryScore).toBe(72);
  });

  it("exposes empty state for empty mock provider", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: emptyMockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    expect(viewModel.isEmpty).toBe(true);
  });
});
