@echo off
title PRISM Launcher
echo ========================================================
echo        PRISM - AI English Platform Launcher
echo ========================================================
echo.

echo [1/3] Menyalakan Database PostgreSQL via Docker...
docker compose up -d db
if %errorlevel% neq 0 (
    echo [PERINGATAN] Gagal menyalakan Docker db. Pastikan Docker Desktop sudah dibuka.
) else (
    echo [OK] PostgreSQL aktif di port 5433.
)
echo.

echo [2/3] Menyalakan Python AI Engine (Piper TTS & Generator)...
start "PRISM AI Engine (Port 8000)" cmd /k "cd /d D:\Coding\prism\ai-engine && .\.venv\Scripts\activate && uvicorn app.main:app --port 8000"
echo [OK] AI Engine berjalan di http://localhost:8000
echo.

echo [3/3] Menyalakan Next.js Web Application...
start "PRISM Web App (Port 3000)" cmd /k "cd /d D:\Coding\prism && pnpm dev"
echo [OK] Web App berjalan di http://localhost:3000
echo.

echo ========================================================
echo   Semua service PRISM sedang berjalan!
echo   Membuka browser ke http://localhost:3000 ...
echo ========================================================
timeout /t 4 /nobreak >nul
start http://localhost:3000
