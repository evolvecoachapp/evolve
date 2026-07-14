export function formatRecoveryScore(score: number): string {
  return `${score}%`;
}

export function formatReadinessLabel(score: number): string {
  if (score >= 75) {
    return "High readiness";
  }
  if (score >= 50) {
    return "Moderate readiness";
  }
  return "Low readiness";
}

export function formatAiStatusLabel(status: "active" | "thinking" | "idle"): string {
  switch (status) {
    case "thinking":
      return "Analyzing";
    case "idle":
      return "Standby";
    case "active":
    default:
      return "Active";
  }
}
