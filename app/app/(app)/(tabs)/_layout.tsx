import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../src/theme/ThemeContext";
import { spacing, tabBarMetrics } from "../../../src/theme/theme";
import { useThemedStyles } from "../../../src/theme/useThemedStyles";

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  emphasized?: boolean;
}

function TabIcon({ name, color, focused, emphasized = false }: TabIconProps) {
  const styles = useThemedStyles(({ colors, radius }) =>
    StyleSheet.create({
      coachIconWrap: {
        width: tabBarMetrics.coachIconWrap,
        height: tabBarMetrics.coachIconWrap,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.pulseMuted,
      },
      coachIconWrapActive: {
        backgroundColor: colors.pulseMuted,
      },
    }),
  );

  const iconName = focused ? (name.replace("-outline", "") as TabIconName) : name;

  if (emphasized) {
    return (
      <View style={[styles.coachIconWrap, focused && styles.coachIconWrapActive]}>
        <Ionicons name={iconName} size={focused ? spacing.icon.tabFocused : spacing.icon.tab} color={color} />
      </View>
    );
  }

  return <Ionicons name={iconName} size={spacing.icon.tab} color={color} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows } = useTheme();
  const bottomOffset = Math.max(insets.bottom, spacing.sm);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pulse,
        tabBarInactiveTintColor: colors.inkMuted,
        sceneStyle: {
          flex: 1,
        },
        tabBarStyle: {
          position: "absolute",
          left: tabBarMetrics.horizontalInset,
          right: tabBarMetrics.horizontalInset,
          bottom: bottomOffset,
          height: tabBarMetrics.height,
          backgroundColor: colors.glass,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.full,
          paddingTop: spacing.xs,
          ...shadows.floating,
        },
        tabBarLabelStyle: {
          ...typography.micro,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barbell-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="nutrition-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: "Coach",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubble-ellipses-outline" color={color} focused={focused} emphasized />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="trending-up-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
