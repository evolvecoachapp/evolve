import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { AppButton } from "./AppButton";
import { EmptyState } from "./EmptyState";
import { GradientBackground } from "./GradientBackground";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export interface AppErrorFallbackProps {
  readonly icon?: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly subtitle: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
  readonly actionLoading?: boolean;
}

/**
 * Shared full-screen recovery presentation used by every global error
 * surface (runtime session failure, unexpected render errors). Reuses the
 * existing empty-state / button design language instead of introducing new
 * visuals, and never renders anything beyond the caller-supplied copy —
 * callers are responsible for keeping that copy free of raw error details.
 */
export function AppErrorFallback({
  icon = "alert-circle-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
  actionLoading = false,
}: AppErrorFallbackProps) {
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.screenPadding,
      gap: spacing.lg,
    },
    action: {
      minWidth: 180,
    },
  }));

  return (
    <GradientBackground variant="canvas">
      <View style={styles.container}>
        <EmptyState icon={icon} title={title} subtitle={subtitle} />
        <AppButton
          label={actionLabel}
          onPress={onAction}
          loading={actionLoading}
          style={styles.action}
        />
      </View>
    </GradientBackground>
  );
}
