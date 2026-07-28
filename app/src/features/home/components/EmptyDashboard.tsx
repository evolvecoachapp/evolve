import { EmptyState } from "../../../components/EmptyState";
import { AppCard } from "../../../components/AppCard";
import { DashboardSection } from "./DashboardSection";

/** Empty Home dashboard state — presentation only. */
export function EmptyDashboard() {
  return (
    <DashboardSection title="Home">
      <AppCard variant="elevated">
        <EmptyState
          icon="home-outline"
          title="Nothing on your Home yet"
          subtitle="Your workout, nutrition, and recovery summary will appear here once available."
        />
      </AppCard>
    </DashboardSection>
  );
}
