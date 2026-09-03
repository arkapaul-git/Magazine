# Magazine Platform

A modular, multi-page website implementing the **Parent Platform + Permanently Attached Child Websites** architecture. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools. Dockerized with a hardened Nginx server and defense-in-depth security.

## ✨ Features

- **Landing Page** with hero slideshow, featured magazines, and benefits section
- **Sign Up / Sign In** with real-time form validation and Viewer-notice banner
- **Dashboard** with sidebar navigation showing child-site nav buttons
- **Magazine Detail** with cover image, metadata, and gated post list
- **Add Child Site Wizard** — 3-step flow with Button Name field and live preview
- **Docker Deployment** with hardened Nginx, rate limiting, and security headers
- **Management Scripts** — `manage.sh` / `manage.bat` for start/stop/restart/health

## 🔒 Security

Defense-in-depth protection against common web attacks:

| Layer | Protection |
|---|---|
| **Infrastructure** | Docker hardening (read-only FS, non-root, dropped caps, resource limits) |
| **Transport** | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS-ready |
| **Application** | Input sanitization, CSRF tokens, rate limiting, XSS prevention |
| **Network** | Nginx rate limiting (10 req/s), connection limits, blocked sensitive paths |

## 🎨 Design

Color palette :
- **Saffron** (`#F97316`) — Primary accent
- **Maroon** (`#5E1A0C`) — Deep branding
- **Cream** (`#FCFAF5`) — Background

Fonts: Playfair Display, Poppins, Rajdhani

## 🚀 Quick Start

### Docker (Recommended)
```bash
# Windows
scripts\manage.bat start

# Linux / macOS
chmod +x scripts/manage.sh
./scripts/manage.sh start
```
Access at **http://localhost:8080**

### Local Development
```bash
npx serve .
```
Access at **http://localhost:3000**

### Management Commands
```bash
manage.sh start      # Build and start
manage.sh stop       # Stop the platform
manage.sh restart    # Rebuild and restart
manage.sh status     # Show container health
manage.sh logs       # Tail live logs
manage.sh health     # Verify security headers
```

## 📁 Project Structure

```
├── index.html          # Landing page
├── main.css            # CSS aggregator
├── app.js              # JS entry point
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker service config
├── pages/              # HTML pages (signup, signin, dashboard, etc.)
├── base/               # CSS foundation (variables, reset, typography)
├── layout/             # CSS layout (header, footer, sidebar, grid)
├── components/         # CSS components (buttons, cards, forms, hero)
├── styles/             # Page-specific CSS
├── utilities/          # CSS utilities
├── animations/         # CSS animations
├── modules/            # JS feature modules
├── data/               # JSON demo data
├── utils/              # JS helpers (DOM, security)
├── assets/             # Images & icons
├── nginx/              # Nginx config & security headers
├── scripts/            # Management scripts (manage.sh, manage.bat)
└── docs/               # Full documentation
```

## 📖 Documentation

- [Full Documentation](docs/DOCUMENTATION.md)
- [Architecture Summary](docs/ARCHITECTURE.md)
- [Design System Reference](docs/DESIGN-SYSTEM.md)
- [Page Map](docs/PAGE-MAP.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Security Guide](docs/SECURITY.md)
- [Docker & Deployment](docs/DOCKER.md)

## 🏗️ Architecture Reference

Based on `parent_child_site_architecture_v2.md` — a microservices architecture with React frontend, Node.js backend, SQLite (dev) / PostgreSQL (prod), and 14 core services.

## License

MIT
