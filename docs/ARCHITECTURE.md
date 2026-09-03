# Architecture Summary

## System Overview

The Magazine Platform follows a **microservices architecture** with a clear separation between the public-facing frontend and the backend services. Each service owns its own database (database-per-service pattern) and communicates through APIs and an event-driven message broker.

```
                              INTERNET
                                  |
                                  v
                        +-------------------+
                        |    CDN / WAF      |
                        +---------+---------+
                                  |
                                  v
                        +-------------------+
                        |  LOAD BALANCER    |
                        +---------+---------+
                                  |
                                  v
                        +-------------------+
                        |    API GATEWAY    |
                        +---------+---------+
                                  |
        +---------------+--------+--------+---------------+
        |               |                 |               |
        v               v                 v               v
  +-----------+   +------------+   +-------------+  +-------------+
  |  LANDING  |   |   AUTH     |   |   USER      |  | ROLE &      |
  |  SERVICE  |   |  SERVICE   |   |  SERVICE    |  | PERMISSION  |
  +-----------+   +-----+------+   +------+------+  |  SERVICE    |
                                                     +------+------+
```

## Core Services (14 Total)

| # | Service | Responsibility |
|---|---|---|
| 1 | Landing Service | Public marketing page + catalog |
| 2 | API Gateway | Request routing, rate limiting |
| 3 | Auth Service | Login, logout, signup (defaults to Viewer) |
| 4 | User Service | User CRUD operations |
| 5 | Role & Permission Service | RBAC, permission checks |
| 6 | Magazine Service | Magazine CRUD |
| 7 | Post Service | Post management |
| 8 | Child Site Service | Child site records + `button_name` |
| 9 | Connection Service | Parent-child linking |
| 10 | Site Validator Service | URL validation |
| 11 | Provisioning Service | New site setup |
| 12 | Access Gateway | Permission-checked routing |
| 13 | Audit Service | Action logging |
| 14 | Notification Service | User notifications |

## Database Architecture

Every service has its own database. In development, each uses **SQLite** (file-based). In production, each uses **PostgreSQL** (managed cloud).

```
Development: SQLite (dev.sqlite3 per service)
Production:  PostgreSQL (managed instance per service)
```

## Key Design Principles

1. **No expiry system** — child sites are permanently attached until explicitly deleted
2. **Wizard-based onboarding** — guided flow for adding child websites
3. **Default-Viewer signup** — new accounts always start as USER + VIEWER
4. **Button Name** — each child site has a short sidebar label (≤24 chars)
5. **Database-per-service** — no cross-service database access
6. **Dev/Prod isolation** — different databases, secrets, and auth policies
7. **Audit everything** — all important actions are logged

## Permission Model

```
System Roles:    SUPERADMIN > ADMIN > USER
Resource Perms:  MANAGE_ACCESS > DELETE > EDIT > VIEW > VIEWER (default)
```

New signups always receive:
- System Role: `USER`
- Default Permission: `VIEWER` (platform-wide)
- No EDITOR/DELETE/MANAGE_ACCESS (must be explicitly granted per resource)
