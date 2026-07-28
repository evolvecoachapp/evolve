import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";

/** Empty coach experience state — presentation only. */
export function CoachEmpty() {
  return (
    <AppCard variant="elevated">
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title="No coaching yet"
        subtitle="Your contextual Coach conversation and insights will appear here."
      />
    </AppCard>
  );
}
