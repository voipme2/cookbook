@echo off
setlocal enabledelayedexpansion

echo 🍳 Starting The Trusted Palate Development Environment...

if "%1"=="" goto start
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
goto usage

:start
echo 🚀 Starting development environment...
docker-compose -f docker-compose.dev.yml up --build -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo ✅ Development environment is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 API: http://localhost:3001
echo 🗄️  Database: localhost:5432
echo.
echo 📋 Useful commands:
echo   View logs: docker-compose -f docker-compose.dev.yml logs -f
echo   Stop services: docker-compose -f docker-compose.dev.yml down
echo   Restart services: docker-compose -f docker-compose.dev.yml restart
goto end

:stop
echo 🛑 Stopping development environment...
docker-compose -f docker-compose.dev.yml down
echo ✅ Development environment stopped.
goto end

:restart
echo 🔄 Restarting development environment...
docker-compose -f docker-compose.dev.yml restart
echo ✅ Development environment restarted.
goto end

:logs
echo 📋 Showing logs...
docker-compose -f docker-compose.dev.yml logs -f
goto end

:clean
echo 🧹 Cleaning up development environment...
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
echo ✅ Development environment cleaned up.
goto end

:usage
echo Usage: %0 {start^|stop^|restart^|logs^|clean}
echo.
echo Commands:
echo   start   - Start the development environment (default)
echo   stop    - Stop the development environment
echo   restart - Restart all services
echo   logs    - View logs from all services
echo   clean   - Stop and clean up everything

:end 