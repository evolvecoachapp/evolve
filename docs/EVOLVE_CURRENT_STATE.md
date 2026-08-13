# EVOLVE — CURRENT PROJECT STATE

## Snapshot Date

2026-08-13

## Repository

Path:
C:\PROJECTS\EVOLVE

Branch:
feature/user-model

Remote:
https://github.com/evolvecoachapp/evolve.git

## Current HEAD

df3c495

Commit:
feat(deployment): add production-like docker stack

Working tree:
CLEAN

## Latest Completed Work

### Runtime / Mobile
- Runtime Session complete
- Hydration complete
- Dashboard Restore complete
- Runtime Observer complete
- Runtime Write-Through complete
- SQLite persistence complete
- Domain serialization complete
- Athlete isolation complete
- Failure/retry lifecycle complete
- First-run runtime bootstrap complete
- Production navigation complete
- Production UX completion complete
- Accessibility completion complete

### Mobile ↔ Backend
- Profile backend integration complete
- Nutrition backend integration complete
- Recovery backend integration complete
- Workout backend integration complete
- Goals backend integration complete
- Coach backend integration complete

### Backend
- FastAPI complete
- PostgreSQL complete
- SQLAlchemy complete
- Alembic complete
- JWT authentication complete
- Users complete
- Workouts complete
- Workout logs complete
- Workout resolution complete
- Exercises/catalog complete
- Nutrition complete
- Recovery complete
- Goals complete
- Progress complete
- Coach/chat complete
- AI infrastructure exists

### Admin
- Admin foundation complete
- Admin authentication / superuser gate complete
- Dashboard complete
- Users complete
- Exercises complete
- Programs complete
- Workouts complete
- Workout logs read-only complete
- Nutrition read-only complete
- Recovery read-only complete
- Goals read-only complete
- Progress read-only complete
- Coach read-only complete
- System health complete
- Audit logging complete
- UX/operations completion complete

### Deployment
Sprint 40.0 complete.

Implemented:
- backend Dockerfile
- backend .dockerignore
- docker-entrypoint
- Docker Compose API + PostgreSQL
- Postgres health check
- Alembic startup migration
- Uvicorn startup
- public GET /health
- configurable CORS
- environment-driven configuration
- persistent postgres volume
- local production-like deployment path

Validated:
- docker compose build PASS
- docker compose up PASS
- GET /health PASS
- register PASS
- login PASS
- /users/me PASS
- /exercises PASS
- admin health PASS
- admin dashboard PASS

## Current Architecture

### Mobile

Mobile
→ Runtime / API client
→ Runtime/local persistence OR backend API provider
→ PostgreSQL for backend-owned cloud capabilities

### Backend

FastAPI
→ Services
→ Repositories
→ PostgreSQL

### Admin

Admin Web
→ Admin API
→ Existing domain services / repositories
→ PostgreSQL

## Frozen / Do Not Touch Without Proven Defect

- Runtime Session architecture
- Runtime Observer
- Runtime Write-Through
- Repository Hydration
- Dashboard Restore
- SQLite architecture
- Athlete isolation
- Domain persistence architecture
- Production mobile navigation
- Production mobile UX
- Existing backend domain architecture
- Existing repositories/services
- Alembic architecture

## Current Phase

PRE-PUBLIC-DEPLOYMENT

## Current Goal

Make EVOLVE deployable on a real server and prepare it for controlled external beta testing.

Target architecture:

Internet
→ HTTPS / reverse proxy
→ FastAPI backend
→ PostgreSQL

Admin:
Admin Web
→ Admin API
→ PostgreSQL

Mobile:
EVOLVE mobile
→ production HTTPS API

## Completed Before This Phase

- Mobile runtime
- Mobile persistence
- First-run initialization
- Backend domain APIs
- Backend database
- Backend/mobile integrations
- Admin foundation
- Admin feature management
- Admin operational UX
- Local production-like Docker deployment

## Remaining High-Level Work

### 1. Real Server Deployment
- VPS/cloud server
- public domain
- HTTPS
- reverse proxy
- production environment
- secure secrets
- backend startup
- PostgreSQL persistence
- backup strategy

### 2. Mobile Production API Configuration
- production EXPO_PUBLIC_API_BASE_URL
- device testing against public HTTPS API
- authentication against deployed backend

### 3. Production Hardening
Potential work:
- CI/CD
- rate limiting
- stronger production auth/session handling
- secret management
- monitoring
- backup/restore verification
- production logging

### 4. Feature completeness before launch
Known possible future gaps:
- real Progress analytics integration
- remaining Nutrition mutation/API capability
- real LLM activation if desired
- push notifications
- subscriptions/payments

These are not automatically blockers for every phase and must be evaluated against the current launch goal.

## Known Test State

Sprint 40.0 focused backend validation:
59 passed

Full backend suite:
311 passed
2 failed
3 errors

Reported issue:
pre-existing fixture/isolation conflict involving seeded `beginner-foundation` program in shared PostgreSQL.

This issue was not introduced by Sprint 40.0.

Before public launch, the backend suite should ideally reach a clean state.

## Known Configuration Notes

- Mobile still requires a real production EXPO_PUBLIC_API_BASE_URL for public deployment.
- Postgres host port should NOT be publicly exposed on a VPS.
- No TLS is currently configured in the local Docker stack.
- No CI/CD yet.
- No managed production secrets yet.
- Single Uvicorn worker currently used in local deployment.
- Local production-like deployment is NOT the same as public production deployment.

## Immediate Next Action

Implement and validate REAL SERVER DEPLOYMENT.

Do not redesign the application.

Do not rebuild Runtime/SQLite.

Do not create new domain repositories.

Do not create another persistence architecture.

## Next Planned Phase

1. VPS/cloud deployment
2. Domain
3. HTTPS
4. Reverse proxy
5. Production environment
6. Mobile production API URL
7. Real-device external API test
8. Beta readiness verification

## Git Checkpoint

Current HEAD:
df3c495

Current branch:
feature/user-model

Working tree:
clean

## Recovery Rule

When a new chat starts:
- load EVOLVE_MASTER_RECOVERY.md
- load this file
- verify git status
- verify git log -5
- inspect actual repository if anything differs
- do not reimplement completed areas
- take only the next exact action that remains

## IMPORTANT

This file is a checkpoint, not a replacement for repository inspection.

The repository is always the ultimate source of truth.

END
