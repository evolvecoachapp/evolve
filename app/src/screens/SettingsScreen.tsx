import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppCard } from "../components/AppCard";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { SettingsHeader } from "../components/SettingsHeader";
import { SettingsRow } from "../features/profile/components";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function SettingsScreen() {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      cardContent: {
        paddingHorizontal: spacing.cardPadding,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Settings" />
        <ScreenContainer gradient={false} withHeader={false} style={styles.screen}>
          <View>
            <SectionTitle title="Preferences" />
            <AppCard variant="elevated" padding="none">
              <View style={styles.cardContent}>
                <SettingsRow
                  label="Appearance"
                  description="Theme and visual style"
                  icon="color-palette-outline"
                  showChevron
                  onPress={() => router.push("/(app)/settings/appearance")}
                />
              </View>
            </AppCard>
          </View>
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
