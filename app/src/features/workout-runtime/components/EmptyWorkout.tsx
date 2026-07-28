import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";

/** Empty workout runtime state — presentation only. */
export function EmptyWorkout() {
  return (
    <AppCard variant="elevated">
      <EmptyState
        icon="barbell-outline"
        title="No workout today"
        subtitle="Your training session will appear here when a workout is available."
      />
    </AppCard>
  );
}
