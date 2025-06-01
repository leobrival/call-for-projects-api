@echo off
setlocal EnableDelayedExpansion

echo [ info ] checking docker status...

REM Fonction pour verifier si Docker est en cours d'execution
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [ info ] docker is running
    goto :docker_running
)

echo [ warn ] docker not running, attempting to start...

REM Verifier si Docker Desktop est installe
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    echo [ info ] starting docker desktop...
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
) else if exist "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe" (
    echo [ info ] starting docker desktop...
    start "" "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
) else (
    echo [ error ] docker desktop not found
    echo [ info ] please install docker desktop
    exit /b 1
)

echo [ info ] waiting for docker to start...
set timeout=30
:wait_loop
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [ info ] docker started successfully
    goto :docker_running
)
if %timeout% leq 0 (
    echo [ error ] timeout: docker failed to start
    exit /b 1
)
echo .
timeout /t 2 /nobreak >nul
set /a timeout=%timeout%-1
goto :wait_loop

:docker_running
REM Verifier que docker-compose.yml existe
if not exist "docker-compose.yml" if not exist "compose.yml" (
    echo [ error ] docker-compose.yml not found
    exit /b 1
)

echo [ info ] starting docker services...
docker compose up -d

if %errorlevel% equ 0 (
    echo [ info ] docker services started
) else (
    echo [ error ] failed to start docker services
    exit /b 1
) 