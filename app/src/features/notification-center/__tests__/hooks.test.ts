import { renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  emptyMockNotificationCenterService,
  mockNotificationCenterService,
} from "../providers/MockNotificationCenterService";
import {
  useNotifications,
  useReminder,
  useNotificationSettings,
  useNotificationStatistics,
} from "../hooks";
import { NotificationCenterViewModel } from "../viewmodels";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

describe("notification-center hooks", () => {
  beforeEach(() => {
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });
  it("useNotifications loads notifications", async () => {
    const { result } = renderHook(() => useNotifications({ service: mockNotificationCenterService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.notifications.length).toBeGreaterThan(0);
  });

  it("useNotifications exposes empty state", async () => {
    const { result } = renderHook(() => useNotifications({ service: emptyMockNotificationCenterService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useReminder projects reminders from the view model", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    const { result } = renderHook(() => useReminder({ viewModel }));
    expect(result.current.reminders.length).toBeGreaterThan(0);
  });

  it("useNotificationSettings projects settings", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    const { result } = renderHook(() => useNotificationSettings({ viewModel }));
    expect(result.current.settings).not.toBeNull();
    expect(result.current.settings?.workoutReminders).toBe(true);
  });

  it("useNotificationStatistics projects statistics", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    const { result } = renderHook(() => useNotificationStatistics({ viewModel }));
    expect(result.current.statistics).not.toBeNull();
    expect(result.current.statistics?.totalNotifications).toBeGreaterThanOrEqual(0);
  });
});
