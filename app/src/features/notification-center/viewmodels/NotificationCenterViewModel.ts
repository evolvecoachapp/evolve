import {
  createNewReminder,
  deleteReminder,
  dismissNotification,
  dismissRuntimeNotification,
  createRuntimeReminder,
  deleteRuntimeReminder,
  loadHydratedNotificationExperience,
  loadNotifications,
  markNotificationRead,
  markRuntimeNotificationRead,
  refreshNotifications,
  updateNotificationSettings,
  updateReminder,
  updateRuntimeNotificationSettings,
  updateRuntimeReminder,
} from "../application";
import { NotificationRuntimeError } from "../application/NotificationRuntimeError";
import { persistNotificationRuntimeMutation } from "../../../runtime/domain-persistence/application/persistNotificationRuntimeMutation";
import { readPersistedNotificationSessionOverlay } from "../../../runtime/domain-persistence/application/persistNotificationRuntimeMutation";
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
import {
  EMPTY_NOTIFICATION_RUNTIME_SESSION,
  type NotificationRuntimeSessionOverlay,
} from "../types/notificationRuntimeSession";

export interface NotificationCenterViewModelDeps {
  readonly service?: NotificationCenterService;
  readonly athleteId?: string;
  readonly now?: () => Date;
}

/**
 * Notification Center ViewModel — application orchestration only.
 * Production path applies hydrated Unified Workspace via applyHydratedNotifications().
 */
export class NotificationCenterViewModel {
  private readonly service: NotificationCenterService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();
  private _notifications: readonly NotificationItem[] = Object.freeze([]);
  private _reminders: readonly Reminder[] = Object.freeze([]);
  private _coachNotifications: readonly CoachNotification[] = Object.freeze([]);
  private _settings: NotificationSettings | null = null;
  private _statistics: NotificationStatistics | null = null;
  private _loading: NotificationLoadingState = createNotificationLoadingState(
    NotificationLoadingStatuses.IDLE,
  );
  private _saving: NotificationSavingState = createNotificationSavingState(
    NotificationSavingStatuses.IDLE,
  );
  private _error: NotificationErrorState | null = null;
  private _overlay: NotificationRuntimeSessionOverlay = EMPTY_NOTIFICATION_RUNTIME_SESSION;

  constructor(deps: NotificationCenterViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    if (!this.service) {
      this._loading = createNotificationLoadingState(NotificationLoadingStatuses.LOADING);
    }
  }

  /** True when the ViewModel is driven by hydrated workspace instead of NotificationCenterService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
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
    if (!this.service) {
      return;
    }

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

  /** Applies Notification Center projected from hydrated Unified Workspace output. */
  applyHydratedNotifications(data: NotificationCenterData): void {
    this.applyData(data);
    if (this.isRuntimeDriven && this.athleteId) {
      const persisted = readPersistedNotificationSessionOverlay(this.athleteId);
      if (persisted) {
        this._overlay = persisted;
      }
    }
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  refreshFromHydratedNotifications(data: NotificationCenterData | null): void {
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (data) {
      this.applyHydratedNotifications(data);
      return;
    }

    this._notifications = Object.freeze([]);
    this._reminders = Object.freeze([]);
    this._coachNotifications = Object.freeze([]);
    this._settings = null;
    this._statistics = null;
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
    this._error = createNotificationErrorState(
      "Notification runtime unavailable.",
      "notification_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated notification output to the UI. */
  applyNotificationFailure(message: string): void {
    this._notifications = Object.freeze([]);
    this._reminders = Object.freeze([]);
    this._coachNotifications = Object.freeze([]);
    this._settings = null;
    this._statistics = null;
    this._loading = createNotificationLoadingState(NotificationLoadingStatuses.IDLE);
    this._error = createNotificationErrorState(message, "notification_runtime_unavailable");
    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      await this.reloadHydratedNotifications(NotificationLoadingStatuses.REFRESHING);
      return;
    }

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
    if (this.service) {
      await this.save(() =>
        dismissNotification({ service: this.service!, notificationId }),
      );
      return;
    }

    await this.saveRuntime(async () => {
      if (!this.athleteId) {
        throw new NotificationRuntimeError("Notification runtime unavailable.");
      }

      this._overlay = dismissRuntimeNotification({
        athleteId: this.athleteId,
        notificationId,
        overlay: this._overlay,
        at: this.now().toISOString(),
      });

      return this.requireHydratedData();
    });
  }

  async markRead(notificationId: string): Promise<void> {
    if (this.service) {
      await this.save(() =>
        markNotificationRead({ service: this.service!, notificationId }),
      );
      return;
    }

    await this.saveRuntime(async () => {
      this._overlay = markRuntimeNotificationRead({
        notificationId,
        overlay: this._overlay,
      });
      return this.requireHydratedData();
    });
  }

  async addReminder(reminder: ReminderDto): Promise<void> {
    if (this.service) {
      await this.save(() => createNewReminder({ service: this.service!, reminder }));
      return;
    }

    await this.saveRuntime(async () => {
      if (!this.athleteId) {
        throw new NotificationRuntimeError("Notification runtime unavailable.");
      }

      this._overlay = createRuntimeReminder({
        athleteId: this.athleteId,
        reminder,
        overlay: this._overlay,
        at: this.now().toISOString(),
      });

      return this.requireHydratedData();
    });
  }

  async editReminder(reminder: ReminderDto): Promise<void> {
    if (this.service) {
      await this.save(() => updateReminder({ service: this.service!, reminder }));
      return;
    }

    await this.saveRuntime(async () => {
      this._overlay = updateRuntimeReminder({
        reminder,
        overlay: this._overlay,
      });
      return this.requireHydratedData();
    });
  }

  async removeReminder(reminderId: string): Promise<void> {
    if (this.service) {
      await this.save(() => deleteReminder({ service: this.service!, reminderId }));
      return;
    }

    await this.saveRuntime(async () => {
      this._overlay = deleteRuntimeReminder({
        reminderId,
        overlay: this._overlay,
      });
      return this.requireHydratedData();
    });
  }

  async updateSettings(settings: NotificationSettingsDto): Promise<void> {
    if (this.service) {
      await this.save(() =>
        updateNotificationSettings({ service: this.service!, settings }),
      );
      return;
    }

    await this.saveRuntime(async () => {
      this._overlay = updateRuntimeNotificationSettings({
        settings,
        overlay: this._overlay,
      });
      return this.requireHydratedData();
    });
  }

  private applyData(data: NotificationCenterData): void {
    this._notifications = data.notifications;
    this._reminders = data.reminders;
    this._coachNotifications = data.coachNotifications;
    this._settings = data.settings;
    this._statistics = data.statistics;
  }

  private async requireHydratedData(): Promise<NotificationCenterData> {
    if (!this.athleteId) {
      throw new NotificationRuntimeError("Notification runtime unavailable.");
    }

    const data = await loadHydratedNotificationExperience({
      athleteId: this.athleteId,
      overlay: this._overlay,
    });

    if (!data) {
      throw new NotificationRuntimeError("Notification runtime unavailable.");
    }

    return data;
  }

  private async reloadHydratedNotifications(
    loadingStatus:
      | typeof NotificationLoadingStatuses.REFRESHING
      | typeof NotificationLoadingStatuses.LOADING = NotificationLoadingStatuses.LOADING,
  ): Promise<void> {
    this._loading = createNotificationLoadingState(loadingStatus);
    this._error = null;
    this.notify();

    try {
      const data = await this.requireHydratedData();
      this.applyHydratedNotifications(data);
    } catch (caught) {
      this.applyNotificationFailure(
        caught instanceof Error ? caught.message : "Notification runtime unavailable.",
      );
    }
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

  private async saveRuntime(
    action: () => Promise<NotificationCenterData>,
    persistKind?: string,
  ): Promise<void> {
    this._saving = createNotificationSavingState(NotificationSavingStatuses.SAVING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await action());
      this.persistIfRuntimeDriven(persistKind ?? "mutation");
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
    if (caught instanceof NotificationRuntimeError) {
      return createNotificationErrorState(caught.message, "notification_runtime_unavailable", true);
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

  private persistIfRuntimeDriven(kind: string): void {
    if (!this.isRuntimeDriven || !this.athleteId) {
      return;
    }

    persistNotificationRuntimeMutation({
      athleteId: this.athleteId,
      requestId: `notification:runtime:${kind}:${this.athleteId}:${this.now().getTime()}`,
      overlay: this._overlay,
    });
  }
}
