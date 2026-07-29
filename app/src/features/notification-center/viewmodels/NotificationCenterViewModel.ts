import {
  createNewReminder,
  deleteReminder,
  dismissNotification,
  loadNotifications,
  markNotificationRead,
  refreshNotifications,
  updateNotificationSettings,
  updateReminder,
} from "../application";
import type { NotificationCenterData } from "../mappers";
import {
  createNotificationErrorState,
  createNotificationLoadingState,
  createNotificationSavingState,
  NotificationLoadingStatuses,
  NotificationSavingStatuses,
  type NotificationErrorState,
  type NotificationItem,
  type NotificationLoadingState,
  type NotificationSavingState,
  type NotificationSettings,
  type NotificationStatistics,
  type Reminder,
  type CoachNotification,
} from "../models";
import {
  notificationCenterService,
  NotificationCenterError,
  type NotificationCenterService,
  type NotificationSettingsDto,
  type ReminderDto,
} from "../services";

export interface NotificationCenterViewModelDeps {
  readonly service?: NotificationCenterService;
}

export class NotificationCenterViewModel {
  private readonly service: NotificationCenterService;
  private readonly listeners = new Set<() => void>();
  private _notifications: readonly NotificationItem[] = Object.freeze([]);
  private _reminders: readonly Reminder[] = Object.freeze([]);
  private _coachNotifications: readonly CoachNotification[] = Object.freeze([]);
  private _settings: NotificationSettings | null = null;
  private _statistics: NotificationStatistics | null = null;
  private _loading: NotificationLoadingState = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
  private _saving: NotificationSavingState = createNotificationSavingState(NotificationSavingStatuses.IDLE);
  private _error: NotificationErrorState | null = null;

  constructor(deps: NotificationCenterViewModelDeps = {}) {
    this.service = deps.service ?? notificationCenterService;
  }

  get notifications(): readonly NotificationItem[] { return this._notifications; }
  get reminders(): readonly Reminder[] { return this._reminders; }
  get coachNotifications(): readonly CoachNotification[] { return this._coachNotifications; }
  get settings(): NotificationSettings | null { return this._settings; }
  get statistics(): NotificationStatistics | null { return this._statistics; }
  get loading(): NotificationLoadingState { return this._loading; }
  get saving(): NotificationSavingState { return this._saving; }
  get error(): NotificationErrorState | null { return this._error; }
  get isEmpty(): boolean {
    return this._notifications.length === 0 &&
      this._reminders.length === 0 &&
      this._coachNotifications.length === 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadNotifications(): Promise<void> {
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await loadNotifications({ service: this.service }));
    } catch (caught) {
      this._notifications = Object.freeze([]);
      this._reminders = Object.freeze([]);
      this._coachNotifications = Object.freeze([]);
      this._settings = null;
      this._statistics = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await refreshNotifications({ service: this.service }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
    this.notify();
  }

  async dismiss(notificationId: string): Promise<void> {
    await this.save(() => dismissNotification({ service: this.service, notificationId }));
  }

  async markRead(notificationId: string): Promise<void> {
    await this.save(() => markNotificationRead({ service: this.service, notificationId }));
  }

  async addReminder(reminder: ReminderDto): Promise<void> {
    await this.save(() => createNewReminder({ service: this.service, reminder }));
  }

  async editReminder(reminder: ReminderDto): Promise<void> {
    await this.save(() => updateReminder({ service: this.service, reminder }));
  }

  async removeReminder(reminderId: string): Promise<void> {
    await this.save(() => deleteReminder({ service: this.service, reminderId }));
  }

  async updateSettings(settings: NotificationSettingsDto): Promise<void> {
    await this.save(() => updateNotificationSettings({ service: this.service, settings }));
  }

  private applyData(data: NotificationCenterData): void {
    this._notifications = data.notifications;
    this._reminders = data.reminders;
    this._coachNotifications = data.coachNotifications;
    this._settings = data.settings;
    this._statistics = data.statistics;
  }

  private async save(action: () => Promise<NotificationCenterData>): Promise<void> {
    this._saving = createNotificationSavingState(NotificationSavingStatuses.SAVING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await action());
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._saving = createNotificationSavingState(NotificationSavingStatuses.IDLE);
    this.notify();
  }

  private toErrorState(caught: unknown): NotificationErrorState {
    if (caught instanceof NotificationCenterError) {
      return createNotificationErrorState(caught.message, "notification_center_service_error", true);
    }
    if (caught instanceof Error) {
      return createNotificationErrorState(caught.message);
    }
    return createNotificationErrorState("Failed to load Notification Center.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
