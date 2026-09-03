# Development Guide

## Quick Start

### Prerequisites
- Any modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 15+)
- Optional: A local HTTP server for ES module support
- Optional: [Docker](https://docs.docker.com/get-docker/) (v20.10+) for containerized deployment

### Running Locally

**Simplest method** — open `index.html` directly in your browser.

**Recommended** — use a local server for full ES module support:

```bash
# Option 1: npx (no install needed)
npx serve .

# Option 2: Python
python -m http.server 8080

# Option 3: VS Code Live Server
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

**Docker** — for production-like deployment with security hardening:

```bash
# Windows
scripts\manage.bat start

# Linux / macOS
chmod +x scripts/manage.sh
./scripts/manage.sh start
```

See [`DOCKER.md`](DOCKER.md) for full Docker deployment guide.

---

## Project Structure

```
Magazine/
│
├── index.html              # Landing page (entry point)
├── main.css                # CSS aggregator
├── app.js                  # JS entry point
│
├── pages/                  # HTML files for each page
│   ├── signup.html
│   ├── signin.html
│   ├── dashboard.html
│   ├── magazine-detail.html
│   └── add-child-site.html
│
├── base/                   # CSS foundation
│   ├── variables.css       # Design tokens
│   ├── reset.css           # Universal reset
│   └── typography.css      # Font imports & type scale
│
├── layout/                 # CSS structural layout
│   ├── container.css
│   ├── grid.css
│   ├── header.css
│   ├── footer.css
│   └── sidebar.css
│
├── components/             # CSS reusable components
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   ├── badges.css
│   ├── nav.css
│   ├── modal.css
│   └── hero.css
│
├── styles/                 # Page-specific CSS
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── magazine-detail.css
│   └── wizard.css
│
├── utilities/              # CSS utility classes
│   ├── spacing.css
│   ├── display.css
│   └── responsive.css
│
├── animations/             # CSS animations
│   ├── transitions.css
│   ├── hover-effects.css
│   ├── scroll-reveal.css
│   └── loading.css
│
├── modules/                # JS feature modules
│   ├── header.js
│   ├── slideshow.js
│   ├── mobile-menu.js
│   ├── smooth-scroll.js
│   ├── scroll-reveal.js
│   ├── form-validation.js
│   ├── sidebar.js
│   ├── wizard.js
│   └── theme-toggle.js
│
├── data/                   # Static JSON demo data
│   ├── magazines.json
│   ├── child-sites.json
│   └── posts.json
│
├── utils/                  # JS helpers
│   ├── dom-helpers.js
│   └── security.js         # XSS, CSRF, sanitization, rate limiting
│
├── assets/                 # Static assets
│   ├── images/
│   │   ├── hero/           # Hero slideshow images
│   │   └── covers/         # Magazine cover art
│   └── icons/              # SVG icons (if needed)
│
├── nginx/                  # Nginx configuration
│   ├── nginx.conf          # Hardened server config
│   └── security-headers.conf # HTTP security headers
│
├── scripts/                # Management scripts
│   ├── manage.sh           # Linux/macOS management
│   └── manage.bat          # Windows management
│
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker service config
├── .dockerignore           # Docker build exclusions
│
└── docs/                   # Documentation
    ├── DOCUMENTATION.md
    ├── ARCHITECTURE.md
    ├── DESIGN-SYSTEM.md
    ├── PAGE-MAP.md
    ├── DEVELOPMENT.md      # (this file)
    ├── SECURITY.md         # Threat model & security guide
    └── DOCKER.md           # Docker deployment guide
```

---

## How to Add a New Page

1. **Create the HTML file** in `pages/`:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Page Title — Magazine Platform</title>
     <link rel="stylesheet" href="../main.css">
   </head>
   <body>
     <!-- Copy header from any existing page -->
     <!-- Your page content here -->
     <script type="module" src="../app.js"></script>
   </body>
   </html>
   ```

2. **Add page-specific CSS** (if needed) in `styles/your-page.css`

3. **Add the import** to `main.css`:
   ```css
   @import url('./styles/your-page.css');
   ```

4. **Update navigation** links in the header and sidebar as needed

---

## How to Add a New CSS Component

1. Create the CSS file in `components/your-component.css`
2. Add the `@import` to `main.css` in the Components section
3. Use the design tokens from `base/variables.css` for all values:
   - Colors: `var(--color-saffron)`, `var(--color-maroon)`, etc.
   - Spacing: `var(--space-4)`, `var(--space-8)`, etc.
   - Typography: `var(--font-display)`, `var(--text-lg)`, etc.
   - Shadows: `var(--shadow-md)`, etc.
   - Radii: `var(--radius-sm)`, etc.

---

## How to Add a New JS Module

1. Create the module in `modules/your-module.js`:
   ```javascript
   import { $ } from '../utils/dom-helpers.js';

   export function initYourModule() {
     const el = $('.your-element');
     if (!el) return; // Guard: don't run if element isn't on page
     // Your logic here
   }
   ```

2. Import and call it in `app.js`:
   ```javascript
   import { initYourModule } from './modules/your-module.js';
   // Inside onReady():
   initYourModule();
   ```

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| CSS files | kebab-case | `hover-effects.css` |
| CSS classes | kebab-case | `.magazine-card-cover` |
| CSS variables | `--kebab-case` | `--color-saffron-dark` |
| JS files | kebab-case | `form-validation.js` |
| JS functions | camelCase | `initFormValidation()` |
| JS exports | Named exports | `export function init...()` |
| HTML IDs | camelCase | `id="mainHeader"` |
| HTML data attrs | kebab-case | `data-wizard-next` |
| JSON keys | snake_case | `"button_name"` |

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 15+ |

Key features used: CSS Custom Properties, CSS Grid, ES Modules, IntersectionObserver, `backdrop-filter`.
