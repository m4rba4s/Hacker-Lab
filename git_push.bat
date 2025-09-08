@echo off
echo ========================================
echo    RET Academy - Git Repository Setup
echo ========================================
echo.

echo [1/6] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Git init failed!
    pause
    exit /b 1
)

echo [2/6] Setting up Git user (if needed)...
git config user.name "mayhem" 2>nul
git config user.email "mayhem@retacademy.dev" 2>nul

echo [3/6] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)

echo [4/6] Creating initial commit...
git commit -m "Initial commit - RET Academy v2.0 Production Release"
if errorlevel 1 (
    echo ERROR: Git commit failed!
    pause
    exit /b 1
)

echo [5/6] Setting main branch...
git branch -M main
if errorlevel 1 (
    echo WARNING: Branch rename failed, continuing...
)

echo [6/6] Repository ready!
echo.
echo ========================================
echo  NEXT STEPS:
echo ========================================
echo 1. Create repository on GitHub/GitLab
echo 2. Run: git remote add origin YOUR_REPO_URL
echo 3. Run: git push -u origin main
echo.
echo Repository initialized successfully!
echo Press any key to continue...
pause >nul
