import { EmptyState } from "../../../components/EmptyState";

export function AnalyticsEmpty() {
  return (
    <EmptyState
      icon="analytics-outline"
      title="No analytics yet"
      subtitle="Complete workouts and log metrics to unlock progress analytics."
    />
  );
}
