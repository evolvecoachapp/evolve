import { Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineGroup } from "../models";

export interface TimelineGroupHeaderProps {
  readonly group: TimelineGroup;
}

export function TimelineGroupHeader({ group }: TimelineGroupHeaderProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.xs,
    },
    title: { ...typography.title3 },
    count: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{group.label}</Text>
      <Text style={styles.count}>{group.eventCount}</Text>
    </View>
  );
}
