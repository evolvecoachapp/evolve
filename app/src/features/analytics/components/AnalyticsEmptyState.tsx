import { EmptyState } from "../../../components/EmptyState";

export interface AnalyticsEmptyStateProps {
  title?: string;
  subtitle?: string;
}

/** Empty analytics state — reuses shared EmptyState. */
export function AnalyticsEmptyState({
  title = "No analytics yet",
  subtitle = "Complete a workout to see your training overview.",
}: AnalyticsEmptyStateProps) {
  return (
    <EmptyState
      icon="analytics-outline"
      title={title}
      subtitle={subtitle}
    />
  );
}
