import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useTheme } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { resolveExerciseMedia } from "../utils/exerciseMedia";

interface ExerciseMediaPlaceholderProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  exerciseName: string;
}

/** Thumbnail area for exercise GIF/video — shows media when available, placeholder otherwise. */
export function ExerciseMediaPlaceholder({
  imageUrl,
  videoUrl,
  exerciseName,
}: ExerciseMediaPlaceholderProps) {
  const { colors } = useTheme();
  const media = resolveExerciseMedia({ exerciseName, imageUrl, videoUrl });
  const hasMedia = media.hasThumbnail;
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      container: {
        width: "100%",
        aspectRatio: 16 / 9,
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.overlayStrong,
        alignItems: "center",
        justifyContent: "center",
      },
      image: {
        width: "100%",
        height: "100%",
      },
      placeholder: {
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
      },
      placeholderText: {
        ...typography.caption,
        color: colors.inkMuted,
        textAlign: "center",
      },
      badge: {
        position: "absolute",
        bottom: spacing.sm,
        right: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceElevated,
      },
      badgeText: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
    }),
  );

  if (hasMedia && media.thumbnail) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: media.thumbnail }}
          style={styles.image}
          accessibilityLabel={`${exerciseName} demonstration`}
          resizeMode="cover"
        />
        {media.hasVideo ? (
          <View style={styles.badge}>
            <Ionicons name="play-circle-outline" size={spacing.icon.sm} color={colors.pulse} />
            <Text style={styles.badgeText}>Video</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={`${exerciseName} media placeholder`}>
      <View style={styles.placeholder}>
        <Ionicons name="barbell-outline" size={spacing.icon.lg} color={colors.inkMuted} />
        <Text style={styles.placeholderText}>{media.fallbackLabel}</Text>
      </View>
    </View>
  );
}
