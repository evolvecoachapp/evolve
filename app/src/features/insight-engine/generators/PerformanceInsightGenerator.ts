import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";

export interface PerformanceInsightGenerator {
  generate(options: {
    readonly performanceSnapshot: PerformanceSnapshot;
    readonly generatedAt: string;
  }): readonly Insight[];
}

function gradeSeverity(
  grade: PerformanceSnapshot["grade"],
): (typeof InsightSeverities)[keyof typeof InsightSeverities] {
  if (grade === "F" || grade === "Incomplete") {
    return InsightSeverities.ELEVATED;
  }
  if (grade === "D") {
    return InsightSeverities.NOTABLE;
  }
  return InsightSeverities.INFO;
}

/**
 * Emits deterministic performance facts from a PerformanceSnapshot.
 */
export class DefaultPerformanceInsightGenerator
  implements PerformanceInsightGenerator
{
  generate(options: {
    readonly performanceSnapshot: PerformanceSnapshot;
    readonly generatedAt: string;
  }): readonly Insight[] {
    const { performanceSnapshot: snapshot, generatedAt } = options;
    const metrics = snapshot.metrics;
    const insights: Insight[] = [];

    insights.push(
      new InsightBuilder()
        .withId(`insight:perf:grade:${snapshot.id}`)
        .withType(InsightTypes.PERFORMANCE)
        .withCategory(InsightCategories.GRADE)
        .withSeverity(gradeSeverity(snapshot.grade))
        .withPriority(70)
        .withTitle("Session performance grade")
        .withStatement(`Session performance grade is ${snapshot.grade}.`)
        .withReason({
          code: "performance_grade_observed",
          statement: "Grade taken from PerformanceSnapshot.grade",
          attributes: Object.freeze({ grade: snapshot.grade }),
        })
        .withEvidence({
          sourceType: "PerformanceSnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({ grade: snapshot.grade }),
        })
        .withMetadata({
          tags: Object.freeze(["performance", "grade"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    insights.push(
      new InsightBuilder()
        .withId(`insight:perf:tonnage:${snapshot.id}`)
        .withType(InsightTypes.PERFORMANCE)
        .withCategory(InsightCategories.VOLUME)
        .withSeverity(InsightSeverities.INFO)
        .withPriority(55)
        .withTitle("Session tonnage")
        .withStatement(
          `Session tonnage is ${metrics.volume.tonnage} across ${metrics.volume.totalCompletedSets} completed sets.`,
        )
        .withReason({
          code: "performance_tonnage_observed",
          statement: "Tonnage taken from PerformanceSnapshot.metrics.volume",
          attributes: Object.freeze({
            tonnage: metrics.volume.tonnage,
            completedSets: metrics.volume.totalCompletedSets,
          }),
        })
        .withEvidence({
          sourceType: "PerformanceSnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({
            tonnage: metrics.volume.tonnage,
            volumeLoad: metrics.volume.volumeLoad,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["performance", "volume"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    const completion = metrics.completion.workoutCompletionPercent;
    insights.push(
      new InsightBuilder()
        .withId(`insight:perf:completion:${snapshot.id}`)
        .withType(InsightTypes.PERFORMANCE)
        .withCategory(InsightCategories.COMPLETION)
        .withSeverity(
          completion < 50
            ? InsightSeverities.ELEVATED
            : completion < 80
              ? InsightSeverities.NOTABLE
              : InsightSeverities.INFO,
        )
        .withPriority(60)
        .withTitle("Workout completion")
        .withStatement(`Workout completion is ${completion}%.`)
        .withReason({
          code: "performance_completion_observed",
          statement:
            "Completion taken from PerformanceSnapshot.metrics.completion",
          attributes: Object.freeze({ workoutCompletionPercent: completion }),
        })
        .withEvidence({
          sourceType: "PerformanceSnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({
            workoutCompletionPercent: completion,
            setCompletionPercent: metrics.completion.setCompletionPercent,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["performance", "completion"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    return Object.freeze(insights);
  }
}

export function createPerformanceInsightGenerator(): PerformanceInsightGenerator {
  return new DefaultPerformanceInsightGenerator();
}
