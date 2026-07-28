import type { ConnectionHealth } from "./ConnectionHealth";

export {
  ConnectionHealth,
  type SQLiteHealthReport,
} from "./ConnectionHealth";

export function isConnected(health: ConnectionHealth): boolean {
  return health.isConnected();
}

export function databaseVersion(health: ConnectionHealth): string {
  return health.databaseVersion();
}

export function storageUsage(health: ConnectionHealth): number {
  return health.storageUsage();
}

export function adapterVersion(health: ConnectionHealth): string {
  return health.adapterVersion();
}
