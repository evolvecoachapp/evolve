import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export function NotificationSkeleton() {
  const styles = useThemedStyles(({ colors, typography }) => ({
    stack: { gap: spacing.md },
    text: { ...typography.callout, color: colors.inkMuted },
    block: { height: 96, borderRadius: 24, backgroundColor: colors.overlayStrong },
  }));

  return (
    <View style={styles.stack}>
      <AppCard variant="glass">
        <Text style={styles.text}>Loading your Notification Center...</Text>
      </AppCard>
      <View style={styles.block} />
      <View style={styles.block} />
      <View style={styles.block} />
    </View>
  );
}
