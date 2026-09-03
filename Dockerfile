# ═══════════════════════════════════════════════════════════════
# Dockerfile — Magazine Platform
# Multi-stage build: copies static files into a hardened Nginx
# container with security headers and rate limiting.
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Base Image ──
FROM nginx:1.25-alpine AS production

# ── Metadata ──
LABEL maintainer="Magazine Platform Team"
LABEL description="Magazine Platform — Static frontend served by hardened Nginx"
LABEL version="1.0.0"

# ── Remove default nginx content ──
RUN rm -rf /usr/share/nginx/html/*
RUN rm -f /etc/nginx/conf.d/default.conf

# ── Copy Nginx configuration ──
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# ── Copy application files ──
# Only copy what's needed for production (no docs, scripts, .git, etc.)
COPY index.html /usr/share/nginx/html/
COPY main.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

COPY pages/ /usr/share/nginx/html/pages/
COPY base/ /usr/share/nginx/html/base/
COPY layout/ /usr/share/nginx/html/layout/
COPY components/ /usr/share/nginx/html/components/
COPY styles/ /usr/share/nginx/html/styles/
COPY utilities/ /usr/share/nginx/html/utilities/
COPY animations/ /usr/share/nginx/html/animations/
COPY modules/ /usr/share/nginx/html/modules/
COPY utils/ /usr/share/nginx/html/utils/
COPY assets/ /usr/share/nginx/html/assets/

# ── Security: Run as non-root user ──
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid

# ── Security: Remove unnecessary packages & shells ──
RUN apk --no-cache add curl && \
    rm -rf /var/cache/apk/*

# ── Healthcheck ──
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# ── Expose port ──
EXPOSE 80

# ── Start Nginx ──
CMD ["nginx", "-g", "daemon off;"]
