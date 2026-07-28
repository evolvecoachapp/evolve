import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachRecommendation } from "../models/CoachRecommendation";

interface RecommendationCardProps {
  readonly recommendation: CoachRecommendation;
  readonly onPress?: () => void;
}

/** Recommendation card — presentation only. */
export function RecommendationCard({
  recommendation,
  onPress,
}: RecommendationCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      body: {
        gap: spacing.sm,
      },
      domain: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      title: {
        ...typography.title3,
        color: colors.ink,
      },
      text: {
        ...typography.bodyRelaxed,
        color: colors.inkSecondary,
      },
      action: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
        marginTop: spacing.xs,
      },
    }),
  );

  return (
    <AppCard variant="elevated" onPress={onPress}>
      <View style={styles.body}>
        <Text style={styles.domain}>{recommendation.domain}</Text>
        <Text style={styles.title}>{recommendation.title}</Text>
        <Text style={styles.text}>{recommendation.body}</Text>
        <Text style={styles.action}>{recommendation.actionLabel}</Text>
      </View>
    </AppCard>
  );
}
