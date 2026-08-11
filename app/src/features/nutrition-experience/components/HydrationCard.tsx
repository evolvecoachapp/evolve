import { View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import type { HydrationProgress } from "../models";

const HYDRATION_LOG_INCREMENT_ML = 250;

export interface HydrationCardProps {
  readonly hydration: HydrationProgress;
  /** Logs a fixed increment of water intake — omitted when logging is unavailable. */
  readonly onLogHydration?: (amountMl: number) => void;
}

export function HydrationCard({ hydration, onLogHydration }: HydrationCardProps) {
  const goalReached = hydration.remainingMl <= 0;

  return (
    <View style={{ gap: spacing.sm }}>
      <StatCard
        label="Hydration"
        value={hydration.currentMl}
        unit="ml"
        trend={goalReached ? "Goal reached" : `${hydration.remainingMl} ml to goal`}
        progress={hydration.completionPercent}
        icon="water-outline"
      />
      {onLogHydration ? (
        <AppButton
          label={`+${HYDRATION_LOG_INCREMENT_ML} ml`}
          size="sm"
          variant="secondary"
          disabled={goalReached}
          onPress={() => onLogHydration(HYDRATION_LOG_INCREMENT_ML)}
        />
      ) : null}
    </View>
  );
}
