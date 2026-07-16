import { InMemoryNotificationStore } from "./store"

// Shared singleton notification store for the app UI
export const notificationStore = new InMemoryNotificationStore()
