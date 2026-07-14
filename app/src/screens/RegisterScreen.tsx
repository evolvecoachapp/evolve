import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AppInput } from "../components/AppInput";
import { AuthScreenShell } from "../components/AuthScreenShell";
import { useAuth } from "../auth/useAuth";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

/**
 * Collects only `UserCreate`'s required fields (email, username, password).
 * The optional profile fields (height, weight, activity level, goal) are
 * intentionally not collected here — a full profile-completion step is
 * deferred to whichever later mobile sprint first needs them (e.g. the
 * Nutrition Engine screens).
 */
export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      header: {
        gap: spacing.xs,
        marginBottom: spacing.sm,
      },
      overline: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.title1,
      },
      formCard: {
        gap: spacing.sm,
      },
      error: {
        ...typography.callout,
        color: colors.critical,
        marginBottom: spacing.xs,
      },
    }),
  );

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
    <AuthScreenShell>
      <View style={styles.header}>
        <Text style={styles.overline}>Get started</Text>
        <Text style={styles.title}>Create your account</Text>
      </View>
      <AppCard variant="floating" style={styles.formCard}>
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
          size="lg"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!email || !username || !password}
        />
      </AppCard>
      <AppButton
        label="I already have an account"
        variant="secondary"
        onPress={() => router.push("/(auth)/login")}
      />
    </AuthScreenShell>
  );
}
