import { Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutSet } from "../models/experience/WorkoutSet";
import { SetRow } from "./SetRow";

interface SetListProps {
  readonly sets: readonly WorkoutSet[];
}

/** Set list — presentation only. */
export function SetList({ sets }: SetListProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      gap: spacing.sm,
    },
    title: {
      ...typography.caption,
      color: colors.inkMuted,
      fontWeight: "700" as const,
      textTransform: "uppercase" as const,
      letterSpacing: 0.6,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sets</Text>
      {sets.map((set) => (
        <SetRow key={set.id} set={set} />
      ))}
    </View>
  );
}
