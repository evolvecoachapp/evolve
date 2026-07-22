import type { ExercisePerformance } from "../models/ExercisePerformance";
import type { MovementPerformance } from "../models/MovementPerformance";
import type { PerformanceContext } from "../models/PerformanceContext";
import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";
import type { PerformanceSummary } from "../models/PerformanceSummary";
import type { PerformanceTrend } from "../models/PerformanceTrend";
import type { SessionPerformance } from "../models/SessionPerformance";
import { freezeSnapshot } from "../utils/freezeSnapshots";

const SINGLE_SESSION_TREND: PerformanceTrend = Object.freeze({
  available: false,
  sessionCount: 1,
  message: "single_session_only",
});

/**
 * Fluent builder for immutable PerformanceSnapshot.
 */
export class PerformanceSnapshotBuilder {
  private id = "";
  private context: PerformanceContext | null = null;
  private session: SessionPerformance | null = null;
  private metrics: PerformanceMetrics | null = null;
  private exercises: readonly ExercisePerformance[] = [];
  private movements: readonly MovementPerformance[] = [];
  private grade: PerformanceGrade = "Incomplete";
  private summary: PerformanceSummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withContext(context: PerformanceContext): this {
    this.context = context;
    return this;
  }

  withSession(session: SessionPerformance): this {
    this.session = session;
    return this;
  }

  withMetrics(metrics: PerformanceMetrics): this {
    this.metrics = metrics;
    return this;
  }

  withExercises(exercises: readonly ExercisePerformance[]): this {
    this.exercises = exercises;
    return this;
  }

  withMovements(movements: readonly MovementPerformance[]): this {
    this.movements = movements;
    return this;
  }

  withGrade(grade: PerformanceGrade): this {
    this.grade = grade;
    return this;
  }

  withSummary(summary: PerformanceSummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): PerformanceSnapshot {
    if (
      !this.id ||
      !this.context ||
      !this.session ||
      !this.metrics ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("PerformanceSnapshotBuilder missing required fields");
    }

    return freezeSnapshot({
      id: this.id,
      context: this.context,
      session: this.session,
      metrics: this.metrics,
      exercises: this.exercises,
      movements: this.movements,
      grade: this.grade,
      summary: this.summary,
      trend: SINGLE_SESSION_TREND,
      frozenAt: this.frozenAt,
    });
  }
}
