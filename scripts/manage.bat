@echo off
REM ═══════════════════════════════════════════════════════════════
REM manage.bat — Magazine Platform Management Script (Windows)
REM
REM Usage:
REM   scripts\manage.bat start     Start the platform
REM   scripts\manage.bat stop      Stop the platform
REM   scripts\manage.bat restart   Restart the platform
REM   scripts\manage.bat status    Show container status
REM   scripts\manage.bat logs      Tail container logs
REM   scripts\manage.bat build     Rebuild the Docker image
REM   scripts\manage.bat clean     Stop and remove everything
REM   scripts\manage.bat health    Check container health
REM   scripts\manage.bat shell     Open a shell in the container
REM ═══════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM ─── Config ───
set "PROJECT_NAME=magazine-platform"
set "COMPOSE_FILE=docker-compose.yml"
set "CONTAINER_NAME=magazine-platform"
set "PORT=8080"

REM ─── Navigate to project root ───
pushd "%~dp0\.."

REM ─── Parse Command ───
if "%~1"=="" goto :help
if /i "%~1"=="start" goto :start
if /i "%~1"=="stop" goto :stop
if /i "%~1"=="restart" goto :restart
if /i "%~1"=="status" goto :status
if /i "%~1"=="logs" goto :logs
if /i "%~1"=="build" goto :build
if /i "%~1"=="clean" goto :clean
if /i "%~1"=="health" goto :health
if /i "%~1"=="shell" goto :shell
if /i "%~1"=="help" goto :help
if /i "%~1"=="--help" goto :help
if /i "%~1"=="-h" goto :help

echo [ERROR] Unknown command: %~1
goto :help

REM ═══════════════════════════════════════════════════════════════
REM                          COMMANDS
REM ═══════════════════════════════════════════════════════════════

:start
call :banner
call :check_docker

REM Check if already running
docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q >nul 2>&1
for /f %%i in ('docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q 2^>nul') do (
    echo [!] Magazine Platform is already running.
    echo [i] Access it at: http://localhost:%PORT%
    goto :end
)

echo [i] Building and starting Magazine Platform...
call :compose up -d --build

REM Wait for startup
echo     Waiting for container to start...
timeout /t 5 /nobreak >nul

REM Check if running
docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q >nul 2>&1
for /f %%i in ('docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q 2^>nul') do (
    echo.
    echo [OK] Magazine Platform is running!
    echo [i] Access it at: http://localhost:%PORT%
    echo.
    echo [i] Security features active:
    echo     * Rate limiting ^(10 req/s general, 2 req/s auth pages^)
    echo     * Security headers ^(CSP, X-Frame-Options, HSTS-ready^)
    echo     * Read-only filesystem
    echo     * Non-root container user
    echo     * Capability dropping
    echo     * Resource limits ^(1 CPU, 256MB RAM^)
    goto :end
)

echo [ERROR] Failed to start. Run: %~nx0 logs
goto :end

:stop
call :banner
call :check_docker

echo [i] Stopping Magazine Platform...
call :compose down
echo [OK] Magazine Platform stopped.
goto :end

:restart
call :banner
call :check_docker

echo [i] Restarting Magazine Platform...
call :compose down
call :compose up -d --build

timeout /t 5 /nobreak >nul

for /f %%i in ('docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q 2^>nul') do (
    echo [OK] Magazine Platform restarted successfully!
    echo [i] Access it at: http://localhost:%PORT%
    goto :end
)

echo [ERROR] Restart failed. Run: %~nx0 logs
goto :end

:status
call :banner
call :check_docker

for /f %%i in ('docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" -q 2^>nul') do (
    echo [OK] Magazine Platform is RUNNING
    echo.
    docker ps --filter "name=%CONTAINER_NAME%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo.
    for /f "tokens=*" %%h in ('docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME% 2^>nul') do (
        echo [i] Health: %%h
    )
    echo [i] URL: http://localhost:%PORT%
    goto :end
)

echo [!] Magazine Platform is STOPPED
goto :end

:logs
call :check_docker

echo [i] Showing logs (Ctrl+C to exit)...
docker logs -f %CONTAINER_NAME%
goto :end

:build
call :banner
call :check_docker

echo [i] Rebuilding Docker image...
call :compose build --no-cache
echo [OK] Image rebuilt successfully.
goto :end

:clean
call :banner
call :check_docker

echo [!] This will stop containers and remove images/volumes.
set /p "CONFIRM=    Continue? [y/N] "
if /i "!CONFIRM!"=="y" (
    call :compose down --rmi all --volumes --remove-orphans
    echo [OK] Cleaned up successfully.
) else (
    echo [i] Cancelled.
)
goto :end

:health
call :check_docker

echo.
echo [i] Running security checks...
echo.

echo     --- Response Headers ---
curl -sI "http://localhost:%PORT%" 2>nul | findstr /i "x-frame x-content x-xss content-security referrer-policy permissions-policy cross-origin server"
echo.

for /f "tokens=*" %%h in ('docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME% 2^>nul') do (
    echo [i] Container health: %%h
)
echo.

echo     --- Resource Usage ---
docker stats %CONTAINER_NAME% --no-stream --format "    CPU: {{.CPUPerc}} | Memory: {{.MemUsage}} | Net I/O: {{.NetIO}}"
goto :end

:shell
call :check_docker

echo [i] Opening shell in container (type 'exit' to leave)...
docker exec -it %CONTAINER_NAME% /bin/sh
goto :end

:help
call :banner
echo Usage: %~nx0 ^<command^>
echo.
echo Commands:
echo   start     Build and start the platform
echo   stop      Stop the platform
echo   restart   Stop and restart the platform
echo   status    Show current status
echo   logs      Tail container logs
echo   build     Rebuild the Docker image
echo   clean     Remove containers, images, volumes
echo   health    Run security ^& health checks
echo   shell     Open shell in the container
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 start           Start the platform on port %PORT%
echo   %~nx0 restart         Rebuild and restart
echo   %~nx0 logs            View live logs
echo   %~nx0 health          Check security headers
echo.
goto :end

REM ═══════════════════════════════════════════════════════════════
REM                        HELPER FUNCTIONS
REM ═══════════════════════════════════════════════════════════════

:banner
echo.
echo   ╔════════════════════════════════════════════╗
echo   ║       Magazine Platform Manager            ║
echo   ╚════════════════════════════════════════════╝
echo.
exit /b

:check_docker
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    echo     -^> https://docs.docker.com/get-docker/
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    exit /b 1
)
exit /b

:compose
REM Try docker compose (v2) first, fall back to docker-compose (v1)
docker compose version >nul 2>&1
if not errorlevel 1 (
    docker compose -f "%COMPOSE_FILE%" %*
    exit /b
)

where docker-compose >nul 2>&1
if not errorlevel 1 (
    docker-compose -f "%COMPOSE_FILE%" %*
    exit /b
)

echo [ERROR] Docker Compose not found.
echo     -^> https://docs.docker.com/compose/install/
exit /b 1

:end
popd
endlocal
