import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../src/components/AppButton";
import { EmptyState } from "../src/components/EmptyState";
import { GradientBackground } from "../src/components/GradientBackground";
import { spacing } from "../src/theme/theme";

/**
 * Branded fallback for unmatched routes — replaces Expo Router's default screen.
 */
export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground variant="canvas">
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + spacing["3xl"],
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
        >
          <EmptyState
            icon="map-outline"
            title="Page not found"
            subtitle="This screen doesn't exist or may have been moved."
          />
          <AppButton
            label="Go to Home"
            size="lg"
            onPress={() => router.replace("/")}
          />
        </View>
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xl,
  },
});
