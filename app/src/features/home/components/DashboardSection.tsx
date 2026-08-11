import type { ReactNode } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering, useReduceMotion } from "../../../animation";
import { SectionTitle } from "../../../components/SectionTitle";
import { motion } from "../../../theme/motion";

interface DashboardSectionProps {
  readonly title: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly children: ReactNode;
  /** Stagger position among sibling sections — drives entrance delay. */
  readonly index?: number;
}

/** Section shell for Home dashboard cards — presentation only. */
export function DashboardSection({
  title,
  actionLabel,
  onAction,
  children,
  index = 0,
}: DashboardSectionProps) {
  const reduceMotion = useReduceMotion();

  return (
    <Animated.View entering={heroEntering(index * motion.enter.staggerDelay, reduceMotion)}>
      <View>
        <SectionTitle
          title={title}
          actionLabel={actionLabel}
          onAction={onAction}
        />
        {children}
      </View>
    </Animated.View>
  );
}
