import { ScrollView, View } from "react-native";
import { CoachTimelineItem } from "./CoachTimelineItem";
import type { CoachNotificationViewModel } from "./CoachPresenter";
import { spacing } from "../../../theme/theme";

interface Props {
  items: CoachNotificationViewModel[];
  onItemPress?: (id: string) => void;
}

export function CoachTimeline({ items, onItemPress }: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, gap: spacing.section }}>
      <View style={{ gap: spacing.md }}>
        {items.map((it) => (
          <CoachTimelineItem
            key={it.id}
            id={it.id}
            title={it.title}
            message={it.message}
            icon={it.icon as any}
            relativeTime={it.relativeTime}
            priorityColor={it.priorityColor}
            read={it.read}
            onPress={onItemPress}
          />
        ))}
      </View>
    </ScrollView>
  );
}
