import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppCard } from "../components/AppCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../auth/useAuth";
import { dashboardMock } from "../data/mocks/dashboard";
import { colors, radius, spacing, typography } from "../theme/theme";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workout, nutrition, recovery, weeklyProgress, coachSuggestion } = dashboardMock;
  const firstName = user?.first_name ?? user?.username ?? "there";

  const macroProgress = (current: number, target: number) =>
    Math.round((current / target) * 100);

  return (
    <ScreenContainer
      withHeader={false}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md }}
    >
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>
          {getGreeting()}, {firstName}
        </Text>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>

      <View>
        <SectionTitle title="Today's Workout" actionLabel="View" onAction={() => router.push("/(app)/(tabs)/workout")} />
        <AppCard onPress={() => router.push("/(app)/(tabs)/workout")}>
          <Text style={styles.cardTitle}>{workout.name}</Text>
          <Text style={styles.cardSubtitle}>{workout.muscleGroups}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.cardMetaText}>{workout.durationMinutes} min</Text>
          </View>
        </AppCard>
      </View>

      <View>
        <SectionTitle title="Nutrition" actionLabel="See all" onAction={() => router.push("/(app)/(tabs)/nutrition")} />
        <AppCard>
          <View style={styles.macroGrid}>
            <StatCard
              label="Calories"
              value={nutrition.calories.current}
              unit={`/ ${nutrition.calories.target}`}
              progress={macroProgress(nutrition.calories.current, nutrition.calories.target)}
            />
            <StatCard
              label="Protein"
              value={`${nutrition.protein.current}g`}
              unit={`/ ${nutrition.protein.target}g`}
              progress={macroProgress(nutrition.protein.current, nutrition.protein.target)}
            />
          </View>
          <View style={[styles.macroGrid, { marginTop: spacing.md }]}>
            <StatCard
              label="Carbs"
              value={`${nutrition.carbs.current}g`}
              unit={`/ ${nutrition.carbs.target}g`}
              progress={macroProgress(nutrition.carbs.current, nutrition.carbs.target)}
            />
            <StatCard
              label="Fat"
              value={`${nutrition.fat.current}g`}
              unit={`/ ${nutrition.fat.target}g`}
              progress={macroProgress(nutrition.fat.current, nutrition.fat.target)}
            />
          </View>
        </AppCard>
      </View>

      <View>
        <SectionTitle title="Recovery" />
        <AppCard variant="accent">
          <View style={styles.recoveryHeader}>
            <Text style={styles.recoveryScore}>{recovery.score}%</Text>
            <View style={styles.recoveryBadge}>
              <Text style={styles.recoveryBadgeText}>{recovery.status}</Text>
            </View>
          </View>
          <Text style={styles.recoveryTip}>{recovery.tip}</Text>
        </AppCard>
      </View>

      <View>
        <SectionTitle title="Weekly Progress" actionLabel="Details" onAction={() => router.push("/(app)/(tabs)/progress")} />
        <AppCard>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={32} color={colors.textMuted} />
            <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
          </View>
          <View style={styles.weeklyStats}>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>
                {weeklyProgress.workoutsCompleted}/{weeklyProgress.workoutsTarget}
              </Text>
              <Text style={styles.weeklyStatLabel}>Workouts</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{weeklyProgress.avgCalories}</Text>
              <Text style={styles.weeklyStatLabel}>Avg kcal</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{weeklyProgress.streakDays}</Text>
              <Text style={styles.weeklyStatLabel}>Day streak</Text>
            </View>
          </View>
        </AppCard>
      </View>

      <View>
        <SectionTitle title="Coach Suggestion" />
        <AppCard onPress={() => router.push("/(app)/(tabs)/coach")}>
          <View style={styles.coachQuote}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
            <Text style={styles.coachMessage}>{coachSuggestion.message}</Text>
          </View>
          <Text style={styles.coachLink}>Ask Coach →</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greetingBlock: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.display,
  },
  date: {
    ...typography.bodySmall,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cardMetaText: {
    ...typography.caption,
  },
  macroGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  recoveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  recoveryScore: {
    ...typography.display,
    fontSize: 36,
    color: colors.accent,
  },
  recoveryBadge: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  recoveryBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "600",
  },
  recoveryTip: {
    ...typography.bodySmall,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chartPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  weeklyStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weeklyStat: {
    alignItems: "center",
    gap: spacing.xs,
  },
  weeklyStatValue: {
    ...typography.h3,
  },
  weeklyStatLabel: {
    ...typography.caption,
  },
  coachQuote: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  coachMessage: {
    ...typography.bodySmall,
    flex: 1,
    lineHeight: 20,
  },
  coachLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
});
