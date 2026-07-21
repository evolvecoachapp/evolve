import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { CoachAvatar } from "./CoachAvatar";

export const EMPTY_CONVERSATION_EXAMPLES = [
  "Ask me about your training",
  "How can I improve my squat?",
  "What caused my plateau?",
] as const;

export interface EmptyConversationProps {
  onExamplePress?: (example: string) => void;
}

/** Premium empty chat state with example prompts — presentation only. */
export function EmptyConversation({
  onExamplePress,
}: EmptyConversationProps) {
  const styles = useThemedStyles(({ colors, typography, shadows }) =>
    StyleSheet.create({
      container: {
        alignItems: "center",
        paddingVertical: spacing["2xl"],
        gap: spacing.xl,
      },
      illustration: {
        width: spacing.avatar.xl + spacing.xl,
        height: spacing.avatar.xl + spacing.xl,
        borderRadius: (spacing.avatar.xl + spacing.xl) / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.pulseMuted,
        ...shadows.glow,
      },
      copy: {
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
      },
      title: {
        ...typography.title3,
        color: colors.ink,
        textAlign: "center",
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkMuted,
        textAlign: "center",
        maxWidth: 280,
      },
      examples: {
        width: "100%",
        gap: spacing.sm,
      },
      exampleCard: {
        marginBottom: 0,
      },
      exampleText: {
        ...typography.bodyMedium,
        color: colors.ink,
      },
    }),
  );

  return (
    <View style={styles.container}>
      <HeroEntrance delay={0}>
        <View style={styles.illustration} accessibilityLabel="Coach illustration">
          <CoachAvatar size="lg" glow />
        </View>
      </HeroEntrance>

      <HeroEntrance delay={60}>
        <View style={styles.copy}>
          <Text style={styles.title}>Start a conversation</Text>
          <Text style={styles.subtitle}>
            Your Coach is ready to help with training, recovery, and progress.
          </Text>
        </View>
      </HeroEntrance>

      <HeroEntrance delay={120}>
        <View style={styles.examples}>
          {EMPTY_CONVERSATION_EXAMPLES.map((example) => (
            <AnimatedPressable
              key={example}
              accessibilityRole="button"
              accessibilityLabel={example}
              onPress={() => onExamplePress?.(example)}
              haptic="light"
              disabled={!onExamplePress}
            >
              <AppCard variant="glass" padding="compact" style={styles.exampleCard}>
                <Text style={styles.exampleText}>{example}</Text>
              </AppCard>
            </AnimatedPressable>
          ))}
        </View>
      </HeroEntrance>
    </View>
  );
}
