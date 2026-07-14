import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { AppInput } from "../components/AppInput";
import { coachMock } from "../data/mocks/coach";
import { colors, radius, shadows, spacing, typography } from "../theme/theme";

export function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");

  return (
    <View style={styles.screen}>
      <AppHeader title="Coach" subtitle="Your AI fitness coach" />
      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {coachMock.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubbleRow, msg.role === "user" && styles.bubbleRowUser]}
          >
            <View
              style={[
                styles.bubble,
                msg.role === "user" ? styles.bubbleUser : styles.bubbleCoach,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === "user" && styles.bubbleTextUser,
                ]}
              >
                {msg.content}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  msg.role === "user" && styles.timestampUser,
                ]}
              >
                {msg.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.inputWrapper}>
          <AppInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask Coach..."
            style={styles.input}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          style={[styles.sendButton, !message && styles.sendButtonDisabled]}
          onPress={() => setMessage("")}
          disabled={!message}
        >
          <Ionicons name="send" size={20} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  bubbleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleCoach: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: spacing.xs,
    ...shadows.card,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.surface,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  timestampUser: {
    color: "rgba(255,255,255,0.7)",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    ...shadows.elevated,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
