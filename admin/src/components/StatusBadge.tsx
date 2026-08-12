type StatusBadgeProps = {
  tone: "success" | "warning" | "danger" | "neutral";
  children: string;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

export function healthTone(value: string): StatusBadgeProps["tone"] {
  if (value === "ok" || value === "online" || value === "connected") {
    return "success";
  }
  if (value === "degraded") {
    return "warning";
  }
  return "danger";
}
