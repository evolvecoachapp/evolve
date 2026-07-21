import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { coachLayout, heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { CoachAvatar } from "./CoachAvatar";

export interface ConversationHeaderProps {
  coachName: string;
  providerName: string;
  model: string;
  online: boolean;
  conversationTitle: string;
}

/** Large hero header for Coach chat — presentation only. */
export function ConversationHeader({
  coachName,
  providerName,
  model,
  online,
  conversationTitle,
}: ConversationHeaderProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        minHeight: coachLayout.heroMinHeight,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
        overflow: "hidden",
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },
      topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
      },
      identity: {
        flex: 1,
        gap: spacing.xs,
        minWidth: 0,
      },
      eyebrow: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      name: {
        ...typography.title1,
        letterSpacing: -0.8,
        color: colors.ink,
      },
      title: {
        ...typography.bodyMedium,
        color: colors.inkSecondary,
      },
      metaCard: {
        marginBottom: 0,
        gap: spacing.sm,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: spacing.sm,
      },
      statusDot: {
        width: spacing.sm,
        height: spacing.sm,
        borderRadius: spacing.sm / 2,
        backgroundColor: online ? colors.success : colors.inkMuted,
      },
      statusLabel: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      metaText: {
        ...typography.caption,
        color: colors.inkMuted,
      },
    }),
  );

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.topRow}>
            <CoachAvatar size="lg" glow />
            <View style={styles.identity}>
              <Text style={styles.eyebrow}>AI Coach</Text>
              <Text style={styles.name}>{coachName}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {conversationTitle}
              </Text>
            </View>
          </View>
        </HeroEntrance>

        <HeroEntrance delay={80}>
          <AppCard variant="glass" glow padding="compact" style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>
                {online ? "Online" : "Offline"}
              </Text>
              <Chip label={providerName} size="sm" variant="accent" />
              <Text style={styles.metaText} numberOfLines={1}>
                {model}
              </Text>
            </View>
          </AppCard>
        </HeroEntrance>
      </View>
    </HeroAmbientLayer>
  );
}
