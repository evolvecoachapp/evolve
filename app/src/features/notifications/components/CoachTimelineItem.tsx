import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing, radius } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface Props {
  id: string;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  relativeTime: string;
  priorityColor: string;
  read: boolean;
  onPress?: (id: string) => void;
}

export function CoachTimelineItem({
  id,
  title,
  message,
  icon,
  relativeTime,
  priorityColor,
  read,
  onPress,
}: Props) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    left: {
      width: 8,
      height: 48,
      borderRadius: radius.full,
      backgroundColor: priorityColor,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.overlay,
    },
    title: {
      ...typography.bodyMedium,
      color: colors.ink,
    },
    message: {
      ...typography.caption,
      color: colors.inkMuted,
    },
    meta: {
      ...typography.caption,
      color: colors.inkMuted,
      alignSelf: "flex-start",
    },
    content: {
      flex: 1,
      gap: spacing.xs,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.pulse,
    },
  }));

  const handlePress = () => {
    onPress?.(id);
  };

  return (
    <AppCard onPress={handlePress} variant="surface">
      <View style={styles.row}>
        <View style={styles.left} />
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.meta}>{relativeTime}</Text>
          {!read ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </AppCard>
  );
}
