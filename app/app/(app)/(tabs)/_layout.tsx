import { Tabs } from "expo-router";
import { FloatingTabBar } from "../../../src/components/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          flex: 1,
        },
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="workout" options={{ title: "Workout" }} />
      <Tabs.Screen name="nutrition" options={{ title: "Nutrition" }} />
      <Tabs.Screen name="coach" options={{ title: "Coach" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
