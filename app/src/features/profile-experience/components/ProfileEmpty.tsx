import { EmptyState } from "../../../components/EmptyState";

export function ProfileEmpty() {
  return (
    <EmptyState
      icon="person-outline"
      title="No profile set up yet"
      subtitle="Complete your athlete profile to unlock personalized training, nutrition, and coaching."
    />
  );
}
