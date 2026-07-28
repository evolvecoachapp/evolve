import { View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

/** Visual divider between Home dashboard sections — presentation only. */
export function DashboardDivider() {
  const styles = useThemedStyles(({ colors }) => ({
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
  }));

  return <View style={styles.divider} />;
}
