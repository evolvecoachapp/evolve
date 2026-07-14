import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppCard } from "../components/AppCard";
import { Chip } from "../components/Chip";
import { ChartPlaceholder } from "../components/ChartPlaceholder";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { DashboardHero } from "../features/dashboard/components";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../auth/useAuth";
import { useHome } from "../features/home/hooks";
import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dashboard, loading } = useHome();
  const firstName = user?.first_name ?? user?.username ?? "there";

  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      workoutHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        marginBottom: spacing.md,
      },
      workoutIcon: {
        width: spacing.avatar.lg,
        height: spacing.avatar.lg,
        borderRadius: radius.md,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      workoutMeta: {
        flex: 1,
        gap: spacing.xs,
      },
      cardTitle: {
        ...typography.title3,
      },
      cardSubtitle: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      cardMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      macroGrid: {
        flexDirection: "row",
        gap: spacing.md,
      },
      recoveryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
      },
      recoveryLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        marginBottom: spacing.xs,
      },
      recoveryScore: {
        ...typography.display,
        color: colors.pulse,
      },
      recoveryTip: {
        ...typography.bodyRelaxed,
        color: colors.inkSecondary,
      },
      chartSpacing: {
        marginBottom: spacing.lg,
      },
      weeklyStats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      },
      weeklyStat: {
        alignItems: "center",
        gap: spacing.xs,
        flex: 1,
      },
      statDivider: {
        width: 1,
        height: spacing.statDividerHeight,
        backgroundColor: colors.border,
      },
      weeklyStatValue: {
        ...typography.title3,
      },
      weeklyStatLabel: {
        ...typography.caption,
        color: colors.inkMuted,
      },
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

  const { colors } = useTheme();

  const macroProgress = (current: number, target: number) =>
    Math.round((current / target) * 100);

  if (loading || !dashboard) {
    return null;
  }

  const { workoutPreview, nutritionSummary, recovery, weeklyProgress, coachSummary, streak } =
    dashboard;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
      >
        <DashboardHero
          firstName={firstName}
          recoveryScore={recovery.score}
          streakDays={streak.days}
          workoutsCompleted={weeklyProgress.workoutsCompleted}
          workoutsTarget={weeklyProgress.workoutsTarget}
        />

        <View>
          <SectionTitle title="Today's Workout" actionLabel="View" onAction={() => router.push("/(app)/(tabs)/workout")} />
          <AppCard variant="floating" glow onPress={() => router.push("/(app)/(tabs)/workout")}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutIcon}>
                <Ionicons name="barbell-outline" size={spacing.icon.lg} color={colors.pulse} />
              </View>
              <View style={styles.workoutMeta}>
                <Text style={styles.cardTitle}>{workoutPreview.name}</Text>
                <Text style={styles.cardSubtitle}>{workoutPreview.muscleGroups}</Text>
              </View>
            </View>
            <View style={styles.cardMetaRow}>
              <Chip label={`${workoutPreview.durationMinutes} min`} icon="time-outline" variant="neutral" size="sm" />
              <Chip label="Ready" variant="accent" size="sm" />
            </View>
          </AppCard>
        </View>

        <View>
          <SectionTitle title="Nutrition" actionLabel="See all" onAction={() => router.push("/(app)/(tabs)/nutrition")} />
          <AppCard variant="elevated">
            <View style={styles.macroGrid}>
              <StatCard
                label="Calories"
                value={nutritionSummary.calories.current}
                unit={`/ ${nutritionSummary.calories.target}`}
                icon="flame-outline"
                progress={macroProgress(nutritionSummary.calories.current, nutritionSummary.calories.target)}
              />
              <StatCard
                label="Protein"
                value={`${nutritionSummary.protein.current}g`}
                unit={`/ ${nutritionSummary.protein.target}g`}
                icon="nutrition-outline"
                progress={macroProgress(nutritionSummary.protein.current, nutritionSummary.protein.target)}
              />
            </View>
            <View style={[styles.macroGrid, { marginTop: spacing.md }]}>
              <StatCard
                label="Carbs"
                value={`${nutritionSummary.carbs.current}g`}
                unit={`/ ${nutritionSummary.carbs.target}g`}
                icon="leaf-outline"
                progress={macroProgress(nutritionSummary.carbs.current, nutritionSummary.carbs.target)}
              />
              <StatCard
                label="Fat"
                value={`${nutritionSummary.fat.current}g`}
                unit={`/ ${nutritionSummary.fat.target}g`}
                icon="water-outline"
                progress={macroProgress(nutritionSummary.fat.current, nutritionSummary.fat.target)}
              />
            </View>
          </AppCard>
        </View>

        <View>
          <SectionTitle title="Recovery" />
          <AppCard variant="accent" glow>
            <View style={styles.recoveryHeader}>
              <View>
                <Text style={styles.recoveryLabel}>Recovery score</Text>
                <Text style={styles.recoveryScore}>{recovery.score}%</Text>
              </View>
              <Chip label={recovery.status} variant="accent" size="md" />
            </View>
            <Text style={styles.recoveryTip}>{recovery.tip}</Text>
          </AppCard>
        </View>

        <View>
          <SectionTitle title="Weekly Progress" actionLabel="Details" onAction={() => router.push("/(app)/(tabs)/progress")} />
          <AppCard variant="elevated">
            <ChartPlaceholder icon="bar-chart-outline" height={spacing.chart.sm} style={styles.chartSpacing} />
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>
                  {weeklyProgress.workoutsCompleted}/{weeklyProgress.workoutsTarget}
                </Text>
                <Text style={styles.weeklyStatLabel}>Workouts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>{weeklyProgress.avgCalories}</Text>
                <Text style={styles.weeklyStatLabel}>Avg kcal</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>{streak.days}</Text>
                <Text style={styles.weeklyStatLabel}>Day streak</Text>
              </View>
            </View>
          </AppCard>
        </View>

        <View>
          <SectionTitle title="Coach Suggestion" />
          <AppCard variant="glass" onPress={() => router.push("/(app)/(tabs)/coach")}>
            <View style={styles.coachQuote}>
              <View style={styles.coachIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={spacing.icon.md} color={colors.pulse} />
              </View>
              <Text style={styles.coachMessage}>{coachSummary.message}</Text>
            </View>
            <Text style={styles.coachLink}>Ask Coach →</Text>
          </AppCard>
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
