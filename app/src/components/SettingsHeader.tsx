import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface SettingsHeaderProps {
  title: string;
}

/** Shared back-navigation header for settings stack screens. */
export function SettingsHeader({ title }: SettingsHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.lg,
        gap: spacing.md,
      },
      backButton: {
        width: spacing["2xl"],
        height: spacing["2xl"],
        borderRadius: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.overlayStrong,
      },
      title: {
        ...typography.title1,
        flex: 1,
      },
    }),
  );

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="chevron-back" size={spacing.icon.md} color={colors.ink} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
