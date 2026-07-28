import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachSummaryCard } from "../models/CoachSummaryCard";
import { DashboardSection } from "./DashboardSection";

interface CoachCardProps {
  readonly coach: CoachSummaryCard;
  readonly onPress?: () => void;
}

/** Coach insight card — presentation only. */
export function CoachCard({ coach, onPress }: CoachCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      coachQuote: {
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.md,
      },
      coachIcon: {
        width: spacing.avatar.md,
        height: spacing.avatar.md,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      coachMessage: {
        ...typography.bodyRelaxed,
        flex: 1,
        color: colors.inkSecondary,
      },
      coachLink: {
        ...typography.caption,
        color: colors.ink,
        fontWeight: "600",
      },
    }),
  );

  if (!coach.present) {
    return null;
  }

  return (
    <DashboardSection title="Coach Suggestion">
      <AppCard variant="glass" onPress={onPress}>
        <View style={styles.coachQuote}>
          <View style={styles.coachIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={spacing.icon.md}
              color={colors.pulse}
            />
          </View>
          <Text style={styles.coachMessage}>{coach.message}</Text>
        </View>
        <Text style={styles.coachLink}>{coach.actionLabel}</Text>
      </AppCard>
    </DashboardSection>
  );
}
