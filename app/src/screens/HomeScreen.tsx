import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { useAuth } from "../auth/useAuth";

/**
 * Placeholder authenticated shell — proves the full scaffold → API client →
 * auth flow loop end to end. Coach chat, today's workout, meal plan, and
 * progress dashboard screens are Sprint 5.2/5.3, not this sprint.
 */
export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Hi, {user?.first_name ?? user?.username}.</Text>
        <Text style={styles.subtitle}>
          Your Coach, workouts, meals, and progress will live here soon.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button label="Log out" variant="secondary" onPress={() => logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 96,
    paddingBottom: 48,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 12,
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 0,
  },
});
