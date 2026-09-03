# Design System Reference

## Color Palette

### Primary — Saffron
| Swatch | Name | Hex | CSS Variable | Usage |
|---|---|---|---|---|
| 🟠 | Saffron 50 | `#FFF7ED` | `--color-saffron-50` | Lightest background |
| 🟠 | Saffron 100 | `#FFEDD5` | `--color-saffron-100` | Light badge background |
| 🟠 | Saffron 200 | `#FED7AA` | `--color-saffron-200` | Borders, accents |
| 🟠 | Saffron 300 | `#FDBA74` | `--color-saffron-300` | Dot indicators |
| 🟠 | Saffron 400 | `#FB923C` | `--color-saffron-400` | Hover accents |
| 🟠 | Saffron 500 | `#F97316` | `--color-saffron` | **Primary** |
| 🟠 | Saffron 600 | `#EA580C` | `--color-saffron-600` | Strong accent |
| 🟠 | Saffron 700 | `#C2410C` | `--color-saffron-dark` | Hover, gradients |
| 🟠 | Saffron 800 | `#9A3412` | `--color-saffron-800` | Deep accent |

### Secondary — Maroon
| Swatch | Name | Hex | CSS Variable |
|---|---|---|---|
| 🟤 | Maroon Light | `#8B2C16` | `--color-maroon-light` |
| 🟤 | Maroon | `#5E1A0C` | `--color-maroon` |
| 🟤 | Maroon Dark | `#3B0F05` | `--color-maroon-dark` |

### Neutrals
| Swatch | Name | Hex | CSS Variable |
|---|---|---|---|
| ⬜ | White | `#FFFFFF` | `--color-white` |
| 🟡 | Cream | `#FCFAF5` | `--color-cream` |
| 🟡 | Cream Dark | `#F3EFE0` | `--color-cream-dark` |
| ⬛ | Dark | `#0F172A` | `--color-dark` |
| ⬛ | Dark Muted | `#1E293B` | `--color-dark-muted` |

---

## Typography

### Font Stack
```css
--font-display: 'Playfair Display', 'Merriweather', serif;
--font-body:    'Poppins', 'Inter', sans-serif;
--font-accent:  'Rajdhani', sans-serif;
```

### Type Scale
| Token | Size | Usage |
|---|---|---|
| `--text-xs` | 12px | Captions, hints |
| `--text-sm` | 14px | Body small, labels |
| `--text-base` | 16px | Body text |
| `--text-lg` | 18px | Lead text |
| `--text-xl` | 20px | Card titles |
| `--text-2xl` | 24px | Section headings |
| `--text-3xl` | 30px | Page headings |
| `--text-4xl` | 36px | Display headings |
| `--text-5xl` | 48px | Hero title |

---

## Spacing Scale

Based on a 4px grid:
```
--space-1:  4px    --space-8:  32px
--space-2:  8px    --space-10: 40px
--space-3:  12px   --space-12: 48px
--space-4:  16px   --space-16: 64px
--space-5:  20px   --space-20: 80px
--space-6:  24px   --space-24: 96px
```

---

## Shadows

| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle input borders |
| `--shadow-sm` | Scrolled header |
| `--shadow-md` | Hover cards |
| `--shadow-lg` | Auth cards, modals |
| `--shadow-xl` | Mobile menu |
| `--shadow-glow` | Saffron hover glow |

---

## Border Radii

| Token | Size | Usage |
|---|---|---|
| `--radius-xs` | 4px | Inline code, focus ring |
| `--radius-sm` | 8px | Inputs, small cards |
| `--radius-md` | 16px | Cards, sections |
| `--radius-lg` | 28px | Buttons, badges |
| `--radius-full` | 9999px | Circles, pills |

---

## Components

### Buttons
- `.btn-primary` — Saffron gradient, white text, shadow
- `.btn-secondary` — White background, saffron border
- `.btn-ghost` — Transparent, text color
- `.btn-glass` — Frosted glass (for hero overlay)
- `.btn-icon` — Round icon-only button

### Cards
- `.magazine-card` — Cover image + body + footer
- `.stat-card` — Icon + large value + label
- `.feature-card` — Centered icon + title + text
- `.glass-card` — Dark glassmorphism (hero stats)

### Form Elements
- `.form-input` — Standard input with saffron focus ring
- `.form-input-wrapper` — Input with left icon
- `.form-checkbox` — Saffron-accent checkbox
- `.is-error` / `.is-valid` — Validation states

### Navigation
- `.main-nav` — Header links with animated underline
- `.nav-item` — Sidebar nav item with active indicator
- `.nav-child-site` — Child site nav button with dot
- `.breadcrumbs` — Page location breadcrumbs
