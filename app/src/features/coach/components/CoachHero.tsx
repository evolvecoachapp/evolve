import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { AiPresenceOrb } from "../../../components/AiPresenceOrb";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, heroLayout, motion, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatAiStatusLabel,
  formatReadinessLabel,
  formatRecoveryScore,
} from "../utils/presentationFormatters";

interface CoachHeroProps {
  aiStatus: "active" | "thinking" | "idle";
  recoveryScore: number;
  readinessDetail: string;
  trainingRecommendation: string;
  trainingDetail: string;
}

export function CoachHero({
  aiStatus,
  recoveryScore,
  readinessDetail,
  trainingRecommendation,
  trainingDetail,
}: CoachHeroProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        minHeight: coachLayout.heroMinHeight,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
        gap: heroLayout.contentGap,
      },
      titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
      },
      titleBlock: {
        flex: 1,
        gap: heroLayout.headlineGap,
        paddingTop: spacing.sm,
        maxWidth: heroLayout.headlineMaxWidth.coach,
      },
      eyebrow: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.title1,
        letterSpacing: -0.8,
      },
      statusRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
        marginTop: spacing.sm,
      },
      statusHint: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      presenceOrb: {
        marginTop: -spacing.sm,
        marginRight: -spacing.sm,
        transform: [{ scale: 0.88 }],
      },
      recommendationBlock: {
        gap: spacing.xs,
        paddingTop: spacing.xs,
      },
      recommendationLabel: {
        ...typography.eyebrow,
        color: colors.inkMuted,
      },
      recommendationTitle: {
        ...typography.title3,
        color: colors.ink,
      },
      recommendationDetail: {
        ...typography.callout,
        color: colors.inkSecondary,
      },
      chipField: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
        marginTop: spacing.xs,
      },
      chip: {
        flexGrow: 1,
        minWidth: "30%",
      },
      chipWide: {
        flexBasis: "100%",
        minWidth: "100%",
      },
      insightRail: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderRadius: heroLayout.heroRadius,
        borderWidth: 1,
        borderColor: colors.pulseMuted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + spacing.xs,
        marginTop: spacing.xs,
      },
      insightIcon: {
        width: spacing.xl,
        height: spacing.xl,
        borderRadius: spacing.xl / 2,
        backgroundColor: colors.surfaceElevated,
        alignItems: "center",
        justifyContent: "center",
      },
      insightText: {
        ...typography.caption,
        color: colors.inkSecondary,
        flex: 1,
        lineHeight: 18,
      },
    }),
  );

  const statusLabel = formatAiStatusLabel(aiStatus);
  const readinessLabel = formatReadinessLabel(recoveryScore);

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>Performance AI</Text>
              <Text style={styles.title}>AI Coach</Text>
              <View style={styles.statusRow}>
                <Chip
                  label={statusLabel}
                  variant="accent"
                  size="sm"
                  icon="radio-button-on"
                />
                <Text style={styles.statusHint}>Personalized for today</Text>
              </View>
            </View>

            <AiPresenceOrb
              size={coachLayout.presenceOrbSize}
              style={styles.presenceOrb}
            />
          </View>
        </HeroEntrance>

        <HeroEntrance delay={motion.enter.staggerDelay}>
          <View style={styles.recommendationBlock}>
            <Text style={styles.recommendationLabel}>Training recommendation</Text>
            <Text style={styles.recommendationTitle}>{trainingRecommendation}</Text>
            <Text style={styles.recommendationDetail}>{trainingDetail}</Text>
          </View>
        </HeroEntrance>

        <View style={styles.chipField}>
          <FloatingStatChip
            label="Recovery"
            value={formatRecoveryScore(recoveryScore)}
            icon="heart-outline"
            tone="accent"
            style={styles.chip}
            enterIndex={0}
          />
          <FloatingStatChip
            label="Readiness"
            value={readinessLabel}
            icon="pulse-outline"
            tone="warm"
            style={styles.chip}
            enterIndex={1}
          />
          <FloatingStatChip
            label="Today"
            value={readinessDetail}
            icon="sunny-outline"
            tone="neutral"
            style={styles.chipWide}
            enterIndex={2}
          />
        </View>

        <HeroEntrance delay={motion.enter.staggerDelay * 2}>
          <LinearGradient
            colors={[colors.pulseMuted, colors.glass]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.insightRail}
          >
            <View style={styles.insightIcon}>
              <Ionicons name="flash-outline" size={spacing.icon.xs} color={colors.pulse} />
            </View>
            <Text style={styles.insightText} numberOfLines={2}>
              Recovery is strong — your Coach is calibrated for performance guidance today.
            </Text>
          </LinearGradient>
        </HeroEntrance>
      </View>
    </HeroAmbientLayer>
  );
}
