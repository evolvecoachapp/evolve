# EVOLVE Documentation Index

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Central index for the EVOLVE project knowledge base — the single entry point for all official documentation.  
**Source of Truth:** Yes — master index; defers detail to linked documents below.

---

## Start Here

| Audience | Read first |
|----------|------------|
| New developer or AI assistant | [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) |
| Current build status | [PROJECT_STATE.md](./PROJECT_STATE.md) |
| Tech versions | [TECH_STACK.md](./TECH_STACK.md) |

---

## Core Documents

| Document | Description |
|----------|-------------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Onboarding: vision, users, competitors, philosophy, workflow |
| [EVOLVE_MASTER_REPORT.md](./EVOLVE_MASTER_REPORT.md) | Project history, phases, timeline, progress narrative |
| [PROJECT_STATE.md](./PROJECT_STATE.md) | Current-state snapshot only |
| [SPRINT_HISTORY.md](./SPRINT_HISTORY.md) | Chronological sprint log (append-only) |
| [ROADMAP.md](./ROADMAP.md) | Forward plan with phase and sprint completion markers |
| [CHANGELOG.md](./CHANGELOG.md) | Semantic release history |

## Architecture & Design

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, patterns, dependency flow (summary) |
| [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md) | Composition Root, DI container, factories, service lifecycle |
| [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md) | Decision graph, explainability, execution reports |
| [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md) | Live workout execution state, session lifecycle, runtime models |
| [REST_RUNTIME.md](./REST_RUNTIME.md) | Deterministic rest periods, time model, state machine |
| [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md) | Immutable domain events, Event Stream, subscriber interfaces |
| [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md) | Single-session performance snapshots, metric model, trend placeholder |
| [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md) | Achievement Engine, Personal Records, future milestones/gamification |
| [TECH_STACK.md](./TECH_STACK.md) | Languages, frameworks, versions, future tech |
| [DECISIONS.md](./DECISIONS.md) | ADR-001 through ADR-042 (append-only) |
| [AI_SYSTEM.md](./AI_SYSTEM.md) | Coach, LLM, engines, memory, mobile workout pipeline |
| [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md) | Integration framework for the workout pipeline |
| [../.cursor/rules/EVOLVE_ARCHITECTURE.md](../.cursor/rules/EVOLVE_ARCHITECTURE.md) | Deep-dive architecture reference |

## Status Reports

| Document | Description |
|----------|-------------|
| [FRONTEND_STATUS.md](./FRONTEND_STATUS.md) | Mobile modules, providers, pending integration |
| [BACKEND_STATUS.md](./BACKEND_STATUS.md) | Services, repositories, models, gaps |
| [API_STATUS.md](./API_STATUS.md) | Every HTTP endpoint — 49 implemented, 7 planned |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Resolved and open issues |

## Supporting Documents

| Document | Description |
|----------|-------------|
| [TASKS.md](./TASKS.md) | Sprint checklists |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Git workflow, commits, PRs, Cursor usage |

## Placeholder Directories

| Path | Status |
|------|--------|
| `docs/architecture/` | Subsystem diagram index (Composition Root, pipeline, integration tests) |
| `docs/adr/` | Reserved; ADRs live in [DECISIONS.md](./DECISIONS.md) |
| `docs/meeting-notes/` | Reserved for team meeting notes |

---

## Documentation Maintenance Policy

Every sprint **must** end with a documentation pass before the sprint is considered complete. Documentation-only sprints (e.g., DOC-*) follow the same rules.

### Always update (every sprint)

| File | Action |
|------|--------|
| [SPRINT_HISTORY.md](./SPRINT_HISTORY.md) | **Append** a new sprint entry at the bottom. Never edit or delete past entries. |
| [PROJECT_STATE.md](./PROJECT_STATE.md) | Refresh all sections: frontend, backend, AI, database, auth, testing, deployment, known issues, sprint fields, completion %. |
| [EVOLVE_MASTER_REPORT.md](./EVOLVE_MASTER_REPORT.md) | Update **Current Progress**, **Key Metrics**, and phase completion notes only. Do not rewrite historical narrative. |
| **Last Updated** header | Set to sprint close date on every file touched. |

### Update when the layer changes

| File | Trigger |
|------|---------|
| [FRONTEND_STATUS.md](./FRONTEND_STATUS.md) | Mobile features, providers, screens, or navigation change |
| [BACKEND_STATUS.md](./BACKEND_STATUS.md) | Services, repositories, models, or migrations change |
| [API_STATUS.md](./API_STATUS.md) | Any route added, removed, or changes status — reconcile summary counts |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Issue opened, resolved, or workaround changes |
| [TECH_STACK.md](./TECH_STACK.md) | Dependency added, removed, or version bumped |

### Update when planning or releases change

| File | Trigger |
|------|---------|
| [ROADMAP.md](./ROADMAP.md) | Phase or sprint completed, reprioritized, or renumbered |
| [CHANGELOG.md](./CHANGELOG.md) | User-facing, API, or schema change — accumulate under `[Unreleased]`; tag version at release |
| [TASKS.md](./TASKS.md) | Check off completed items; do not reorder completed tasks |

### Update only on architectural decisions

| File | Trigger |
|------|---------|
| [DECISIONS.md](./DECISIONS.md) | New ADR appended (next number); never renumber. Mark superseded decisions explicitly. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layer boundaries, patterns, or dependency rules change |
| [AI_SYSTEM.md](./AI_SYSTEM.md) | Coach flow, engine routing, LLM, or memory design changes |

### Rarely updated

| File | Trigger |
|------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Vision, target users, competitors, or philosophy change |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Team workflow or PR process changes |
| [README.md](./README.md) | New doc file added or index structure changes |

### Consistency checks (every sprint)

Before closing a sprint, verify these documents **agree** on:

| Field | Canonical source |
|-------|------------------|
| Release version | [CHANGELOG.md](./CHANGELOG.md) — latest tagged release |
| Completed phases | [ROADMAP.md](./ROADMAP.md) phase table |
| Last completed sprint | [SPRINT_HISTORY.md](./SPRINT_HISTORY.md) — newest entry |
| Next sprint | [PROJECT_STATE.md](./PROJECT_STATE.md) |
| Overall completion % | [PROJECT_STATE.md](./PROJECT_STATE.md) — weighted table |
| API endpoint counts | [API_STATUS.md](./API_STATUS.md) — summary table |

### Rules

1. **Markdown only** in `docs/`.
2. **No duplication** — cross-link; each file owns one concern.
3. **Standard header** on every file — Project, Version, Status, Last Updated, Purpose, Source of Truth.
4. **Append-only history** — sprints, ADRs, changelog entries, resolved issues.
5. **Do not rewrite past sprint entries** — corrections add a note, not a silent edit.
