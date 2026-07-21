import { EmptyState } from "../../../components/EmptyState";

export interface RecordsEmptyStateProps {
  title?: string;
  subtitle?: string;
}

/** Empty records state — reuses shared EmptyState. */
export function RecordsEmptyState({
  title = "No records yet",
  subtitle = "Complete a workout to unlock your lifetime personal records.",
}: RecordsEmptyStateProps) {
  return (
    <EmptyState
      icon="trophy-outline"
      title={title}
      subtitle={subtitle}
    />
  );
}
