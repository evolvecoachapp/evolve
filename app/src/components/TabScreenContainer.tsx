import { forwardRef } from "react";
import type { ScrollView } from "react-native";
import { ScreenContainer, type ScreenContainerProps } from "./ScreenContainer";
import { useTabSceneBottomReserve } from "../theme/useTabLayout";

type TabScreenContainerProps = Omit<
  ScreenContainerProps,
  "tabBarReserve" | "reserveBottomInset"
>;

/** Scroll shell for tab screens — reserves space for the floating tab bar. */
export const TabScreenContainer = forwardRef<ScrollView, TabScreenContainerProps>(
  function TabScreenContainer({ style, ...props }, ref) {
    const tabBarReserve = useTabSceneBottomReserve();

    return (
      <ScreenContainer
        ref={ref}
        {...props}
        tabBarReserve={tabBarReserve}
        reserveBottomInset={false}
        style={[style, { flex: 1 }]}
      />
    );
  },
);
