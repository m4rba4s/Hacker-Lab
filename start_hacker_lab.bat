@echo off
echo.
echo ==================================================
echo  🔥 HACKER LAB v2.0 - ELITE EDITION 🔥
echo ==================================================
echo  Запускаем HTTP сервер для ES6 модулей...
echo ==================================================
echo.

cd /d "%~dp0"

:: Проверяем, есть ли Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден! Установите Python с python.org
    echo.
    pause
    exit /b 1
)

echo ✅ Python найден
echo ⚡ Запускаем HTTP сервер на порту 8000...
echo.
echo 🌐 Откройте браузер и перейдите на:
echo    http://localhost:8000
echo.
echo 💡 Для остановки нажмите Ctrl+C
echo.

:: Автоматически открываем браузер через 2 секунды
start "" timeout 2 >nul && start http://localhost:8000

:: Запускаем HTTP сервер
python -m http.server 8000

echo.
echo Server остановлен.
pause
