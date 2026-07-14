import { ScreenContainer, type ScreenContainerProps } from "./ScreenContainer";
import { useTabSceneBottomReserve } from "../theme/useTabLayout";

type TabScreenContainerProps = Omit<
  ScreenContainerProps,
  "tabBarReserve" | "reserveBottomInset"
>;

/** Scroll shell for tab screens — reserves space for the floating tab bar. */
export function TabScreenContainer({
  style,
  ...props
}: TabScreenContainerProps) {
  const tabBarReserve = useTabSceneBottomReserve();

  return (
    <ScreenContainer
      {...props}
      tabBarReserve={tabBarReserve}
      reserveBottomInset={false}
      style={[style, { flex: 1 }]}
    />
  );
}
