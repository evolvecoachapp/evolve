import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function AppHeader({ title, subtitle, rightAction }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.lg,
      backgroundColor: "transparent",
    },
    textBlock: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      ...typography.title1,
      color: colors.ink,
    },
    subtitle: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    rightAction: {
      marginLeft: spacing.md,
    },
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}
