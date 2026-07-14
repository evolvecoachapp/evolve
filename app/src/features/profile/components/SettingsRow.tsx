import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface SettingsRowProps {
  label: string;
  value?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showChevron?: boolean;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SettingsRow({
  label,
  value,
  description,
  icon,
  showChevron = false,
  selected = false,
  onPress,
  style,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        gap: spacing.md,
      },
      iconWrap: {
        width: spacing["2xl"],
        height: spacing["2xl"],
        borderRadius: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.overlayStrong,
      },
      textBlock: {
        flex: 1,
        gap: spacing.xs / 2,
      },
      label: {
        ...typography.bodyMedium,
      },
      description: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      value: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      selected: {
        color: colors.pulse,
        fontWeight: "600",
      },
    }),
  );

  const content = (
    <>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={spacing.icon.sm} color={colors.inkSecondary} />
        </View>
      ) : null}
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, selected && styles.selected]}>{value}</Text> : null}
      {selected ? (
        <Ionicons name="checkmark-circle" size={spacing.icon.md} color={colors.pulse} />
      ) : null}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={spacing.icon.sm} color={colors.inkMuted} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }, style]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}
