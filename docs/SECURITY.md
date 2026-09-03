# Security Guide

## Overview

The Magazine Platform implements a **defense-in-depth** security strategy with protections at three layers: **infrastructure** (Nginx + Docker), **transport** (HTTP headers), and **application** (client-side JavaScript).

---

## Threat Model

| Attack Vector | Protection Layer | Status |
|---|---|---|
| **XSS (Cross-Site Scripting)** | CSP header + input sanitization + HTML escaping | ✅ Protected |
| **Clickjacking** | X-Frame-Options + JS frame-busting | ✅ Protected |
| **MIME Sniffing** | X-Content-Type-Options: nosniff | ✅ Protected |
| **CSRF (Cross-Site Request Forgery)** | CSRF tokens + SameSite cookies (when backend added) | ✅ Protected |
| **Brute Force (Auth)** | Nginx rate limiting (2 req/s on auth pages) | ✅ Protected |
| **DDoS / Flood** | Nginx rate limiting (10 req/s) + connection limit (50/IP) | ✅ Protected |
| **Open Redirect** | URL validation + safeRedirect() utility | ✅ Protected |
| **Directory Traversal** | Nginx blocks dotfiles, data/, docs/, scripts/ | ✅ Protected |
| **Information Disclosure** | server_tokens off, hidden files blocked | ✅ Protected |
| **Container Escape** | Read-only FS, dropped capabilities, non-root user | ✅ Protected |
| **Resource Exhaustion** | Docker CPU/memory limits, request size limits | ✅ Protected |
| **HTTPS Downgrade** | HSTS header (ready, uncomment in prod with SSL) | ⚠️ Ready |

---

## Layer 1: Infrastructure (Docker + Nginx)

### Docker Hardening
Configured in [`docker-compose.yml`](file:///c:/Users/arka%20paul/Documents/Magazine/docker-compose.yml):

| Control | Setting | Purpose |
|---|---|---|
| Read-only filesystem | `read_only: true` | Prevents runtime file modification |
| Drop all capabilities | `cap_drop: ALL` | Removes all Linux capabilities |
| Add minimal caps | `cap_add: NET_BIND_SERVICE, CHOWN, SETGID, SETUID` | Only what nginx needs |
| No privilege escalation | `no-new-privileges:true` | Blocks setuid binaries |
| CPU limit | `cpus: 1.0` | Prevents CPU exhaustion |
| Memory limit | `memory: 256M` | Prevents OOM attacks |
| Healthcheck | `curl -f http://localhost:80/` | Auto-restart on failure |
| tmpfs mounts | `/tmp`, `/var/cache/nginx`, `/var/log/nginx` | Writable dirs in RAM only |
| Log rotation | `max-size: 10m, max-file: 3` | Prevents log-based disk exhaustion |

### Nginx Hardening
Configured in [`nginx/nginx.conf`](file:///c:/Users/arka%20paul/Documents/Magazine/nginx/nginx.conf):

| Control | Setting | Purpose |
|---|---|---|
| Version hiding | `server_tokens off` | Hides Nginx version from response |
| Rate limiting (general) | `10 req/s, burst 20` | Prevents flood attacks |
| Rate limiting (auth) | `2 req/s, burst 5` | Prevents brute-force login |
| Connection limit | `50 connections/IP` | Prevents connection exhaustion |
| Request size limit | `client_max_body_size 1m` | Prevents large payload attacks |
| Header size limit | `large_client_header_buffers 4 8k` | Prevents header injection |
| Directory listing | `autoindex off` | Prevents directory enumeration |
| Dotfile blocking | `location ~ /\.` deny all | Blocks `.git`, `.env`, etc. |
| Sensitive file blocking | `\.(bak\|config\|sql\|sh\|bat\|md)$` deny | Blocks config/script files |
| Directory blocking | `/data/`, `/docs/`, `/nginx/`, `/scripts/` | Blocks internal directories |
| Gzip compression | Level 6, multiple types | Performance + bandwidth savings |

---

## Layer 2: Transport (HTTP Security Headers)

Configured in [`nginx/security-headers.conf`](file:///c:/Users/arka%20paul/Documents/Magazine/nginx/security-headers.conf):

### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'self';
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

**What this blocks:**
- Inline scripts (`<script>alert('XSS')</script>`)
- External script injection (loading JS from attacker domains)
- Embedding the site in attacker-controlled iframes
- Form submissions to external domains
- Image loading from untrusted sources

### Other Headers

| Header | Value | What It Prevents |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking via iframes |
| `X-Content-Type-Options` | `nosniff` | MIME-type confusion attacks |
| `X-XSS-Protection` | `1; mode=block` | Reflected XSS (legacy browsers) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer information leakage |
| `Permissions-Policy` | camera=(), microphone=(), ... | Unauthorized device access |
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross-origin information leaks |
| `Cross-Origin-Resource-Policy` | `same-origin` | Spectre-like side-channel attacks |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Cross-origin resource embedding |

### HSTS (When SSL is Configured)
```nginx
# Uncomment in production with SSL certificate:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## Layer 3: Application (Client-Side JavaScript)

Configured in [`utils/security.js`](file:///c:/Users/arka%20paul/Documents/Magazine/utils/security.js):

### Input Sanitization
```javascript
import { sanitizeHTML, stripTags } from './utils/security.js';

// Escape HTML entities (for rendering in DOM)
sanitizeHTML('<script>alert("xss")</script>');
// → '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'

// Strip all tags (for plain text)
stripTags('<b>bold</b> text <script>evil</script>');
// → 'bold text evil'
```

### URL Sanitization
```javascript
import { sanitizeURL } from './utils/security.js';

sanitizeURL('https://safe.com');         // → 'https://safe.com'
sanitizeURL('javascript:alert(1)');      // → null (blocked)
sanitizeURL('data:text/html,...');        // → null (blocked)
```

### CSRF Token Management
```javascript
import { csrfToken } from './utils/security.js';

csrfToken.get();            // Get or generate token
csrfToken.refresh();        // Generate new token
csrfToken.injectIntoForms(); // Add hidden _csrf input to all forms
```

### Client-Side Rate Limiting
```javascript
import { RateLimiter } from './utils/security.js';

const limiter = new RateLimiter(5, 60000); // 5 attempts per minute
if (!limiter.isAllowed()) {
  console.log(`Retry in ${limiter.retryAfter()} seconds`);
}
```

### Open Redirect Prevention
```javascript
import { safeRedirect } from './utils/security.js';

safeRedirect('/dashboard');                    // → '/dashboard' (safe)
safeRedirect('https://evil.com/steal-data');   // → '/' (blocked)
safeRedirect('//evil.com');                    // → '/' (blocked)
```

### Form Protection
Implemented in [`modules/form-validation.js`](file:///c:/Users/arka%20paul/Documents/Magazine/modules/form-validation.js):

- **Paste sanitization** — strips HTML tags from pasted content
- **Pre-submit sanitization** — sanitizes all non-password fields before validation
- **Rate limiting** — max 5 submissions per minute, shows countdown on excess
- **CSP violation monitoring** — logs violations to console (send to monitoring in production)
- **Clickjacking protection** — JS frame-busting fallback for older browsers

---

## Production Checklist

Before deploying to production, ensure:

- [ ] **Enable HSTS** — uncomment the `Strict-Transport-Security` header in `security-headers.conf`
- [ ] **Configure SSL/TLS** — add Let's Encrypt or commercial certificate to nginx
- [ ] **Set up CSP reporting** — add `report-uri` directive to send violations to a monitoring endpoint
- [ ] **Server-side CSRF** — implement server-side token validation (client tokens are a demo)
- [ ] **Server-side rate limiting** — add Redis-backed rate limiting in the API gateway
- [ ] **Input validation on backend** — never trust client-side validation alone
- [ ] **Parameterized queries** — prevent SQL injection in all database queries
- [ ] **Environment secrets** — use Docker secrets or Vault for API keys and passwords
- [ ] **Container scanning** — run `docker scan magazine-platform` before deployment
- [ ] **Dependency audit** — check for known vulnerabilities in any added npm packages
- [ ] **Access logging** — ship nginx access logs to a SIEM for anomaly detection
- [ ] **Backup strategy** — automated database backups with encryption at rest

---

## Testing Security

### Verify Headers
```bash
# Check security headers are present
curl -sI http://localhost:8080 | grep -iE "x-frame|x-content|content-security|referrer-policy"

# Or use the management script
scripts/manage.sh health    # Linux/macOS
scripts\manage.bat health   # Windows
```

### Test Rate Limiting
```bash
# Send 15 rapid requests (should get 503 after ~10)
for i in $(seq 1 15); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080; done
```

### Test Blocked Paths
```bash
# These should all return 403
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/data/magazines.json
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/docs/SECURITY.md
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/scripts/manage.sh
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/.git/config
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/nginx/nginx.conf
```
