import { ValidationError } from "../../../core/persistence/errors";
import { freezeDeep } from "./freezeDeep";

export interface DomainSerializer<T> {
  readonly domain: string;
  readonly serialize: (value: T) => string;
  readonly deserialize: (payload: string) => T | null;
}

export function createDomainSerializer<T>(options: {
  readonly domain: string;
  readonly isValid: (value: unknown) => value is T;
}): DomainSerializer<T> {
  return Object.freeze({
    domain: options.domain,
    serialize(value: T): string {
      return JSON.stringify(value);
    },
    deserialize(payload: string): T | null {
      if (payload.trim().length === 0 || payload === "{}") {
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(payload) as unknown;
      } catch {
        throw new ValidationError([`Invalid ${options.domain} payload JSON`]);
      }

      if (!options.isValid(parsed)) {
        throw new ValidationError([`Invalid ${options.domain} payload shape`]);
      }

      return freezeDeep(parsed);
    },
  });
}
