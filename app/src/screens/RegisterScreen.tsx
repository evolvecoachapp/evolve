import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { useAuth } from "../auth/useAuth";

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

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email: email.trim(), username: username.trim(), password });
      router.replace("/(app)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />
      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        textContentType="username"
        placeholder="yourname"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        placeholder="At least 8 characters"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Create account"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!email || !username || !password}
      />
      <Button
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
    padding: 24,
    paddingTop: 96,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 4,
  },
});
