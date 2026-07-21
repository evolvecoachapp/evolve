import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface AnalyticsSectionProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Section wrapper — title + body, matching WorkoutScreen spacing rhythm. */
export function AnalyticsSection({
  title,
  children,
  style,
  testID,
}: AnalyticsSectionProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
    }),
  );

  return (
    <View style={[styles.section, style]} testID={testID}>
      <SectionTitle title={title} />
      {children}
    </View>
  );
}
