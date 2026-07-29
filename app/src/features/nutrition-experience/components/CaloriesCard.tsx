import { StatCard } from "../../../components/StatCard";
import type { MacroProgress } from "../models";

export interface CaloriesCardProps {
  readonly macros: MacroProgress;
}

export function CaloriesCard({ macros }: CaloriesCardProps) {
  return (
    <StatCard
      label="Daily Calories"
      value={macros.calories.current}
      unit="kcal"
      trend={`${macros.calories.remaining} kcal remaining`}
      progress={macros.calories.completionPercent}
      icon="flash-outline"
    />
  );
}
