import { EmptyState } from "../../../components/EmptyState";

export function TimelineEmpty() {
  return (
    <EmptyState
      icon="time-outline"
      title="No timeline events"
      subtitle="Athlete events from workouts, nutrition, recovery, and coach will appear here."
    />
  );
}
