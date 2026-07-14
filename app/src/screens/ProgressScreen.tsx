import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { ChartPlaceholder } from "../components/ChartPlaceholder";
import { GradientBackground } from "../components/GradientBackground";
import { HeroSection } from "../components/HeroSection";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { progressMock } from "../data/mocks/progress";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function ProgressScreen() {
  const { stats } = progressMock;
  const headlineStat = stats[0];

  const styles = useThemedStyles(({ typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
      statCell: {
        width: spacing.gridHalfWidth,
        flexGrow: 1,
      },
      chartCard: {
        marginBottom: spacing.md,
      },
      chartTitle: {
        ...typography.title3,
        marginBottom: spacing.md,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Progress" subtitle="Your fitness journey" />
        <TabScreenContainer gradient={false}>
          {headlineStat ? (
            <HeroSection
              variant="canvas"
              overline="Primary metric"
              title={`${headlineStat.value}${headlineStat.unit ?? ""}`}
              subtitle={`${headlineStat.label}${headlineStat.trend ? ` · ${headlineStat.trend}` : ""}`}
            />
          ) : null}

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
            <AppCard variant="elevated" style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weight Trend</Text>
              <ChartPlaceholder icon="analytics-outline" />
            </AppCard>
            <AppCard variant="elevated" style={styles.chartCard}>
              <Text style={styles.chartTitle}>Strength Trend</Text>
              <ChartPlaceholder icon="trending-up-outline" />
            </AppCard>
          </View>
        </TabScreenContainer>
      </View>
    </GradientBackground>
  );
}
