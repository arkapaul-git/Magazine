# Parent Platform + Permanently Attached Child Websites

## Architecture v2 — Landing Page, Nav-Button Naming, Default-Viewer Signup, Dev/Prod Separation

Stack: **React** (frontend), **Node.js** (backend microservices), **SQLite** (development databases), **PostgreSQL** (production databases).

---

## 1. What Changed From v1

This version keeps every principle from the original document — no expiry system,
permanent attachment until explicit delete, wizard-based onboarding, microservices
under the hood, permission-controlled deletion, audit history retained — and adds:

1. **Nav-button naming step** in the "Add Child Website" wizard. The admin types a
   short label; that label becomes the button/menu entry in the parent dashboard
   sidebar under which the entire child site is reachable.
2. **Public Landing Page** — unauthenticated marketing/info page describing the
   magazines on the platform, with **Sign Up** and **Sign In** entry points.
3. **Default-Viewer signup rule** — every new account created through public
   sign-up starts with the system role `USER` and zero resource permissions
   above `VIEWER` on any resource. Nothing is editable until an Admin/SuperAdmin
   explicitly grants `EDITOR` or higher on a specific magazine, post, or child site.
4. **Dev vs Production separation** — a documented split of database, auth
   configuration, and data layer per environment, so local development never
   touches production data or production secrets.

---

## 2. High-Level Architecture (Updated)

```text
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
        |               |                 |         +------+------+
        v               v                 v                |
  LANDING DB       AUTH DB           USER DB        PERMISSION DB
  (public magazine
   summaries only)

             +--------------------------------------------+
             |                    |                        |
             v                    v                        v
        +---------+          +---------+             +-----------+
        |MAGAZINE |          |  POST   |             | CHILD SITE|
        |SERVICE  |          | SERVICE |             | SERVICE   |
        +----+----+          +----+----+             +-----+-----+
             |                    |                        |
             v                    v                        v
        MAGAZINE DB           POST DB               CHILD SITE DB
                                                            |
                                                            v
                                                 +----------------------+
                                                 |  CONNECTION SERVICE  |
                                                 +----------+-----------+
                                                            |
                                              +-------------+-------------+
                                              |                           |
                                              v                           v
                                    +-------------------+       +----------------+
                                    |  ACCESS/GATEWAY   |       | SITE VALIDATOR |
                                    +---------+---------+       +----------------+
                                              |
                       +----------------------+----------------------+
                       |            |            |                   |
                       v            v            v                   v
                  [Nav Btn:    [Nav Btn:    [Nav Btn:            [Nav Btn:
                   "Sports"]    "Tech"]      "Kids Zone"]         custom label]
                   Child A      Child B      Child C              Child N

             All important actions
                     |
                     v
              +--------------+
              | AUDIT SERVICE|
              +------+-------+
                     |
                     v
                  AUDIT DB

      Async system events
                     |
                     v
              +--------------+
              | MESSAGE      |
              | BROKER       |
              +--------------+
```

Every service above is a Node.js service. Each has its own database, and each
database exists twice per deployment: once as **SQLite** for local development,
once as **PostgreSQL** for production. See Section 9 for exact wiring.

---

## 3. Public Landing Page (New)

The landing page is the **only unauthenticated surface** of the platform. It is
served by a new, thin **Landing Service** that reads read-only, publicly-safe
summaries only — it never touches the real Magazine DB, Auth DB, or any private
data directly.

### 3.1 Purpose

- Explain what the platform/magazines are, for visitors who are not logged in.
- Show a public catalog of magazines (title, cover, short description) —
  no gated content, no full post bodies.
- Provide **Sign Up** and **Sign In** call-to-actions.
- Nothing on this page requires authentication to view.

### 3.2 Layout

```text
--------------------------------------------------------
   [ Logo ]     Home   Magazines   About        [Sign In] [Sign Up]
--------------------------------------------------------

        Welcome to <Platform Name>

        Discover magazines on sports, tech, lifestyle,
        and more — all in one place.

        [ Browse Magazines ]   [ Create Free Account ]

--------------------------------------------------------
   Featured Magazines

   [Cover] Tech Weekly        [Cover] Sports Daily
   Short public description   Short public description
   [ Learn More ]             [ Learn More ]

   [Cover] Kids Zone
   Short public description
   [ Learn More ]

--------------------------------------------------------
   Why sign up?
   - Save favorite magazines
   - Get notified of new posts
   - Access exclusive child-site content once granted

              [ Sign Up Free ]
--------------------------------------------------------
   Footer: About | Contact | Terms | Privacy
--------------------------------------------------------
```

"Learn More" opens a public magazine detail view (title, description, cover,
publisher, list of public post titles) — still no login required. Actually
reading a full post, or opening any child website, requires Sign In.

### 3.3 Landing Service Responsibilities

- Serve the marketing page and public magazine catalog.
- Serve public magazine detail pages.
- Route "Sign Up" → Auth Service registration flow.
- Route "Sign In" → Auth Service login flow.
- Cache public magazine summaries (via Redis) so it never hammers the
  Magazine Service DB directly on every page view.

### 3.4 Landing Service Data Flow

```text
Visitor (not logged in)
      |
      v
Landing Service  ------>  Redis cache (public magazine summaries)
      |                          ^
      | cache miss               |
      v                          |
Magazine Service  ---------------+
(returns only public-safe fields:
 id, title, cover_url, short_description)

Visitor clicks "Sign Up"
      |
      v
Auth Service (registration endpoint)
      |
      v
New account created --> System Role = USER
                     --> Default Resource Permission = VIEWER only
                     --> No EDITOR / DELETE / MANAGE_ACCESS on anything
```

The Landing Service never exposes: post bodies, child-site URLs, internal IDs
beyond what's needed for routing, user data, or anything requiring auth.

---

## 4. Default-Viewer Signup Rule (New)

This is a hard rule enforced in two places: the Auth Service (on account
creation) and the Role & Permission Service (on first permission check).

### 4.1 Rule

```text
Every new account created via public Sign Up:

  System Role         = USER          (never Admin/SuperAdmin)
  Default Permission  = VIEWER        (on platform-wide default only)
  Editor/Delete/Manage = NONE          (must be explicitly granted per-resource)
```

A fresh signup can browse the landing page, sign in, and view whatever an Admin
has chosen to make visible to `USER` + `VIEWER` by default (e.g. public
magazines). They **cannot** edit posts, cannot manage child sites, and cannot
see any child site that has not been explicitly shared with them, until an
Admin/SuperAdmin grants elevated permission on a specific resource.

### 4.2 Enforcement Flow

```text
POST /auth/signup
      |
      v
Auth Service creates User record
      |
      v
Auth Service emits USER_CREATED event
      |
      v
Message Broker
      |
      v
Role & Permission Service consumes USER_CREATED
      |
      v
Creates default permission row:
   user_id: <new user>
   resource_type: PLATFORM_DEFAULT
   permission: VIEWER
      |
      v
No EDITOR, DELETE, or MANAGE_ACCESS row is ever created automatically.
```

### 4.3 Elevating a Viewer

Only an Admin/SuperAdmin action can change this, and it is always scoped to a
specific resource — never a blanket upgrade to every resource.

```text
Admin selects User X
      |
      v
Admin selects Resource (Magazine A / Post B / Child Site C)
      |
      v
Admin assigns EDITOR (or VIEW/EDIT/DELETE/MANAGE_ACCESS for child sites)
      |
      v
Permission Service writes scoped permission row
      |
      v
Audit Service logs PERMISSION_CHANGED
```

This mirrors the existing "Resource Permissions" model from v1 (Section 7 /
Section 22 of the original document) — the new part is simply that Viewer is
now the guaranteed, enforced starting point for every signup, not just a
convention.

---

## 5. "Add Child Website" Wizard — Updated with Nav-Button Name Field

The wizard keeps the original three-scenario flow (Existing Website / Create
New Website through the platform) and adds one new required field:
**Button Name** — the label shown in the parent dashboard's navigation, under
which the entire child site becomes accessible.

### 5.1 Screen 1 — Website Details (Updated)

```text
--------------------------------------
        Add Child Website
--------------------------------------

Website Name
[ My New Website                  ]

Website URL
[ https://example.com             ]

Button Name (shown in the sidebar menu)
[ e.g. "Sports Hub"               ]
   ^ This is the label users will click
     to open this site. Keep it short.

Logo
[ Upload Logo ]

Description
[ Optional description            ]

              [ Continue ]
--------------------------------------
```

- **Website Name** = internal/administrative name (used in admin lists, audit
  logs, search).
- **Button Name** = the *display label* on the actual nav/menu button end
  users click. These are intentionally separate fields — an admin might name
  the record "Acme Corp External Blog v2 (2026)" internally, but want the
  button to simply say "Blog".
- Button Name is required, max ~24 characters (enforced client + server side)
  so it fits cleanly in a sidebar item.
- Button Name uniqueness is checked within the parent's dashboard nav
  namespace — two child sites can share a Website Name pattern, but not an
  identical visible Button Name, to avoid confusing menu duplicates.

### 5.2 Screen 2 — Choose Connection Type (unchanged from v1)

```text
How do you want to connect?

( ) Connect an existing website

( ) Create a new website through this platform
```

### 5.3 Result — Sidebar Nav Entry

Once `Status = ACTIVE`, the Button Name appears as a clickable entry in the
dashboard sidebar, scoped to whichever users/roles have `VIEW` permission on
that child site.

```text
--------------------------------------
  PARENT DASHBOARD
--------------------------------------
  Home
  Magazines
  Posts
  --------------------------------
  Child Sites
    • Sports Hub          <-- Button Name (Child A)
    • Tech Corner         <-- Button Name (Child B)
    • Kids Zone           <-- Button Name (Child C)
  --------------------------------
  Admin
  Settings
--------------------------------------
```

Clicking a Button Name routes through the Access Gateway (permission check +
site-active check), exactly as in the original Section 19 flow, before
opening the child site.

### 5.4 Child Site Data Model — Updated Field

```text
CHILD_SITES

id
name                -- internal/admin name
button_name          -- NEW: sidebar/nav label, required, <=24 chars
url
description
logo_url
owner_id
status
connection_type
connection_id
created_by
created_at
updated_at
deleted_at
```

`button_name` is owned by the Child Site Service and versioned like any other
editable field — an Editor with `EDIT` permission on that child site can
rename the button later without re-running the connection flow.

---

## 6. Updated Sitemap / User Journeys

### 6.1 Unauthenticated Visitor

```text
Landing Page
   |
   +--> Browse public magazine catalog
   |
   +--> View a magazine's public detail page
   |
   +--> [Sign Up] --> Auth Service --> Account created as USER/VIEWER
   |
   +--> [Sign In] --> Auth Service --> Dashboard (if account exists)
```

### 6.2 Newly Signed-Up Viewer

```text
Sign Up
   |
   v
Dashboard (limited)
   |
   +--> View magazines/posts marked visible to VIEWER
   |
   +--> Open child sites explicitly shared with them (if any)
   |
   +--> Cannot: create/edit posts, add child sites, manage permissions
```

### 6.3 Admin

```text
Sign In
   |
   v
Dashboard (full admin nav)
   |
   +--> Add Website (wizard incl. Button Name)
   +--> Manage Users --> grant EDITOR/DELETE/MANAGE_ACCESS per resource
   +--> Manage Magazines / Posts
   +--> View Audit Log
```

---

## 7. Core Microservices (Updated List)

```text
1.  Landing Service          -- NEW: public marketing + catalog page
2.  API Gateway
3.  Authentication Service   -- login, logout, signup (defaults to VIEWER)
4.  User Service
5.  Role & Permission Service
6.  Magazine Service
7.  Post Service
8.  Child Site Service       -- now includes button_name
9.  Connection Service
10. Site Validator Service
11. Provisioning Service
12. Access Gateway
13. Audit Service
14. Notification Service
```

Responsibilities for services 2–14 are unchanged from the original document
(Sections 4–24). Only the Landing Service is new, and only the Child Site
Service's data model gained one field.

---

## 8. Environment Separation — Development vs Production (New)

### 8.1 Goals

- A developer can run the entire platform locally with **zero external
  dependencies** — no cloud DB, no shared secrets, no risk of touching real
  user data.
- Production remains fully isolated: its own databases, its own auth
  secrets, its own data.
- The same Node.js codebase runs in both environments — only configuration
  and the underlying database driver differ.

### 8.2 High-Level Split

```text
                    +---------------------------+
                    |     Node.js Service        |
                    | (same code, both envs)     |
                    +--------------+--------------+
                                   |
                     reads NODE_ENV / .env file
                                   |
              +--------------------+--------------------+
              |                                         |
              v                                         v
      NODE_ENV=development                     NODE_ENV=production
              |                                         |
              v                                         v
     +-----------------+                       +-----------------+
     |  SQLite          |                       |  PostgreSQL      |
     |  (file-based,     |                       |  (managed cloud, |
     |   local disk)     |                       |   e.g. RDS)      |
     +-----------------+                       +-----------------+
              |                                         |
     Local auth secrets                        Secrets from Secret
     (.env.development,                        Manager (Vault / AWS
      never committed)                          Secrets Manager / etc.)
              |                                         |
     Seeded/fake data only                      Real production data,
                                                  backed up, access-
                                                  controlled
```

### 8.3 Per-Service Environment Config

Every Node.js microservice uses the same pattern:

```text
/service-name
  /src
  .env.development     -- SQLite file path, dev-only JWT secret, seed flag
  .env.production       -- (never committed) populated at deploy time from
                            Secret Manager; PostgreSQL connection string
  knexfile.js / prisma  -- one config block per environment, e.g.:

    development: {
      client: 'sqlite3',
      connection: { filename: './dev.sqlite3' },
      useNullAsDefault: true
    },
    production: {
      client: 'pg',
      connection: process.env.DATABASE_URL,   // PostgreSQL
      pool: { min: 2, max: 10 }
    }
```

- **Dev DB (SQLite):** one `.sqlite3` file per service, stored on the
  developer's machine, gitignored, easily reset with a `db:reset` script that
  re-runs migrations + seed data.
- **Prod DB (PostgreSQL):** one managed PostgreSQL instance per service
  (database-per-service still applies — see Section 9), never reachable from
  a developer's laptop directly; access only through the deployed service or
  an approved, audited admin tunnel.

### 8.4 Auth Section Split

```text
Auth Service
   |
   +-- development
   |      - JWT signing secret: static dev value in .env.development
   |      - Token expiry: long (e.g. 7 days) for convenience
   |      - MFA: disabled by default
   |      - Password policy: relaxed (for fast local testing)
   |      - Users: seeded fake accounts (dev-admin, dev-viewer, etc.)
   |
   +-- production
          - JWT signing secret: pulled from Secret Manager, rotated
          - Token expiry: short-lived access token + refresh token
          - MFA: enforced for Admin/SuperAdmin roles
          - Password policy: strict (min length, breach-list check)
          - Users: real accounts only, created via Sign Up or Admin invite
```

Dev and prod auth databases are **completely separate** — a dev JWT can never
be validated against production, and vice versa, because each environment
signs with a different secret and points at a different Auth DB.

### 8.5 Data Section Split

```text
Data Layer
   |
   +-- development
   |      - SQLite file per service (dev.sqlite3)
   |      - Seed scripts create sample magazines, posts, one sample
   |        child site, and a few test users at each role/permission
   |        level (SuperAdmin, Admin, Editor, Viewer)
   |      - Safe to wipe/reset at any time (npm run db:reset)
   |      - No real user data, no real child-site URLs by default
   |
   +-- production
          - PostgreSQL instance per service, managed backups, point-in-
            time recovery enabled
          - Migrations applied via a controlled CI/CD pipeline only —
            never run ad hoc from a developer machine
          - Access restricted via least-privilege DB roles per service
          - Real data; subject to the same Audit Service logging as
            described in Section 23 of the original document
```

### 8.6 Deployment/Promotion Flow

```text
Developer writes code
      |
      v
Runs locally against SQLite (NODE_ENV=development)
      |
      v
Opens PR --> CI runs tests against a throwaway SQLite/PostgreSQL
             test DB (never the real dev or prod DB)
      |
      v
Merge --> CI/CD pipeline builds image
      |
      v
Deploy to Staging (PostgreSQL, staging Secret Manager values,
                    staging Auth DB — a third, staging-only environment
                    recommended but optional)
      |
      v
Manual/automated approval
      |
      v
Deploy to Production (PostgreSQL, production Secret Manager values,
                       production Auth DB)
```

### 8.7 Summary Table

```text
                | Development            | Production
----------------|-------------------------|---------------------------
Frontend        | React (npm start,       | React (built + served via
                | local dev server)        | CDN/static hosting)
Backend         | Node.js (nodemon,        | Node.js (containerized,
                | local, hot reload)        | orchestrated, autoscaled)
Database        | SQLite (file per        | PostgreSQL (managed
                | service, local disk)     | instance per service)
Auth secrets    | .env.development,        | Secret Manager, rotated
                | static, never committed   |
Auth policy     | Relaxed, MFA off          | Strict, MFA on for
                |                            | Admin/SuperAdmin
Data            | Seeded fake data          | Real, backed-up, audited
                |                            | data
Access          | Local machine only        | Least-privilege, network-
                |                            | isolated, audited
```

---

## 9. Database Architecture (Updated — Database-Per-Service, Dual-Driver)

Every service keeps its own database, exactly as in the original document
(Section 25), but each one now exists in two driver forms:

```text
Landing Service        --> Landing DB        (SQLite dev / PostgreSQL prod)
Auth Service            --> Auth DB           (SQLite dev / PostgreSQL prod)
User Service             --> User DB           (SQLite dev / PostgreSQL prod)
Permission Service       --> Permission DB     (SQLite dev / PostgreSQL prod)
Magazine Service         --> Magazine DB       (SQLite dev / PostgreSQL prod)
Post Service              --> Post DB           (SQLite dev / PostgreSQL prod)
Child Site Service        --> Child Site DB     (SQLite dev / PostgreSQL prod)
Connection Service        --> Connection DB     (SQLite dev / PostgreSQL prod)
Audit Service              --> Audit DB          (SQLite dev / PostgreSQL prod)
```

No service ever reaches into another service's database directly, in either
environment. Cross-service reads always go through that service's API or
through events on the Message Broker — this rule doesn't change between dev
and prod.

---

## 10. Frontend Architecture (React)

```text
/frontend (React)
  /public
  /src
    /pages
      LandingPage.jsx        -- NEW: public, no auth required
      SignUpPage.jsx          -- NEW: creates account, defaults to Viewer
      SignInPage.jsx
      DashboardPage.jsx
      MagazineListPage.jsx
      MagazineDetailPage.jsx
      PostPage.jsx
      ChildSiteAddWizard.jsx  -- UPDATED: includes Button Name field
      ChildSiteView.jsx       -- opened via nav button, routed through
                                  Access Gateway
      AdminUsersPage.jsx
      AuditLogPage.jsx
    /components
      SidebarNav.jsx          -- UPDATED: renders one entry per child
                                  site using button_name
      PublicMagazineCard.jsx  -- NEW: landing page magazine card
      PermissionGuard.jsx     -- wraps routes/components, checks
                                  role+permission before rendering
    /services
      api.js                  -- Axios/fetch wrapper, points at
                                  API Gateway URL (env-specific)
    /context
      AuthContext.jsx          -- holds current user, role, permissions
  .env.development             -- REACT_APP_API_URL=http://localhost:PORT
  .env.production               -- REACT_APP_API_URL=https://api.parent.com
```

`SidebarNav.jsx` fetches the current user's visible child sites from the
Child Site Service (filtered by permission) and renders each one's
`button_name` as a nav item — this is the direct frontend implementation of
Section 5.3 above.

---

## 11. Security Rules (Unchanged, Restated)

The frontend is still never trusted for authorization — every backend call
independently re-checks role + resource permission, exactly as described in
the original document's Section 37. This applies identically in dev and
prod; the only difference is that dev uses relaxed policy *for convenience of
testing*, never as a reason to skip the check itself. The permission check
code path is identical in both environments — only secrets, token lifetimes,
and MFA enforcement differ.

---

## 12. Final Summary

```text
PARENT PLATFORM
│
├── Frontend (React)
│   ├── Public Landing Page          <-- NEW
│   ├── Sign Up / Sign In            <-- defaults every new user to Viewer
│   ├── User Portal
│   ├── Admin Portal
│   └── SuperAdmin Portal
│
├── API Gateway
│
├── Landing Service                  <-- NEW
├── Authentication Service           <-- enforces default-Viewer signup
├── User Service
├── Role & Permission Service        <-- writes default VIEWER row on signup
├── Magazine Service
├── Post Service
├── Child Site Service                <-- data model now includes button_name
├── Connection Service
├── Site Validator Service
├── Provisioning Service
├── Access Gateway                    <-- routes clicks on nav buttons
├── Audit Service
└── Notification Service
│
├── Message Broker
├── Redis (landing-page cache, sessions)
├── Secret Manager (prod only)
├── Object Storage (logos, covers)
├── Monitoring / Logging / Tracing
│
├── Environments
│   ├── Development  --> SQLite + relaxed auth + seeded data
│   └── Production    --> PostgreSQL + strict auth + real, audited data
│
└── CHILD WEBSITES (each reachable via its own sidebar Button Name)
    ├── Child A  ("Sports Hub")
    ├── Child B  ("Tech Corner")
    ├── Child C  ("Kids Zone")
    └── Child N  (custom label)
```

## Final Recommendation

Keep the original document's seven principles (Section 41) exactly as they
are — they remain correct. Add three more:

**Principle 8** — Every new account starts as `USER` + `VIEWER`, everywhere,
with no exceptions; elevation is always explicit, scoped, and audited.

**Principle 9** — The public landing page is read-only and cached; it must
never become a path to private data or a bypass around authentication.

**Principle 10** — Development and production are hard-isolated at the data
and secret layer (SQLite + local secrets vs. PostgreSQL + Secret Manager),
even though the application code is identical, so that local development
can never accidentally read, write, or leak real production data.
