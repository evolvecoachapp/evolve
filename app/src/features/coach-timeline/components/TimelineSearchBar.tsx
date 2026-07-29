import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface TimelineSearchBarProps {
  readonly query: string | null;
}

export function TimelineSearchBar({ query }: TimelineSearchBarProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.row}>{query && query.length > 0 ? query : "No query"}</Text>
      </View>
    </AppCard>
  );
}
