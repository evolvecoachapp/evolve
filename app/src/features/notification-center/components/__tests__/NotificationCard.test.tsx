import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { createNotificationItem, type NotificationItem } from "../../models";
import { NotificationCard } from "../NotificationCard";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

function buildNotification(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return createNotificationItem({
    id: "notif:1",
    title: "Workout ready",
    message: "Your session is ready to start.",
    category: "reminder",
    priority: "normal",
    state: "delivered",
    icon: "barbell-outline",
    createdAt: "2026-08-11T08:00:00.000Z",
    readAt: null,
    expiresAt: null,
    actions: Object.freeze([]),
    destination: null,
    ...overrides,
  });
}

function renderCard(props: Partial<Parameters<typeof NotificationCard>[0]>) {
  return render(
    <ThemeProvider>
      <NotificationCard notification={buildNotification()} {...props} />
    </ThemeProvider>,
  );
}

describe("NotificationCard", () => {
  it("invokes onPress (mark-read) when an unread notification is tapped", () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderCard({ onPress });

    fireEvent.press(getByLabelText(/Unread\. Double tap to mark as read\./));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("marks the accessibility state as selected once read, and drops the mark-read label", () => {
    const { queryByLabelText } = renderCard({
      notification: buildNotification({ readAt: "2026-08-11T09:00:00.000Z" }),
    });

    expect(queryByLabelText(/Unread/)).toBeNull();
  });

  it("invokes onDismiss without triggering the card's own onPress", () => {
    const onPress = jest.fn();
    const onDismiss = jest.fn();
    const { getByLabelText } = renderCard({ onPress, onDismiss });

    fireEvent.press(getByLabelText(/^Dismiss Workout ready$/));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
