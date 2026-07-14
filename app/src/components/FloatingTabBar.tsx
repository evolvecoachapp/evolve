import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { spacing, tabBarMetrics } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, TabIconName> = {
  index: "home-outline",
  workout: "barbell-outline",
  nutrition: "nutrition-outline",
  coach: "chatbubble-ellipses-outline",
  progress: "trending-up-outline",
  profile: "person-outline",
};

/** Nearly-opaque floating chrome — content behind should be barely visible. */
const FLOATING_GLASS = {
  light: {
    base: "rgba(255,255,255,0.94)",
    frost: "rgba(255,255,255,0.55)",
    tint: "rgba(247,246,244,0.45)",
    border: "rgba(12,12,14,0.14)",
  },
  dark: {
    base: "rgba(30,30,34,0.96)",
    frost: "rgba(255,255,255,0.08)",
    tint: "rgba(21,21,24,0.5)",
    border: "rgba(250,250,250,0.16)",
  },
} as const;

interface TabIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  emphasized?: boolean;
}

function TabIcon({ name, color, focused, emphasized = false }: TabIconProps) {
  const styles = useThemedStyles(({ colors, radius }) =>
    StyleSheet.create({
      iconSlot: {
        width: tabBarMetrics.coachIconWrap,
        height: tabBarMetrics.coachIconWrap,
        alignItems: "center",
        justifyContent: "center",
      },
      coachIconWrap: {
        width: tabBarMetrics.coachIconWrap,
        height: tabBarMetrics.coachIconWrap,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.pulseMuted,
      },
    }),
  );

  const iconName = focused ? (name.replace("-outline", "") as TabIconName) : name;
  const iconSize = focused ? spacing.icon.tabFocused : spacing.icon.tab;

  if (emphasized) {
    return (
      <View style={styles.coachIconWrap}>
        <Ionicons name={iconName} size={iconSize} color={color} />
      </View>
    );
  }

  return (
    <View style={styles.iconSlot}>
      <Ionicons name={iconName} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  pillOuter: {
    marginHorizontal: tabBarMetrics.horizontalInset,
    pointerEvents: "auto",
    ...Platform.select({
      ios: {
        shadowColor: "#0C0C0E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      android: {
        elevation: 14,
      },
      default: {},
    }),
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  label: {
    textAlign: "center",
  },
});

/** Premium floating pill tab bar — nearly-opaque glass surface, safe-area anchored. */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.sm);
  const { colors, mode } = useTheme();
  const glass = FLOATING_GLASS[mode];

  const pillStyles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      pill: {
        flexDirection: "row",
        alignItems: "stretch",
        height: tabBarMetrics.height,
        borderRadius: radius.full,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: glass.border,
        backgroundColor: glass.base,
      },
      frostOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: glass.frost,
      },
      tintOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: glass.tint,
      },
      hairline: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: glass.border,
      },
      row: {
        flex: 1,
        flexDirection: "row",
        alignItems: "stretch",
      },
      labelText: {
        ...typography.micro,
        marginTop: spacing.xs,
      },
      labelActive: {
        color: colors.pulse,
      },
      labelInactive: {
        color: colors.inkMuted,
      },
    }),
  );

  return (
    <View style={[styles.root, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.pillOuter}>
        <View style={pillStyles.pill}>
          <View style={pillStyles.frostOverlay} pointerEvents="none" />
          <View style={pillStyles.tintOverlay} pointerEvents="none" />
          <View style={pillStyles.hairline} pointerEvents="none" />
          <View style={pillStyles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              const isFocused = state.index === index;
              const color = isFocused ? colors.pulse : colors.inkMuted;
              const emphasized = route.name === "coach";
              const iconName = TAB_ICONS[route.name] ?? "ellipse-outline";

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.item}
                >
                  <TabIcon
                    name={iconName}
                    color={color}
                    focused={isFocused}
                    emphasized={emphasized}
                  />
                  <Text
                    style={[
                      pillStyles.labelText,
                      styles.label,
                      isFocused ? pillStyles.labelActive : pillStyles.labelInactive,
                    ]}
                    numberOfLines={1}
                  >
                    {typeof label === "string" ? label : route.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
