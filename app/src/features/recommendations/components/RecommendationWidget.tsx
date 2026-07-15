import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { AppCard } from "../../../components/AppCard"
import { Chip } from "../../../components/Chip"
import { SectionTitle } from "../../../components/SectionTitle"
import { recommendationStore } from "../service"
import { presentRecommendation, pickHighestPriority } from "../RecommendationPresenter"
import { useThemedStyles } from "../../../theme/useThemedStyles"
import { spacing } from "../../../theme/theme"

export function RecommendationWidget() {
  const feed = recommendationStore.getLatest()

  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      container: {
        gap: spacing.md,
      },
      title: {
        ...typography.title3,
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      reason: {
        ...typography.caption,
        color: colors.inkMuted,
        marginTop: spacing.sm,
      },
    }),
  )

  if (!feed || !feed.recommendations || feed.recommendations.length === 0) {
    return (
      <AppCard variant="elevated">
        <View style={styles.container}>
          <Text testID="rec-empty-title" style={styles.title}>No recommendations yet.</Text>
          <Text testID="rec-empty-subtitle" style={styles.subtitle}>Complete your first workout to unlock personalized coaching.</Text>
        </View>
      </AppCard>
    )
  }

  const best = pickHighestPriority(feed.recommendations)
  const vm = presentRecommendation(best)

  return (
    <AppCard variant="floating" glow onPress={() => {}}>
      <View style={styles.container}>
        <View style={styles.metaRow}>
          <Chip label={vm.categoryBadge} variant="neutral" size="sm" />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.subtitle}>{vm.priorityLabel}</Text>
            <Text style={styles.subtitle}>{vm.confidence}</Text>
          </View>
        </View>

        <Text testID="rec-title" style={styles.title}>{vm.title}</Text>
        <Text testID="rec-desc" style={styles.subtitle}>{vm.description}</Text>
        <Text testID="rec-reason" style={styles.reason}>Reason: {vm.reason}</Text>
      </View>
    </AppCard>
  )
}

export default RecommendationWidget

// Theme-free variant useful for tests and environments without ThemeProvider.
export function RecommendationWidgetPlain() {
  const feed = recommendationStore.getLatest()

  const styles = StyleSheet.create({
    container: { padding: spacing.md },
    title: { fontSize: 18, fontWeight: "600" },
    subtitle: { fontSize: 14, color: "#666" },
    metaRow: { flexDirection: "row", justifyContent: "space-between" },
    reason: { fontSize: 12, color: "#666", marginTop: spacing.sm },
  })

  if (!feed || !feed.recommendations || feed.recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <Text testID="rec-empty-title" style={styles.title}>
          No recommendations yet.
        </Text>
        <Text testID="rec-empty-subtitle" style={styles.subtitle}>
          Complete your first workout to unlock personalized coaching.
        </Text>
      </View>
    )
  }

  const best = pickHighestPriority(feed.recommendations)
  const vm = presentRecommendation(best)

  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text>{vm.categoryBadge}</Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text>{vm.priorityLabel}</Text>
          <Text>{vm.confidence}</Text>
        </View>
      </View>

      <Text testID="rec-title" style={styles.title}>
        {vm.title}
      </Text>
      <Text testID="rec-desc" style={styles.subtitle}>
        {vm.description}
      </Text>
      <Text testID="rec-reason" style={styles.reason}>
        Reason: {vm.reason}
      </Text>
    </View>
  )
}
