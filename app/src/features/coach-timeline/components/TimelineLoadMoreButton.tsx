import { Text } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface TimelineLoadMoreButtonProps {
  readonly onPress?: () => void;
  readonly loading?: boolean;
}

export function TimelineLoadMoreButton({ onPress, loading = false }: TimelineLoadMoreButtonProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    label: { ...typography.callout, color: colors.pulse, textAlign: "center" as const },
  }));

  return (
    <AppCard variant="glass" onPress={onPress}>
      <Text style={styles.label}>{loading ? "Loading more..." : "Load more"}</Text>
    </AppCard>
  );
}
