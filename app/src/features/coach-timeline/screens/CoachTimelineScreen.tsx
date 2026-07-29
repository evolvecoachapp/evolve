import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  TimelineEmpty,
  TimelineError,
  TimelineEventCard,
  TimelineFilterCard,
  TimelineGroupHeader,
  TimelineHeader,
  TimelineLoadMoreButton,
  TimelineSearchBar,
  TimelineSectionHeader,
  TimelineSkeleton,
  TimelineStatisticsCard,
} from "../components";
import { useTimeline } from "../hooks";
import type { CoachTimelineFrameworkService } from "../services";

export interface CoachTimelineScreenProps {
  readonly service?: CoachTimelineFrameworkService;
}

export function CoachTimelineScreen({ service }: CoachTimelineScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const timeline = useTimeline({ service });

  const showContent =
    !timeline.loading.isLoading &&
    !timeline.error &&
    !timeline.isEmpty;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={timeline.loading.isRefreshing}
            onRefresh={() => void timeline.refresh()}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        <View style={{ gap: spacing.lg }}>
          {timeline.loading.isLoading && timeline.events.length === 0 ? <TimelineSkeleton /> : null}
          {timeline.error && !timeline.loading.isLoading ? (
            <TimelineError error={timeline.error} onRetry={() => void timeline.refresh()} />
          ) : null}
          {!timeline.loading.isLoading && !timeline.error && timeline.isEmpty ? <TimelineEmpty /> : null}
          {showContent ? (
            <>
              {timeline.statistics ? <TimelineHeader statistics={timeline.statistics} /> : null}
              <TimelineSearchBar query={timeline.searchQuery} />
              {timeline.filter ? <TimelineFilterCard filter={timeline.filter} /> : null}
              {timeline.statistics ? <TimelineStatisticsCard statistics={timeline.statistics} /> : null}
              {timeline.sections.map((section) => (
                <TimelineSectionHeader key={section.id} section={section} />
              ))}
              {timeline.groups.map((group) => (
                <View key={group.kind} style={{ gap: spacing.sm }}>
                  <TimelineGroupHeader group={group} />
                  {timeline.events
                    .filter((event) => event.group === group.kind)
                    .map((event) => (
                      <TimelineEventCard key={event.id} event={event} />
                    ))}
                </View>
              ))}
              {timeline.hasMore ? (
                <TimelineLoadMoreButton
                  loading={timeline.loading.isLoadingMore}
                  onPress={() => void timeline.loadMore()}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
