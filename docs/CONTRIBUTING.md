# Contributing to EVOLVE

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Git workflow, conventional commits, pull requests, code review, and Cursor usage.  
**Source of Truth:** Yes — for contribution process (onboarding context: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)).

For architectural context, read [`EVOLVE_ARCHITECTURE.md`](../.cursor/rules/EVOLVE_ARCHITECTURE.md) and [`evolve.mdc`](../.cursor/rules/evolve.mdc) before contributing.

---

## Git Workflow

EVOLVE uses a **trunk-based workflow** with short-lived feature branches.

- `main` is the protected, always-deployable branch.
- All work happens on a feature branch created from the latest `main`.
- Branches are merged via pull request — no direct pushes to `main`.
- Keep branches small and short-lived (days, not weeks).
- Rebase or update your branch from `main` before opening a pull request.

```
main
 └── feature/user-auth-jwt
 └── fix/database-session-leak
 └── docs/update-roadmap
```

---

## Branch Naming

Use the pattern: `<type>/<short-description>`

| Type | Use for |
|------|---------|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation-only changes |
| `refactor/` | Code changes with no behavior change |
| `chore/` | Tooling, dependencies, config |
| `test/` | Test-only changes |

**Rules:**
- Use kebab-case for the description: `feature/workout-logging-api`
- Keep it short and specific — avoid `feature/updates` or `fix/bug`
- Reference an issue/ticket number when available: `feature/EVOLVE-123-jwt-refresh`

---

## Conventional Commits

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

**Types:**

| Type | Meaning |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependencies, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration changes |

**Examples:**

```
feat(auth): add JWT refresh token endpoint
fix(db): close session on request teardown
docs(roadmap): add Phase 4 sprint breakdown
refactor(services): extract workout assignment logic
chore(deps): remove duplicate psycopg2 dependency
```

**Rules:**
- Scope should match the affected layer or domain (`auth`, `db`, `workouts`, `ai`, `docs`, `ci`)
- Summary in imperative mood, lowercase, no trailing period
- Use the body to explain *why*, not just *what*
- Breaking changes use a `!` after the type/scope and a `BREAKING CHANGE:` footer

---

## Pull Request Process

1. **Branch from `main`**, implement one focused concern per PR.
2. **Keep PRs small.** One layer or one feature slice — not multiple unrelated changes.
3. **Write a clear description:**
   - What changed and why
   - Which phase/sprint this addresses (link to `ROADMAP.md` / `TASKS.md`)
   - Any schema changes (include the Alembic migration)
   - How it was tested
4. **Pass all CI checks** before requesting review (lint, type check, tests, build).
5. **Update related documentation** in the same PR when architecture, decisions, or roadmap are affected (`EVOLVE_ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md`, `CHANGELOG.md`).
6. **Check off completed items** in `TASKS.md` as part of the PR.
7. **No direct pushes to `main`** — every change goes through a pull request.
8. **Squash or rebase merge** to keep history readable (avoid noisy merge commits).

---

## Code Review Process

**As an author:**

- Keep the diff reviewable — if it's large, explain why or split it.
- Self-review the diff before requesting review.
- Respond to every comment (fix, explain, or push back with reasoning).
- Do not merge your own PR without at least one approval.

**As a reviewer, check for:**

- **Architecture compliance** — routes stay thin, business logic stays in services, database logic stays in repositories.
- **Type hints and docstrings** on public functions, per `evolve.mdc`.
- **No raw SQL** unless explicitly justified.
- **No duplicated logic** — shared behavior should be extracted.
- **Migrations included** whenever models change.
- **No secrets committed** (check for hardcoded credentials or `.env` values).
- **Tests included** for new services, repositories, and API endpoints.

**Review SLA:** Aim to review open PRs within one business day to keep the trunk-based workflow fast.

---

## Cursor Workflow

EVOLVE is developed using Cursor with project rules defined in [`evolve.mdc`](../.cursor/rules/evolve.mdc). Follow these practices when using AI assistance:

1. **Let the agent read before it writes.** Always have it read `evolve.mdc` and `EVOLVE_ARCHITECTURE.md` before generating or modifying code.
2. **Scope requests to one phase or layer at a time.** Avoid asking for full-stack features in a single prompt — this keeps changes reviewable and aligned with `ROADMAP.md`.
3. **Require explanation before large changes.** Per `evolve.mdc`, architectural decisions should be explained briefly before large code generation — ask the agent to outline its plan and wait for approval on non-trivial changes.
4. **Never let the agent skip Clean Architecture.** If generated code puts business logic in a route or a query in a service, reject it and ask for a correction.
5. **Review AI-generated migrations manually.** Always inspect Alembic migrations before applying them, even when generated by the agent.
6. **Keep decisions durable.** When the agent (or a human) makes a technology or architecture choice, record it in [`DECISIONS.md`](./DECISIONS.md).
7. **Update documentation alongside code.** See [Documentation Maintenance Policy](./README.md#documentation-maintenance-policy) in README.md.
8. **Do not commit uncommitted Cursor experiments.** Treat agent output the same as human-written code — it goes through the same PR and review process.

---

*Questions about process should be raised as a `docs/` pull request updating this file, so the convention stays discoverable for the next contributor.*
