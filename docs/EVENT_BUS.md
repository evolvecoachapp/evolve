# Event Bus — Not Applicable

**Project:** EVOLVE  
**Status:** Clarification  
**Last Updated:** 2026-07-22  

EVOLVE does **not** use an event bus, message broker, or async messaging infrastructure for workout execution.

Sprint 18.2 introduced a **Domain Event System** — strongly typed immutable in-memory events with a synchronous dispatcher and Event Stream.

See [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md).
