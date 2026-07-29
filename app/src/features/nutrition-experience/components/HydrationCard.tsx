import { StatCard } from "../../../components/StatCard";
import type { HydrationProgress } from "../models";

export interface HydrationCardProps {
  readonly hydration: HydrationProgress;
}

export function HydrationCard({ hydration }: HydrationCardProps) {
  return (
    <StatCard
      label="Hydration"
      value={hydration.currentMl}
      unit="ml"
      trend={`${hydration.remainingMl} ml to goal`}
      progress={hydration.completionPercent}
      icon="water-outline"
    />
  );
}
