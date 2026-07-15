import { InMemoryNotificationStore } from "../store"
import { createCoachNotification } from "../../shared/models/CoachNotification"

describe("NotificationStore", () => {
  let store: InMemoryNotificationStore

  beforeEach(() => {
    store = new InMemoryNotificationStore()
  })

  it("saves and retrieves notifications", () => {
    const notifications = [
      createCoachNotification({ title: "First", type: "coach_message" }),
      createCoachNotification({ title: "Second", type: "workout_reminder" }),
    ]

    store.saveNotifications(notifications)

    expect(store.getNotifications()).toEqual(notifications)
  })

  it("counts unread notifications", () => {
    const notifications = [
      createCoachNotification({ title: "Unread", read: false }),
      createCoachNotification({ title: "Read", read: true }),
    ]

    store.saveNotifications(notifications)

    expect(store.getUnreadCount()).toBe(1)
  })

  it("marks notifications as read by id", () => {
    const first = createCoachNotification({ title: "First", read: false })
    const second = createCoachNotification({ title: "Second", read: false })

    store.saveNotifications([first, second])
    store.markAsRead(second.id)

    expect(store.getNotifications().find((notification) => notification.id === second.id)?.read).toBe(true)
    expect(store.getNotifications().find((notification) => notification.id === first.id)?.read).toBe(false)
  })

  it("clears all stored notifications", () => {
    store.saveNotifications([createCoachNotification(), createCoachNotification()])
    store.clear()

    expect(store.getNotifications()).toEqual([])
    expect(store.getUnreadCount()).toBe(0)
  })
})
