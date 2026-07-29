import { EmptyState } from "../../../components/EmptyState";

export function NutritionEmpty() {
  return (
    <EmptyState
      icon="restaurant-outline"
      title="No nutrition day yet"
      subtitle="Meals, hydration, and coach suggestions will appear once your day has structure."
    />
  );
}
