import type { DomainEvent } from "../models/DomainEvent";

/**
 * Base subscriber contract. Implementations live in future modules.
 * Synchronous notification only — no queues, brokers, or async dispatch.
 */
export interface DomainEventSubscriber {
  readonly id: string;
  readonly name: string;
  onEvent(event: DomainEvent): void;
}

export type Unsubscribe = () => void;
