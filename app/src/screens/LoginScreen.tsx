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

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
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
      await login(email.trim(), password);
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
        <Text style={styles.overline}>Sign in</Text>
        <Text style={styles.title}>Welcome back</Text>
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
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          placeholder="••••••••"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          label="Log in"
          size="lg"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!email || !password}
        />
      </AppCard>
      <AppButton
        label="Create an account instead"
        variant="secondary"
        onPress={() => router.push("/(auth)/register")}
      />
    </AuthScreenShell>
  );
}
