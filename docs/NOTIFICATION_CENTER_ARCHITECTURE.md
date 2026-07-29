# Notification Center Architecture

**Project:** EVOLVE  
**Sprint:** 31.7 — Notification & Reminder Framework Foundation  
**Status:** Accepted  
**ADR:** [ADR-112](./DECISIONS.md)  
**Module:** `app/src/features/notification-center`

---

## Purpose

Establish the deterministic notification domain that manages reminders, scheduled events, intelligent coach notifications, delivery policies, and notification state. This sprint creates the framework foundation — no real notifications are sent, no push notification permissions are requested, no OS integrations are made.

Future providers (Expo Notifications, Firebase Cloud Messaging, APNS, Android Notification Manager) must plug into this framework without changing the Domain.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
NotificationCenterViewModel
        ↓
Application Use Cases
  (loadNotifications / refreshNotifications /
   dismissNotification / markNotificationRead /
   createReminder / updateReminder / deleteReminder /
   updateNotificationSettings / getNotificationStatistics)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
NotificationCenterService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) Expo Notifications / FCM / APNS /
Android Notification Manager / persistence
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/notification-center/
  application/     — notification use cases
  hooks/           — ViewModel bindings
  viewmodels/      — NotificationCenterViewModel
  components/      — presentation-only notification UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — provider contract + factory
  screens/         — NotificationCenterScreen composition
  __tests__/       — application / viewmodel / hooks / mapper / provider / service / immutability
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `NotificationItem` | Single notification with category, priority, state, actions |
| `Reminder` | Repeating or one-shot reminder with schedule and delivery policy |
| `ReminderSchedule` | Day-of-week + time-of-day + delivery policy |
| `ReminderType` | workout / nutrition / recovery / hydration / sleep / body_weight / coach / custom |
| `NotificationCategory` | reminder / coach / progress / system / social |
| `NotificationPriority` | low / normal / high / urgent |
| `NotificationAction` | Actionable button on a notification |
| `NotificationState` | pending / scheduled / delivered / dismissed / expired / cancelled |
| `DeliveryPolicy` | immediate / scheduled / daily / weekly / manual / disabled |
| `CoachNotification` | AI coach-originated notification with context |
| `NotificationSettings` | Per-category toggles, delivery policy, quiet hours |
| `NotificationStatistics` | Aggregate counts (total, unread, dismissed, active reminders, etc.) |
| `NotificationLoadingState` | idle / loading / refreshing |
| `NotificationSavingState` | idle / saving |
| `NotificationErrorState` | message / code / retryable |

All models are immutable (`Object.freeze`).

---

## Service Contract

`NotificationCenterService` defines the provider abstraction:

- `getNotifications()` → full notification center data
- `dismissNotification(id)` → updated data
- `markNotificationRead(id)` → updated data
- `createReminder(reminder)` → updated data
- `updateReminder(reminder)` → updated data
- `deleteReminder(id)` → updated data
- `updateSettings(settings)` → updated data
- `getStatistics()` → statistics only

Provider is selected via `EXPO_PUBLIC_NOTIFICATION_CENTER_PROVIDER` (mock | backend | local).

---

## Providers

| Provider | Status |
|----------|--------|
| `MockNotificationCenterService` | Operational — realistic mock data |
| `BackendNotificationCenterService` | Stub — throws `NotificationCenterError` |
| `LocalNotificationCenterService` | Stub — throws `NotificationCenterError` |

---

## ViewModel

`NotificationCenterViewModel` owns:
- Notification, reminder, coach notification collections
- Settings and statistics
- Loading / saving / error / empty state
- Subscriber notification pattern

---

## Hooks

| Hook | Projection |
|------|-----------|
| `useNotifications()` | Full notification center with all operations |
| `useReminder()` | Reminders with CRUD |
| `useNotificationSettings()` | Settings with update |
| `useNotificationStatistics()` | Read-only statistics |

---

## Components

| Component | Role |
|-----------|------|
| `NotificationCenterHeader` | Hero section with unread/reminder stats |
| `NotificationCard` | Single notification display with actions and dismiss |
| `ReminderCard` | Single reminder display |
| `ReminderEditor` | Reminder create/edit form placeholder |
| `CoachNotificationCard` | AI coach notification with context |
| `NotificationSettingsCard` | Settings overview |
| `NotificationStatisticsCard` | Statistics overview |
| `NotificationSkeleton` | Loading placeholder |
| `NotificationEmpty` | Empty state |
| `NotificationError` | Error state with retry |

---

## Screen

`NotificationCenterScreen` composes all components. Presentation only.

---

## Constraints

- NO push notifications, Firebase, APNS, Expo Notifications, Android APIs
- NO permissions, background services, timers, scheduling engine
- NO networking, persistence
- Presentation and domain modeling only
- Strict TypeScript

---

## Future Integration Points

1. **Expo Notifications** — plug into `NotificationCenterService` as a provider
2. **Firebase Cloud Messaging** — remote push via backend provider
3. **APNS** — iOS-specific provider bridge
4. **Android Notification Manager** — Android-specific provider bridge
5. **Persistence** — local storage for notification history
6. **Coach Intelligence** — pipe AI recommendations through `CoachNotification`

---

## Test Coverage

- Application use case tests (load, refresh, dismiss, read, CRUD reminders, settings, statistics, error propagation)
- ViewModel tests (state management, error handling, subscriber notification, empty state)
- Hook tests (data projection, auto-load, empty state)
- Mapper tests (DTO → immutable model, null handling)
- Provider tests (mock operations, backend/local stubs)
- Service factory tests (default resolution)
- Immutability tests (deep freeze verification on all collections and nested objects)
