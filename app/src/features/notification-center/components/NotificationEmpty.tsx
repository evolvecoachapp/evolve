import { EmptyState } from "../../../components/EmptyState";

export function NotificationEmpty() {
  return (
    <EmptyState
      icon="notifications-off-outline"
      title="No notifications yet"
      subtitle="When you have workout reminders, coach insights, or progress updates, they'll appear here."
    />
  );
}
