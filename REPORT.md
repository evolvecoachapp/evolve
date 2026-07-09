# EVOLVE — Review Fix Report: User Model Enum Storage & New Fields

> Scope: Review feedback on Sprint 2.1 `User` model — enum value storage, `is_verified` field, `deleted_at` field, and regenerated migration.

---

## Summary

- Reconfigured all three native PostgreSQL enums (`gender_enum`, `activity_level_enum`, `goal_enum`) to store lowercase enum **values** (e.g. `male`) instead of enum **names** (e.g. `MALE`).
- Added `is_verified: bool` (default `False`, not nullable).
- Added `deleted_at: datetime | None` (nullable, no default) for future soft-delete support.
- Regenerated the Alembic migration to reflect the corrected model, replacing the previous unpublished migration.
- Verified the fix against a live PostgreSQL database, including a Python round-trip test confirming values are stored and read correctly.
- No changes made outside this scope.

---

## Files Modified

| File | Change |
|------|--------|
| `backend/app/models/user.py` | Added `values_callable` to all three `SAEnum(...)` definitions (`gender`, `activity_level`, `goal`) so PostgreSQL enum types store lowercase values instead of Python enum member names; added `is_verified` and `deleted_at` columns |
| `backend/alembic/versions/5ccce88c59dd_create_users_table.py` | New migration replacing the previous one (`fd38627e60ba`, deleted — never committed), including all corrected enum labels and the two new columns |

---

## Files Created

- `backend/alembic/versions/5ccce88c59dd_create_users_table.py` (replaces the deleted `fd38627e60ba_create_users_table.py`)

## Files Deleted

- `backend/alembic/versions/fd38627e60ba_create_users_table.py` — superseded; was never committed to version control, so it was amended in place rather than stacked as a second migration, keeping a single migration for the `users` table.

---

## Files Explicitly Not Modified

- `backend/app/db/database.py`
- `backend/app/core/config.py`
- `docker-compose.yml`
- `backend/requirements.txt`

---

## Implementation Detail

Each enum column now passes `values_callable` to `sqlalchemy.Enum`:

```python
values_callable=lambda enum_cls: [member.value for member in enum_cls]
```

This instructs SQLAlchemy to use the enum members' `.value` (e.g. `"male"`) — rather than their `.name` (e.g. `"MALE"`) — both when generating the PostgreSQL `CREATE TYPE` DDL and when converting between Python and the database at runtime.

Because the previous migration had already been applied locally with name-based enum labels, the new migration explicitly drops the three enum types (`DROP TYPE IF EXISTS ...`) before recreating them with value-based labels, and the `downgrade()` path now also drops them for full reversibility. This was handled entirely within the Alembic migration rather than through direct database commands.

---

## Tests Executed

| Check | Result |
|-------|--------|
| Import `app.models.user` after edits | Success |
| `alembic revision --autogenerate -m "create users table"` | Success — detected `users` table, all columns including `is_verified` and `deleted_at`, and 4 indexes |
| `alembic upgrade head` | Success — migration `5ccce88c59dd` applied cleanly |
| PostgreSQL `\d users` inspection | Confirmed 19 columns including `is_verified` (`boolean`, not null) and `deleted_at` (`timestamptz`, nullable) |
| PostgreSQL `\dT+ *_enum` inspection | Confirmed all three enum types now store lowercase values (`male`, `female`, `other`, `prefer_not_to_say`; `sedentary`, ... ; `lose_weight`, ...) instead of uppercase names |
| Python round-trip test (insert row with `Gender.MALE`, re-read via raw SQL) | Confirmed Python side reports `Gender.MALE`; raw database value is `male` |
| Linter check on `user.py` and the new migration | No errors |
| `git diff` on `database.py`, `config.py`, `docker-compose.yml`, `requirements.txt` | Confirmed empty — no modifications |

No `pytest` suite exists yet; no automated unit/integration tests were executed.

---

## Remaining Work

Unchanged from the prior sprint report — deferred to later sprints per `docs/ROADMAP.md`:

- Password hashing, JWT, `UserRepository`, `AuthService`, Pydantic schemas, `/api/v1/auth` and `/api/v1/users` endpoints, auth integration tests (Sprint 2.1–2.3).
- Workout Engine, AI Coach, Mobile App, and Production phases (Phases 3–6).
