import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { useAuth } from "../auth/useAuth";
import { colors, spacing, typography } from "../theme/theme";

/**
 * Collects only `UserCreate`'s required fields (email, username, password).
 * The optional profile fields (height, weight, activity level, goal) are
 * intentionally not collected here — a full profile-completion step is
 * deferred to whichever later mobile sprint first needs them (e.g. the
 * Nutrition Engine screens).
 */
export function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email: email.trim(), username: username.trim(), password });
      router.replace("/(app)/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing["3xl"] }]}>
      <Text style={styles.title}>Create your account</Text>
      <AppInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />
      <AppInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        textContentType="username"
        placeholder="yourname"
      />
      <AppInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        placeholder="At least 8 characters"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        label="Create account"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!email || !username || !password}
      />
      <AppButton
        label="I already have an account"
        variant="secondary"
        onPress={() => router.push("/(auth)/login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
});
