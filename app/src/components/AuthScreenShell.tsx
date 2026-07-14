import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "./GradientBackground";
import { spacing } from "../theme/theme";

interface AuthScreenShellProps {
  children: React.ReactNode;
}

/** Scrollable auth layout with keyboard avoidance and safe-area padding. */
export function AuthScreenShell({ children }: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground variant="canvas">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? spacing.sm : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing["3xl"],
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
