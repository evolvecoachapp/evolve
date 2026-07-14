/** Time-of-day greeting for the dashboard hero. */
export function formatDashboardGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Long-form date for the dashboard hero overline. */
export function formatDashboardDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Compact workouts progress label for floating stat chips. */
export function formatWorkoutsProgress(completed: number, target: number): string {
  return `${completed}/${target}`;
}
