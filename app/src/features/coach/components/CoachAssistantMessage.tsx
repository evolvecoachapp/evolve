import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface CoachAssistantMessageProps {
  content: string;
  timestamp: string;
}

const avatarSize = coachLayout.assistantAvatarSize;

export function CoachAssistantMessage({ content, timestamp }: CoachAssistantMessageProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        maxWidth: coachLayout.messageMaxWidth,
        alignSelf: "flex-start",
      },
      avatarColumn: {
        paddingBottom: spacing.xs,
      },
      avatarRing: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      },
      avatarInner: {
        width: avatarSize - spacing.xs,
        height: avatarSize - spacing.xs,
        borderRadius: (avatarSize - spacing.xs) / 2,
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
      },
      messageColumn: {
        flex: 1,
        minWidth: 0,
      },
      card: {
        marginBottom: 0,
        borderBottomLeftRadius: coachLayout.bubbleTailRadius,
        borderTopLeftRadius: coachLayout.assistantBubbleRadius,
        borderTopRightRadius: coachLayout.assistantBubbleRadius,
        borderBottomRightRadius: coachLayout.assistantBubbleRadius,
      },
      content: {
        ...typography.bodyRelaxed,
        color: colors.ink,
      },
      timestamp: {
        ...typography.micro,
        color: colors.inkMuted,
        marginTop: spacing.sm,
        alignSelf: "flex-start",
      },
    }),
  );

  return (
    <View style={styles.row}>
      <View style={styles.avatarColumn}>
        <LinearGradient
          colors={[colors.pulse, colors.ink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            <Ionicons name="sparkles" size={spacing.icon.xs} color={colors.textOnInk} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.messageColumn}>
        <AppCard variant="glass" glow padding="compact" style={styles.card}>
          <Text style={styles.content}>{content}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </AppCard>
      </View>
    </View>
  );
}
