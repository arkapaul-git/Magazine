#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# manage.sh — Magazine Platform Management Script (Linux/macOS)
#
# Usage:
#   ./scripts/manage.sh start     Start the platform
#   ./scripts/manage.sh stop      Stop the platform
#   ./scripts/manage.sh restart   Restart the platform
#   ./scripts/manage.sh status    Show container status
#   ./scripts/manage.sh logs      Tail container logs
#   ./scripts/manage.sh build     Rebuild the Docker image
#   ./scripts/manage.sh clean     Stop and remove everything
#   ./scripts/manage.sh health    Check container health
#   ./scripts/manage.sh shell     Open a shell in the container
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ─── Config ───
PROJECT_NAME="magazine-platform"
COMPOSE_FILE="docker-compose.yml"
CONTAINER_NAME="magazine-platform"
PORT=8080

# ─── Navigate to project root ───
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# ─── Helper Functions ───
print_banner() {
    echo -e "${CYAN}"
    echo "  ╔════════════════════════════════════════════╗"
    echo "  ║       📰  Magazine Platform Manager       ║"
    echo "  ╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "  → https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        echo "  → https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Detect docker compose command (v1 vs v2)
get_compose_cmd() {
    if docker compose version &> /dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose &> /dev/null 2>&1; then
        echo "docker-compose"
    else
        print_error "Docker Compose not found."
        exit 1
    fi
}

is_running() {
    docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" -q 2>/dev/null | grep -q .
}

# ─── Commands ───
cmd_start() {
    print_banner
    check_docker
    local COMPOSE=$(get_compose_cmd)

    if is_running; then
        print_warning "Magazine Platform is already running."
        print_info "Access it at: ${BOLD}http://localhost:${PORT}${NC}"
        return
    fi

    print_info "Building and starting Magazine Platform..."
    $COMPOSE -f "$COMPOSE_FILE" up -d --build

    # Wait for health check
    echo -n "  Waiting for health check"
    for i in $(seq 1 15); do
        if is_running; then
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
            if [ "$health" = "healthy" ] || [ "$health" = "unknown" ]; then
                echo ""
                break
            fi
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    if is_running; then
        print_status "Magazine Platform is running!"
        print_info "Access it at: ${BOLD}http://localhost:${PORT}${NC}"
        echo ""
        print_info "Security features active:"
        echo "  • Rate limiting (10 req/s general, 2 req/s auth pages)"
        echo "  • Security headers (CSP, X-Frame-Options, HSTS-ready)"
        echo "  • Read-only filesystem"
        echo "  • Non-root container user"
        echo "  • Capability dropping"
        echo "  • Resource limits (1 CPU, 256MB RAM)"
    else
        print_error "Failed to start. Check logs with: $0 logs"
        exit 1
    fi
}

cmd_stop() {
    print_banner
    check_docker
    local COMPOSE=$(get_compose_cmd)

    if ! is_running; then
        print_warning "Magazine Platform is not running."
        return
    fi

    print_info "Stopping Magazine Platform..."
    $COMPOSE -f "$COMPOSE_FILE" down
    print_status "Magazine Platform stopped."
}

cmd_restart() {
    print_banner
    check_docker
    local COMPOSE=$(get_compose_cmd)

    print_info "Restarting Magazine Platform..."
    $COMPOSE -f "$COMPOSE_FILE" down
    $COMPOSE -f "$COMPOSE_FILE" up -d --build

    sleep 3
    if is_running; then
        print_status "Magazine Platform restarted successfully!"
        print_info "Access it at: ${BOLD}http://localhost:${PORT}${NC}"
    else
        print_error "Restart failed. Check logs with: $0 logs"
        exit 1
    fi
}

cmd_status() {
    print_banner
    check_docker

    if is_running; then
        print_status "Magazine Platform is ${GREEN}RUNNING${NC}"
        echo ""
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no healthcheck")
        print_info "Health: $health"
        print_info "URL: http://localhost:${PORT}"
    else
        print_warning "Magazine Platform is ${RED}STOPPED${NC}"
    fi
}

cmd_logs() {
    check_docker

    if ! docker ps -a --filter "name=$CONTAINER_NAME" -q | grep -q .; then
        print_error "No container found. Start the platform first."
        exit 1
    fi

    print_info "Showing logs (Ctrl+C to exit)..."
    docker logs -f "$CONTAINER_NAME" 2>&1
}

cmd_build() {
    print_banner
    check_docker
    local COMPOSE=$(get_compose_cmd)

    print_info "Rebuilding Docker image..."
    $COMPOSE -f "$COMPOSE_FILE" build --no-cache
    print_status "Image rebuilt successfully."
}

cmd_clean() {
    print_banner
    check_docker
    local COMPOSE=$(get_compose_cmd)

    print_warning "This will stop containers and remove images/volumes."
    read -p "  Continue? [y/N] " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $COMPOSE -f "$COMPOSE_FILE" down --rmi all --volumes --remove-orphans
        print_status "Cleaned up successfully."
    else
        print_info "Cancelled."
    fi
}

cmd_health() {
    check_docker

    if ! is_running; then
        print_error "Container is not running."
        exit 1
    fi

    echo ""
    print_info "Running security checks..."
    echo ""

    # Check response headers
    echo "  ─── Response Headers ───"
    curl -sI "http://localhost:${PORT}" 2>/dev/null | grep -iE "^(x-frame|x-content|x-xss|content-security|referrer-policy|permissions-policy|cross-origin|server)" || echo "  (Could not fetch headers)"
    echo ""

    # Check health endpoint
    local health=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no healthcheck")
    print_info "Container health: $health"

    # Check resource usage
    echo ""
    echo "  ─── Resource Usage ───"
    docker stats "$CONTAINER_NAME" --no-stream --format "  CPU: {{.CPUPerc}} | Memory: {{.MemUsage}} | Net I/O: {{.NetIO}}"
}

cmd_shell() {
    check_docker

    if ! is_running; then
        print_error "Container is not running."
        exit 1
    fi

    print_info "Opening shell in container (type 'exit' to leave)..."
    docker exec -it "$CONTAINER_NAME" /bin/sh
}

cmd_help() {
    print_banner
    echo -e "${BOLD}Usage:${NC} $0 <command>"
    echo ""
    echo -e "${BOLD}Commands:${NC}"
    echo "  start     Build and start the platform"
    echo "  stop      Stop the platform"
    echo "  restart   Stop and restart the platform"
    echo "  status    Show current status"
    echo "  logs      Tail container logs"
    echo "  build     Rebuild the Docker image"
    echo "  clean     Remove containers, images, volumes"
    echo "  health    Run security & health checks"
    echo "  shell     Open shell in the container"
    echo "  help      Show this help message"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  $0 start           # Start the platform on port $PORT"
    echo "  $0 restart         # Rebuild and restart"
    echo "  $0 logs            # View live logs"
    echo "  $0 health          # Check security headers"
    echo ""
}

# ─── Main ───
case "${1:-help}" in
    start)   cmd_start   ;;
    stop)    cmd_stop    ;;
    restart) cmd_restart ;;
    status)  cmd_status  ;;
    logs)    cmd_logs    ;;
    build)   cmd_build   ;;
    clean)   cmd_clean   ;;
    health)  cmd_health  ;;
    shell)   cmd_shell   ;;
    help|--help|-h) cmd_help ;;
    *)
        print_error "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac
