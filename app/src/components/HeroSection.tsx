import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { HeroEntrance } from "../animation/HeroEntrance";
import { AppCard } from "./AppCard";
import { GlowOrb } from "./GlowOrb";
import { GradientBackground } from "./GradientBackground";
import { heroLayout, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type HeroSectionVariant = "canvas" | "card" | "accent" | "gradient";

interface HeroSectionProps {
  /** Uppercase overline — program name, date, or status. */
  overline?: string;
  title: string;
  subtitle?: string;
  /** Slot for Chip rows, badges, or meta. */
  badges?: React.ReactNode;
  /** Optional stats row or supporting content below the headline block. */
  children?: React.ReactNode;
  variant?: HeroSectionVariant;
  style?: ViewStyle;
}

/**
 * Composable hero anchor — one idea per screen zone.
 * Use `canvas` on dashboards (text on background), `card`/`accent` for feature heroes.
 */
export function HeroSection({
  overline,
  title,
  subtitle,
  badges,
  children,
  variant = "canvas",
  style,
}: HeroSectionProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        marginBottom: 0,
      },
      gradientWrapper: {
        borderRadius: heroLayout.heroRadius,
        overflow: "hidden",
      },
      gradientFill: {
        borderRadius: heroLayout.heroRadius,
      },
      gradientCard: {
        margin: spacing.sm,
      },
      glowTopRight: {
        top: heroLayout.gradientGlowOffset.top,
        right: heroLayout.gradientGlowOffset.right,
      },
      content: {
        gap: spacing.sm,
      },
      overline: {
        ...typography.eyebrow,
      },
      badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginTop: spacing.xs,
      },
      title: {
        ...typography.title1,
        marginTop: spacing.xs,
      },
      subtitle: {
        ...typography.bodyRelaxed,
        color: colors.inkMuted,
      },
      children: {
        marginTop: spacing.md,
        gap: spacing.cardGap,
      },
    }),
  );

  const content = (
    <View style={[styles.content, style]}>
      {overline ? <Text style={styles.overline}>{overline}</Text> : null}
      {badges ? <View style={styles.badges}>{badges}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );

  if (variant === "canvas") {
    return <HeroEntrance>{content}</HeroEntrance>;
  }

  if (variant === "gradient") {
    return (
      <HeroEntrance>
        <View style={styles.gradientWrapper}>
          <GradientBackground variant="hero" style={styles.gradientFill}>
            <GlowOrb
              tone="pulse"
              size={heroLayout.gradientGlowSize}
              style={styles.glowTopRight}
              animated
            />
            <AppCard variant="glass" style={styles.gradientCard}>
              {content}
            </AppCard>
          </GradientBackground>
        </View>
      </HeroEntrance>
    );
  }

  return (
    <HeroEntrance>
      <AppCard variant={variant === "accent" ? "accent" : "floating"} glow={variant === "accent"} style={styles.card}>
        {content}
      </AppCard>
    </HeroEntrance>
  );
}
