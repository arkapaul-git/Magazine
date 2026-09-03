# Page Map

## Route Overview

| Page | File | Auth Required | Architecture Section |
|---|---|---|---|
| Landing | `index.html` | No | §3 Public Landing Page |
| Sign Up | `pages/signup.html` | No | §4 Default-Viewer Signup |
| Sign In | `pages/signin.html` | No | §3.2 Sign In |
| Dashboard | `pages/dashboard.html` | Yes (demo) | §5.3 Sidebar Nav |
| Magazine Detail | `pages/magazine-detail.html` | No (partial) | §3.2 Learn More |
| Add Child Site | `pages/add-child-site.html` | Yes (Admin) | §5.1 Wizard |

---

## Page Descriptions

### 1. Landing Page (`index.html`)

**Purpose**: The only unauthenticated surface. Explains the platform, shows a public catalog, and provides Sign Up/In entry points.

**Sections**:
1. **Hero** — Full-viewport with 3-image slideshow, headline, stats, dual CTA
2. **Featured Magazines** — 3 magazine cards (Tech Weekly, Sports Daily, Kids Zone)
3. **Why Sign Up?** — 3 benefit cards (Favorites, Notifications, Exclusive Content)
4. **CTA Banner** — "Ready to Dive In?" with Sign Up + Sign In
5. **Footer** — 4-column with brand, platform links, account links, resources

**User Journey**: Visitor → Browse → Click "Learn More" → Magazine Detail → Sign Up

---

### 2. Sign Up (`pages/signup.html`)

**Purpose**: Create a new account. Implements §4 Default-Viewer Signup Rule.

**Key Element**: **Viewer Notice Banner** — explains that new accounts start as `VIEWER` with limited permissions, and that an Admin must grant elevated access.

**Form Fields**: Full Name, Email, Password, Confirm Password, Terms checkbox

---

### 3. Sign In (`pages/signin.html`)

**Purpose**: Authenticate and access the dashboard.

**Key Elements**: Email/password form, Forgot Password link, Remember Me checkbox, Demo Dashboard button

---

### 4. Dashboard (`pages/dashboard.html`)

**Purpose**: Authenticated user's home. Implements §5.3 Sidebar Nav Entry.

**Sidebar Navigation**:
```
Home
Magazines (badge: 3)
Posts
────────────────
Child Sites
  • Sports Hub       ← button_name
  • Tech Corner      ← button_name
  • Kids Zone        ← button_name
────────────────
Users
Add Website
Audit Log
Settings
────────────────
[User: Arka Paul - Admin]
```

**Main Content**: Welcome banner, 4 stat cards, Recent magazines list

---

### 5. Magazine Detail (`pages/magazine-detail.html`)

**Purpose**: Public detail view of a single magazine. Shows title, cover, description, publisher, and post list. Actually reading a full post requires Sign In.

**Sections**: Breadcrumbs → Hero Cover → Meta Bar → Post List (with lock icons) → Sign Up CTA

---

### 6. Add Child Site Wizard (`pages/add-child-site.html`)

**Purpose**: Admin wizard to add a new child website. Implements §5.1 with the Button Name field.

**Steps**:
1. **Website Details** — Name, URL, Button Name (with live sidebar preview), Description
2. **Connection Type** — "Connect existing" or "Create new through platform"
3. **Confirm** — Review summary and submit

---

## Navigation Flow

```
Landing ──→ Sign Up ──→ Dashboard
  │                        │
  ├──→ Sign In ────────────┘
  │                        │
  ├──→ Magazine Detail     ├──→ Add Child Site Wizard
  │    (public view)       │
  │                        ├──→ Child Site: Sports Hub
  │                        ├──→ Child Site: Tech Corner
  │                        └──→ Child Site: Kids Zone
  │
  └──→ Footer Links
```
