import type { CoachNotification } from "../../shared/models/CoachNotification"

export interface CoachNotificationViewModel {
  id: string
  title: string
  message: string
  icon: string
  relativeTime: string
  priorityColor: string
  read: boolean
  createdAt: string
}

const priorityColorFor = (priority: CoachNotification["priority"]) => {
  switch (priority) {
    case "critical":
      return "#B00020"
    case "high":
      return "#FF6B6B"
    case "medium":
      return "#FFB84D"
    default:
      return "#9AA4B2"
  }
}

const iconFor = (type: CoachNotification["type"]) => {
  switch (type) {
    case "workout_reminder":
      return "dumbbell"
    case "nutrition_reminder":
      return "nutrition"
    case "recovery_alert":
      return "heart"
    case "achievement":
      return "trophy"
    case "system":
      return "settings"
    default:
      return "message"
  }
}

const timeAgo = (iso: string) => {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const sec = Math.floor((now - then) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  return `${days}d ago`
}

export const presentCoachNotification = (n: CoachNotification) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  icon: iconFor(n.type),
  relativeTime: timeAgo(n.createdAt),
  priorityColor: priorityColorFor(n.priority),
  read: n.read,
  createdAt: n.createdAt,
})

export const sortNotificationsNewestFirst = (items: CoachNotification[]) =>
  [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
