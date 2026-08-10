import {
  createAnalyticsTimelineEvent,
  type AnalyticsTimelineEvent,
  type AnalyticsTimelineProjectionResult,
} from "../models";
import type { AnalyticsTimelineProjector } from "../projector";

export interface ProjectAnalyticsEventToTimelineOptions {
  readonly projector: AnalyticsTimelineProjector;
  readonly event: AnalyticsTimelineEvent;
}

/** Projects an immutable analytics event into Coach Timeline. */
export function projectAnalyticsEventToTimeline(
  options: ProjectAnalyticsEventToTimelineOptions,
): AnalyticsTimelineProjectionResult {
  return options.projector.project(options.event);
}

export interface ProjectGoalProgressIngestToTimelineOptions {
  readonly projector: AnalyticsTimelineProjector;
  readonly event: AnalyticsTimelineEvent & { readonly source: "goal" };
}

export function projectGoalProgressIngestToTimeline(
  options: ProjectGoalProgressIngestToTimelineOptions,
): AnalyticsTimelineProjectionResult {
  return projectAnalyticsEventToTimeline({
    projector: options.projector,
    event: createAnalyticsTimelineEvent(options.event),
  });
}

export interface ProjectWorkoutProgressIngestToTimelineOptions {
  readonly projector: AnalyticsTimelineProjector;
  readonly event: AnalyticsTimelineEvent & { readonly source: "workout" };
}

export function projectWorkoutProgressIngestToTimeline(
  options: ProjectWorkoutProgressIngestToTimelineOptions,
): AnalyticsTimelineProjectionResult {
  return projectAnalyticsEventToTimeline({
    projector: options.projector,
    event: createAnalyticsTimelineEvent(options.event),
  });
}

export interface ProjectNutritionProgressIngestToTimelineOptions {
  readonly projector: AnalyticsTimelineProjector;
  readonly event: AnalyticsTimelineEvent & { readonly source: "nutrition" };
}

export function projectNutritionProgressIngestToTimeline(
  options: ProjectNutritionProgressIngestToTimelineOptions,
): AnalyticsTimelineProjectionResult {
  return projectAnalyticsEventToTimeline({
    projector: options.projector,
    event: createAnalyticsTimelineEvent(options.event),
  });
}

export interface ProjectRecoveryProgressIngestToTimelineOptions {
  readonly projector: AnalyticsTimelineProjector;
  readonly event: AnalyticsTimelineEvent & { readonly source: "recovery" };
}

export function projectRecoveryProgressIngestToTimeline(
  options: ProjectRecoveryProgressIngestToTimelineOptions,
): AnalyticsTimelineProjectionResult {
  return projectAnalyticsEventToTimeline({
    projector: options.projector,
    event: createAnalyticsTimelineEvent(options.event),
  });
}
