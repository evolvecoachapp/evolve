import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionCoachSuggestion } from "../models";

export interface CoachSuggestionCardProps {
  readonly suggestion: NutritionCoachSuggestion;
}

export function CoachSuggestionCard({ suggestion }: CoachSuggestionCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.title3 },
    message: { ...typography.body, color: colors.inkMuted },
    metric: { ...typography.caption, color: colors.pulse },
  }));

  return (
    <AppCard variant={suggestion.tone === "attention" ? "accent" : "surface"}>
      <View style={styles.body}>
        <Text style={styles.title}>{suggestion.title}</Text>
        <Text style={styles.message}>{suggestion.message}</Text>
        <Text style={styles.metric}>{suggestion.metric}</Text>
      </View>
    </AppCard>
  );
}
