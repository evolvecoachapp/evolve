import { triggerHaptic } from "../haptics/triggerHaptic";
import { StyleSheet, View } from "react-native";
import { AppCard } from "../components/AppCard";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { SettingsHeader } from "../components/SettingsHeader";
import { SettingsRow } from "../features/profile/components";
import { useTheme } from "../theme/ThemeContext";
import { THEME_PREFERENCE_OPTIONS, type ThemePreference } from "../theme/themePreference";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function ThemeScreen() {
  const { preference, setPreference } = useTheme();

  const styles = useThemedStyles(({ colors }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      cardContent: {
        paddingHorizontal: spacing.cardPadding,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
      },
    }),
  );

  const handleSelect = (value: ThemePreference) => {
    if (value !== preference) {
      triggerHaptic("selection");
    }
    void setPreference(value);
  };

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Theme" />
        <ScreenContainer gradient={false} withHeader={false} style={styles.screen}>
          <View>
            <SectionTitle title="Choose theme" />
            <AppCard variant="elevated" padding="none">
              <View style={styles.cardContent}>
                {THEME_PREFERENCE_OPTIONS.map((option, index) => (
                  <View key={option.value}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <SettingsRow
                      label={option.label}
                      description={option.description}
                      selected={preference === option.value}
                      onPress={() => handleSelect(option.value)}
                    />
                  </View>
                ))}
              </View>
            </AppCard>
          </View>
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
