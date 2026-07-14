import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme/theme";

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  withHeader?: boolean;
}

export function ScreenContainer({
  children,
  withHeader = true,
  contentContainerStyle,
  ...scrollProps
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + spacing.xl,
          paddingTop: withHeader ? 0 : insets.top + spacing.md,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.lg,
  },
});
