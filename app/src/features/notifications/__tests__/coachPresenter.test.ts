import { createCoachNotification } from "../../shared/models/CoachNotification"
import { presentCoachNotification, sortNotificationsNewestFirst } from "../components/CoachPresenter"

describe("CoachPresenter", () => {
  it("maps notification fields to view model", () => {
    const n = createCoachNotification({
      title: "Test",
      message: "Hello",
      type: "workout_reminder",
      priority: "high",
      createdAt: new Date().toISOString(),
    })

    const vm = presentCoachNotification(n)

    expect(vm.id).toBe(n.id)
    expect(vm.title).toBe("Test")
    expect(vm.message).toBe("Hello")
    expect(vm.icon).toBeDefined()
    expect(vm.priorityColor).toBe("#FF6B6B")
    expect(vm.read).toBe(false)
  })

  it("orders notifications newest first", () => {
    const older = createCoachNotification({ createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() })
    const newer = createCoachNotification({ createdAt: new Date().toISOString() })

    const ordered = sortNotificationsNewestFirst([older, newer])
    expect(ordered[0].id).toBe(newer.id)
    expect(ordered[1].id).toBe(older.id)
  })
})
