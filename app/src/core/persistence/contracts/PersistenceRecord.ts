/**
 * Opaque persistence record shape used by repository contracts.
 *
 * Domain entities are mapped by future adapters — never by this layer.
 */
export interface PersistenceRecord {
  readonly id: string;
}
