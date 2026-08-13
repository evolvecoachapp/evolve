# EVOLVE — MASTER PROJECT RECOVERY / HANDOFF

## Scopo

Questo file serve a ricostruire il progetto EVOLVE in una nuova chat nel caso la conversazione corrente venga interrotta, chiusa o perda il contesto.

La source of truth è sempre il repository corrente. Questo documento è un supporto di recupero, non sostituisce l'ispezione del codice.

## Regole per la nuova chat

1. Leggere questo file e `docs/EVOLVE_CURRENT_STATE.md`.
2. Chiedere lo stato Git corrente.
3. Ispezionare il repository reale prima di proporre modifiche.
4. Non rifare funzionalità già presenti.
5. Non creare duplicati di repository, servizi, API client, runtime o persistence.
6. Non modificare aree completate/frozen salvo bug concreto dimostrato.
7. Se una capability non è verificabile, indicare `UNKNOWN`.
8. Non inventare endpoint, DTO, domain logic o architetture.
9. Prima capire lo stato attuale, poi proporre una sola prossima azione concreta.
10. Non creare sprint di audit ripetitivi se l'evidenza esistente è sufficiente.

## Struttura principale

Repository root:
C:\PROJECTS\EVOLVE

Aree principali:
- app/
- backend/
- admin/
- database/
- docker/
- infrastructure/
- docs/
- scripts/

## Mobile

Stack principale:
- React Native / Expo
- Expo Router
- Runtime Session
- Hydration
- Dashboard Restore
- Runtime Observer
- Runtime Write-Through
- SQLite persistence

Feature principali:
- Home
- Workout
- Nutrition
- Recovery
- Goals
- Coach
- Progress
- Profile
- Notifications
- Settings

API client mobile presenti:
- auth.ts
- users.ts
- workouts.ts
- nutrition.ts
- recovery.ts
- goals.ts
- progress.ts
- coach.ts

## Runtime / Persistence

La pipeline esistente è:

Auth
→ Runtime Session
→ Bootstrap
→ Hydration
→ First-Run Initialization
→ Dashboard Restore
→ Runtime Observer
→ Domain Mutation
→ Write-Through
→ Repository
→ SQLite

Athlete isolation e retry/failure lifecycle sono già stati hardenizzati.

Non ridisegnare questa architettura senza un blocker reale.

## Backend

Il backend esistente usa:
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT authentication
- Repository layer
- Service layer

Domini presenti:
- Users
- Workouts
- Workout Logs
- Workout Resolution
- Exercises
- Catalog
- Nutrition
- Recovery
- Goals
- Progress
- Coach
- Chat
- AI

Router principali presenti sotto:
backend/app/api/v1/

## Database

PostgreSQL esiste già.

Alembic esiste già con migration reali per:
- users
- programs/workouts
- exercise catalog
- meals/meal logs
- recovery check-ins
- goals/progress
- conversations/chat messages
- workout execution
- workout log changes
- program resolution cursor

NON creare una nuova baseline Alembic.

## Admin

Admin web esistente sotto:
admin/

Foundation completata:
- login
- superuser authorization
- dashboard
- users
- system health
- audit logging

Feature management completato:
- exercises
- programs
- workouts
- workout logs read-only
- nutrition read-only
- recovery read-only
- goals read-only
- progress read-only
- coach read-only

Operations UX completata:
- search/filter/pagination
- loading/empty/error
- confirmation dialogs
- mutation feedback
- active navigation
- accessibility basics

Backend Admin:
backend/app/api/v1/admin.py
backend/app/api/v1/admin_ops.py

## Deployment

Sprint 40.0 completato.

Local production-like stack:
- PostgreSQL container
- FastAPI backend container
- persistent Postgres volume
- Alembic startup migration
- Uvicorn
- public GET /health
- configurable CORS
- environment-driven configuration

Current deployment status:
LOCAL PRODUCTION-LIKE STACK = COMPLETE

VPS / public deployment is NOT yet complete.

## Security / Secrets

Never paste in chat:
- passwords
- JWT secrets
- API keys
- database passwords
- refresh tokens
- private keys

Mask them as:
***REDACTED***

## Recovery workflow

In a new chat:

1. Attach:
   - docs/EVOLVE_MASTER_RECOVERY.md
   - docs/EVOLVE_CURRENT_STATE.md
2. State that this is a continuation of EVOLVE.
3. Ask the assistant to read both files.
4. Provide:
   git status
   git log -5 --oneline --decorate
5. If needed, run repository inventory commands from the master recovery procedure.
6. Compare repository evidence with current state.
7. Continue from the exact next action documented in CURRENT_STATE.

## Repository truth rule

The actual repository and current Git state override everything written in this document.

END
