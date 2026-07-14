import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { progressMock } from "../data/mocks/progress";
import { colors, radius, spacing, typography } from "../theme/theme";

export function ProgressScreen() {
  const { stats } = progressMock;

  return (
    <View style={styles.screen}>
      <AppHeader title="Progress" subtitle="Your fitness journey" />
      <ScreenContainer>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <StatCard
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                trend={stat.trend}
                icon={stat.icon}
              />
            </View>
          ))}
        </View>

        <View>
          <SectionTitle title="Trends" />
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weight Trend</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="analytics-outline" size={28} color={colors.textMuted} />
              <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
            </View>
          </AppCard>
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Strength Trend</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="trending-up-outline" size={28} color={colors.textMuted} />
              <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
            </View>
          </AppCard>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCell: {
    width: "47%",
    flexGrow: 1,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  chartPlaceholder: {
    height: 140,
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chartPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
