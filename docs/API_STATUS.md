# EVOLVE API Status

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Complete inventory of backend HTTP endpoints and implementation status.  
**Source of Truth:** Yes — for endpoint counts and route status (reconcile summary table when routes change).

**Base URL:** `http://localhost:8000`  
**API prefix:** `/api/v1`
---

## Summary

| Status | Count |
|--------|-------|
| Complete | 50 |
| Partial | 0 |
| Stub | 0 |
| Not implemented | 6 (planned) |
| **Total documented** | **56** |

---

## Root

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/` | GET | No | Complete | Returns `{name, status, version}` |

---

## Auth (`/api/v1/auth`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/auth/register` | POST | No | Complete | Creates user, returns tokens |
| `/auth/login` | POST | No | Complete | Returns access + refresh tokens |
| `/auth/refresh` | POST | No | Complete | Rotates access token |

---

## Users (`/api/v1/users`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/users/me` | GET | Yes | Complete | Read current user profile |
| `/users/me` | PATCH | Yes | Complete | Partial profile update |

---

## Exercises (`/api/v1/exercises`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/exercises` | GET | No | Complete | Paginated, filterable catalog |
| `/exercises/{id_or_slug}` | GET | No | Complete | Single exercise detail |
| `/exercises/{exercise_id}/substitutes` | GET | No | Complete | Substitution list |

---

## Catalog (`/api/v1/catalog`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/catalog/muscle-groups` | GET | No | Complete | All muscle groups |
| `/catalog/equipment` | GET | No | Complete | All equipment types |

---

## Workout Logs (`/api/v1/workout-logs`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/workout-logs/start` | POST | Yes | Complete | Start session (optionally from template) |
| `/workout-logs/active` | GET | Yes | Complete | Current in-progress session or null |
| `/workout-logs` | GET | Yes | Complete | Paginated history |
| `/workout-logs/{id}` | GET | Yes | Complete | Session detail |
| `/workout-logs/{id}/finish` | POST | Yes | Complete | Complete session; may advance program cursor |
| `/workout-logs/{id}/skip` | POST | Yes | Complete | Skip session; may advance program cursor |
| `/workout-logs/{id}/exercises` | POST | Yes | Complete | Add exercise to session |
| `/workout-logs/{id}/exercises/{exercise_id}/sets` | POST | Yes | Complete | Log a set |
| `/workout-logs/{id}/exercises/{exercise_id}/sets/{set_id}` | PATCH | Yes | Complete | Update set (within edit window) |
| `/workout-logs/{id}/exercises/{exercise_id}/sets/{set_id}` | DELETE | Yes | Complete | Delete set |

---

## Workout Resolution (`/api/v1/workout-resolution`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/workout-resolution/today` | GET | Yes | Complete | Today's program slot preview |
| `/workout-resolution/advance-rest-day` | POST | Yes | Complete | Explicitly advance past rest day |

---

## Nutrition (`/api/v1/nutrition`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/nutrition/meals` | POST | Yes | Complete | Create personal meal template |
| `/nutrition/meals` | GET | Yes | Complete | List owned + public meals |
| `/nutrition/meals/{id}` | GET | Yes | Complete | Meal detail |
| `/nutrition/meals/{id}` | PATCH | Yes | Complete | Update owned meal |
| `/nutrition/meals/{id}` | DELETE | Yes | Complete | Soft deactivate |
| `/nutrition/logs` | POST | Yes | Complete | Log meal (template or ad-hoc) |
| `/nutrition/logs` | GET | Yes | Complete | Paginated log history |
| `/nutrition/logs/{id}` | GET | Yes | Complete | Log detail |
| `/nutrition/logs/{id}` | PATCH | Yes | Complete | Update log |
| `/nutrition/logs/{id}` | DELETE | Yes | Complete | Delete log |
| `/nutrition/targets` | GET | Yes | Complete | Daily targets + adherence; 422 if incomplete profile |

---

## Recovery (`/api/v1/recovery`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/recovery/check-ins` | POST | Yes | Complete | One per user per date |
| `/recovery/check-ins` | GET | Yes | Complete | Paginated history |
| `/recovery/check-ins/{id}` | GET | Yes | Complete | Single check-in |
| `/recovery/check-ins/{id}` | PATCH | Yes | Complete | Update check-in |
| `/recovery/check-ins/{id}` | DELETE | Yes | Complete | Delete check-in |
| `/recovery/readiness` | GET | Yes | Complete | Daily readiness score + protocols |

---

## Coach (`/api/v1/coach`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/coach/messages` | POST | Yes | Complete | Send message; returns Coach reply (async) |
| `/coach/conversations/{id}/messages` | GET | Yes | Complete | Paginated conversation history |

---

## Goals (`/api/v1/goals`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/goals` | POST | Yes | Complete | Create goal |
| `/goals` | GET | Yes | Complete | List user goals |
| `/goals/{id}` | GET | Yes | Complete | Goal detail |
| `/goals/{id}` | PATCH | Yes | Complete | Update goal |
| `/goals/{id}` | DELETE | Yes | Complete | Delete goal |

---

## Progress (`/api/v1/progress`)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/progress` | POST | Yes | Complete | Log progress entry |
| `/progress` | GET | Yes | Complete | Filtered, paginated entries |
| `/progress/summary` | GET | Yes | Complete | AI narrative + deterministic stats (async) |

---

## Planned (Not Implemented)

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/health` | GET | No | **Not implemented** | DB connectivity check |
| `/programs` | * | Yes | **Not implemented** | Program CRUD — service exists |
| `/workouts` | * | Yes | **Not implemented** | Workout template CRUD — service exists |
| `/programs/{id}/assign` | POST | Yes | **Not implemented** | Assignment — service exists |
| `/coach/conversations` | GET | Yes | **Not implemented** | List conversations |
| `/exercises` | POST | Yes | **Not implemented** | Admin exercise create |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **Complete** | Implemented, tested, production-ready for current scope |
| **Partial** | Implemented with known gaps or missing validation |
| **Stub** | Route exists but returns placeholder or empty data |
| **Not implemented** | No route; may have service-layer support |

---

## Mobile Integration Map

| Mobile screen | Primary endpoints | Sprint |
|---------------|-------------------|--------|
| CoachScreen | `/coach/messages`, `/coach/conversations/{id}/messages` | 5.3 |
| WorkoutScreen | `/workout-resolution/today`, `/workout-logs/*` | 5.3 |
| NutritionScreen | `/nutrition/targets`, `/nutrition/meals`, `/nutrition/logs` | 5.3 |
| ProgressScreen | `/progress`, `/progress/summary`, `/goals` | 5.4 |
| DashboardScreen | Aggregates above | 5.3+ |
