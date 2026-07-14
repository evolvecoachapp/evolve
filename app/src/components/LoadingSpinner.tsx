import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

export function LoadingSpinner({ size = "large", color }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  }));

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color ?? colors.primary} />
    </View>
  );
}
