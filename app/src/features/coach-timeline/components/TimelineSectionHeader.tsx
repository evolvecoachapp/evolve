import { Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineSection } from "../models";

export interface TimelineSectionHeaderProps {
  readonly section: TimelineSection;
}

export function TimelineSectionHeader({ section }: TimelineSectionHeaderProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      paddingVertical: spacing.xs,
    },
    title: { ...typography.title3 },
    count: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{section.title}</Text>
      <Text style={styles.count}>{section.eventCount}</Text>
    </View>
  );
}
