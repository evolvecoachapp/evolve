import type { ReactNode } from "react";
import { View } from "react-native";
import { SectionTitle } from "../../../components/SectionTitle";

interface DashboardSectionProps {
  readonly title: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly children: ReactNode;
}

/** Section shell for Home dashboard cards — presentation only. */
export function DashboardSection({
  title,
  actionLabel,
  onAction,
  children,
}: DashboardSectionProps) {
  return (
    <View>
      <SectionTitle
        title={title}
        actionLabel={actionLabel}
        onAction={onAction}
      />
      {children}
    </View>
  );
}
