import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineEvent } from "../models";

export interface TimelineEventCardProps {
  readonly event: TimelineEvent;
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.row}>{event.summary}</Text>
        <Text style={styles.meta}>
          {event.category} · {event.type} · {event.priority}
        </Text>
      </View>
    </AppCard>
  );
}
