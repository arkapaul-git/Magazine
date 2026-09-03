# Magazine Platform — Documentation

## Overview

The Magazine Platform is a public-facing website that implements the **Parent Platform + Permanently Attached Child Websites** architecture described in `parent_child_site_architecture_v2.md`. It provides a centralized hub for discovering, reading, and managing curated magazines across multiple topics, with the ability to attach child websites that appear as navigation buttons in the dashboard sidebar.

This website is a **frontend prototype** built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools. It demonstrates the UI/UX layer and layout patterns before committing to the full React + Node.js stack described in the architecture document.

---

## Architecture Mapping

| Architecture Section | Implemented Page | Status |
|---|---|---|
| §3 Public Landing Page | `index.html` | ✅ Complete |
| §3.2 Sign Up / Sign In | `pages/signup.html`, `pages/signin.html` | ✅ Complete |
| §4 Default-Viewer Signup Rule | Viewer notice on signup form | ✅ Complete |
| §5.1 Add Child Website Wizard | `pages/add-child-site.html` | ✅ Complete |
| §5.3 Sidebar Nav Entry | `pages/dashboard.html` sidebar | ✅ Complete |
| §6.1 Unauthenticated Visitor Journey | Landing → Browse → Sign Up/In | ✅ Complete |
| §10 Frontend Architecture | Full page + component structure | ✅ Complete |

---

## Features

### Landing Page (`index.html`)
- Full-viewport hero with 3-image background slideshow
- Animated statistics badges
- Featured magazines grid (Tech Weekly, Sports Daily, Kids Zone)
- "Why Sign Up?" benefits section with animated icons
- CTA banner with dual call-to-action
- Dark-themed footer with social links

### Sign Up (`pages/signup.html`)
- Viewer-notice banner explaining default permissions
- Form with real-time client-side validation
- Name, email, password, confirm password fields
- Terms & Privacy checkbox

### Sign In (`pages/signin.html`)
- Email + password login form
- Forgot password link
- Remember me option
- Demo button to view dashboard

### Dashboard (`pages/dashboard.html`)
- **Sidebar navigation** with:
  - Main nav: Home, Magazines, Posts
  - **Child Sites section**: Sports Hub, Tech Corner, Kids Zone (per §5.3)
  - Admin nav: Users, Add Website, Audit Log, Settings
  - User profile with role badge
- Welcome banner with maroon gradient
- 4-column stat cards
- Recent magazines list with thumbnails

### Magazine Detail (`pages/magazine-detail.html`)
- Hero cover image with overlay
- Metadata bar (publisher, article count, reader count)
- Post list with numbered entries and lock icons (gated content)
- CTA to sign up / sign in

### Add Child Website Wizard (`pages/add-child-site.html`)
- 3-step wizard with step indicators
- Step 1: Website Name, URL, **Button Name** (with live sidebar preview), Description
- Step 2: Connection type selection (existing website / platform-created)
- Step 3: Review and confirm

---

## Design System

### Color Palette
Adapted from [rkmvmfamily.in](https://www.rkmvmfamily.in/?page=landing):

| Color | Hex | CSS Variable | Usage |
|---|---|---|---|
| Saffron | `#F97316` | `--color-saffron` | Primary accent, CTAs, badges |
| Saffron Dark | `#C2410C` | `--color-saffron-dark` | Hover states, gradients |
| Saffron Light | `#FFEDD5` | `--color-saffron-light` | Light backgrounds |
| Maroon | `#5E1A0C` | `--color-maroon` | Deep headings, branding |
| Cream | `#FCFAF5` | `--color-cream` | Page background |
| Dark | `#0F172A` | `--color-dark` | Hero/footer backgrounds |
| Text | `#334155` | `--color-text` | Body text |
| Text Muted | `#64748B` | `--color-text-muted` | Secondary text |

### Typography
| Font | Family | Usage |
|---|---|---|
| Playfair Display | Serif | Headings, display text |
| Poppins | Sans-serif | Body text, UI elements |
| Rajdhani | Sans-serif | Accent labels, badges, stats |

### Component Library
- **Buttons**: Primary (saffron gradient), Secondary, Ghost, Glass, Icon
- **Cards**: Magazine card, Stat card, Feature card, Glass card
- **Forms**: Input fields with icons, validation states, checkboxes
- **Badges**: Role (SuperAdmin, Admin, Editor, Viewer), Status, Permission
- **Navigation**: Main nav with animated underline, Mobile drawer, Breadcrumbs
- **Hero**: Full-viewport with slideshow, overlays, scroll indicator
- **Modal**: Dialog with backdrop blur
- **Sidebar**: Collapsible with child-site nav buttons

---

## How to Run

### Option 1: Docker (Recommended for Production)
```bash
# Windows
scripts\manage.bat start

# Linux / macOS
chmod +x scripts/manage.sh
./scripts/manage.sh start
```
Access at **http://localhost:8080**. Includes Nginx security hardening, rate limiting, and all HTTP security headers.

### Option 2: Local Dev Server
```bash
# Using npx (no install needed)
npx serve .

# Or using Python
python -m http.server 8080

# Or using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

### Option 3: Direct File Open
Simply open `index.html` in any modern browser. Note: ES modules require a local server.

---

## Security

The platform implements a **defense-in-depth** security strategy:

| Layer | Protection |
|---|---|
| **Infrastructure** | Docker hardening (read-only FS, non-root, dropped capabilities, resource limits) |
| **Transport** | HTTP security headers (CSP, X-Frame-Options, HSTS-ready, Referrer-Policy, etc.) |
| **Application** | Input sanitization, CSRF tokens, rate limiting, XSS prevention, open redirect blocking |
| **Network** | Nginx rate limiting (10 req/s general, 2 req/s auth), connection limits, blocked paths |

See [`docs/SECURITY.md`](SECURITY.md) for the full threat model and configuration details.

---

## File Structure Reference

```
Magazine/
├── index.html              # Landing page
├── main.css                # CSS aggregator (@imports all)
├── app.js                  # JS entry point
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker service configuration
├── .dockerignore           # Docker build exclusions
│
├── pages/                  # HTML pages
├── base/                   # CSS foundation (variables, reset, typography)
├── layout/                 # CSS layout (header, footer, sidebar, grid)
├── components/             # CSS components (buttons, cards, forms, hero)
├── styles/                 # Page-specific CSS
├── utilities/              # CSS utilities (spacing, display, responsive)
├── animations/             # CSS animations (transitions, hover, scroll-reveal)
├── modules/                # JS feature modules
├── data/                   # JSON demo data
├── utils/                  # JS helper functions (DOM helpers, security)
├── assets/                 # Images & icons
├── nginx/                  # Nginx configuration & security headers
├── scripts/                # Management scripts (manage.sh, manage.bat)
└── docs/                   # Documentation
```

---

## Management Scripts

Both `scripts/manage.sh` and `scripts/manage.bat` provide identical commands:

| Command | Description |
|---|---|
| `start` | Build Docker image and start the container |
| `stop` | Stop the running container |
| `restart` | Stop, rebuild, and restart |
| `status` | Show container status and health |
| `logs` | Tail container logs in real-time |
| `build` | Rebuild Docker image without starting |
| `clean` | Remove containers, images, and volumes |
| `health` | Verify security headers and resource usage |
| `shell` | Open shell inside the running container |

---

## Future Development Roadmap

1. **React Migration** — Convert HTML pages to React components per §10
2. **Node.js Backend** — Implement microservices per §7
3. **Authentication** — Connect Auth Service with JWT per §8.4
4. **Database Layer** — SQLite for dev, PostgreSQL for prod per §8.3
5. **Permission System** — Role & Permission Service per §4
6. **Real-time Features** — Message Broker for events per §4.2
7. **Dark Mode** — Complete dark theme CSS (tokens already defined)
8. **SSL/HTTPS** — Let's Encrypt certificates with auto-renewal
9. **CI/CD Pipeline** — Automated Docker builds and security scanning

