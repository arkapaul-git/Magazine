# Docker & Deployment Guide

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+ recommended)

---

## Quick Start

### Windows
```cmd
scripts\manage.bat start
```

### Linux / macOS
```bash
chmod +x scripts/manage.sh
./scripts/manage.sh start
```

The platform will be available at **http://localhost:8080**

---

## Management Commands

Both `manage.sh` (Linux/macOS) and `manage.bat` (Windows) support the same commands:

| Command | Description |
|---|---|
| `start` | Build the Docker image and start the container |
| `stop` | Stop the running container |
| `restart` | Stop, rebuild, and restart the container |
| `status` | Show container status, health, and URL |
| `logs` | Tail container logs in real-time (Ctrl+C to exit) |
| `build` | Rebuild the Docker image without starting |
| `clean` | Stop container and remove images/volumes (with confirmation) |
| `health` | Check security headers and resource usage |
| `shell` | Open a shell inside the running container |
| `help` | Show all available commands |

### Examples

```bash
# Start the platform
./scripts/manage.sh start

# Check if it's running and healthy
./scripts/manage.sh status

# View security headers
./scripts/manage.sh health

# View live logs
./scripts/manage.sh logs

# Restart after code changes
./scripts/manage.sh restart

# Stop everything
./scripts/manage.sh stop

# Full cleanup (remove images too)
./scripts/manage.sh clean
```

---

## Architecture

```
┌──────────────────────────────────────┐
│         Docker Container             │
│                                      │
│   ┌──────────────────────────────┐   │
│   │     Nginx (Alpine Linux)     │   │
│   │                              │   │
│   │  ┌────────────────────────┐  │   │
│   │  │   Security Headers     │  │   │
│   │  │   Rate Limiting        │  │   │
│   │  │   Gzip Compression     │  │   │
│   │  │   Static File Cache    │  │   │
│   │  └────────────────────────┘  │   │
│   │                              │   │
│   │  ┌────────────────────────┐  │   │
│   │  │   Static Files         │  │   │
│   │  │   (HTML/CSS/JS/Images) │  │   │
│   │  └────────────────────────┘  │   │
│   │                              │   │
│   └──────────────────────────────┘   │
│                                      │
│   Port 80 → Host Port 8080          │
│   Read-only filesystem               │
│   Non-root user                      │
│   Dropped capabilities               │
│   256MB memory limit                 │
└──────────────────────────────────────┘
```

---

## Docker Files

| File | Purpose |
|---|---|
| [`Dockerfile`](file:///c:/Users/arka%20paul/Documents/Magazine/Dockerfile) | Multi-stage build using nginx:alpine |
| [`docker-compose.yml`](file:///c:/Users/arka%20paul/Documents/Magazine/docker-compose.yml) | Service definition with security hardening |
| [`.dockerignore`](file:///c:/Users/arka%20paul/Documents/Magazine/.dockerignore) | Excludes docs, scripts, git from image |
| [`nginx/nginx.conf`](file:///c:/Users/arka%20paul/Documents/Magazine/nginx/nginx.conf) | Full nginx configuration |
| [`nginx/security-headers.conf`](file:///c:/Users/arka%20paul/Documents/Magazine/nginx/security-headers.conf) | Security response headers |

---

## Configuration

### Change the Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"   # Change 8080 to your desired port
```

Or edit the `PORT` variable in the management scripts.

### Add SSL/HTTPS

1. Place your certificate files in a `certs/` directory
2. Update `nginx/nginx.conf` to add a server block on port 443:
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate     /etc/nginx/certs/fullchain.pem;
       ssl_certificate_key /etc/nginx/certs/privkey.pem;
       # ... (copy location blocks from port 80 server)
   }
   ```
3. Mount the certs in `docker-compose.yml`:
   ```yaml
   volumes:
     - ./certs:/etc/nginx/certs:ro
   ```
4. Uncomment the HSTS header in `nginx/security-headers.conf`

### Resource Limits

Edit `docker-compose.yml` under `deploy.resources`:
```yaml
limits:
  cpus: "2.0"      # Max CPU cores
  memory: 512M     # Max memory
reservations:
  cpus: "0.5"      # Guaranteed CPU
  memory: 128M     # Guaranteed memory
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
./scripts/manage.sh logs

# Rebuild from scratch
./scripts/manage.sh clean
./scripts/manage.sh start
```

### Port already in use
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :8080

# Linux:
lsof -i :8080

# Change the port in docker-compose.yml
```

### Permission denied on manage.sh
```bash
chmod +x scripts/manage.sh
```

### Docker not running
Make sure Docker Desktop is started (Windows/macOS) or the Docker daemon is running (Linux):
```bash
sudo systemctl start docker
```
