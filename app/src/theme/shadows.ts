import { Platform, type ViewStyle } from "react-native";

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#111827",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  })!,
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#111827",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  })!,
} as const;
