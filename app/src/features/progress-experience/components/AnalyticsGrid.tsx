import type { ReactNode } from "react";
import { View } from "react-native";
import { spacing } from "../../../theme/theme";

export interface AnalyticsGridProps { readonly children: ReactNode; }

export function AnalyticsGrid({ children }: AnalyticsGridProps) {
  return <View style={{ gap: spacing.lg }}>{children}</View>;
}
