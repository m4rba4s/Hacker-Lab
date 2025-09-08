@echo off
echo ========================================
echo    RET Academy - Push to GitHub
echo ========================================
echo.

if "%1"=="" (
    echo ERROR: Please provide GitHub repository URL!
    echo.
    echo Usage: push_to_github.bat YOUR_GITHUB_REPO_URL
    echo.
    echo Example:
    echo push_to_github.bat https://github.com/yourusername/ret-academy.git
    echo.
    pause
    exit /b 1
)

set REPO_URL=%1

echo Repository URL: %REPO_URL%
echo.

echo [1/3] Adding remote origin...
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo WARNING: Remote might already exist, removing and re-adding...
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
)

echo [2/3] Pushing to main branch...
git push -u origin main
if errorlevel 1 (
    echo ERROR: Push failed!
    echo.
    echo Possible solutions:
    echo 1. Make sure repository exists on GitHub
    echo 2. Check your GitHub credentials
    echo 3. Try: git push --force origin main
    pause
    exit /b 1
)

echo [3/3] Success!
echo.
echo ========================================
echo  🚀 RET ACADEMY DEPLOYED!
echo ========================================
echo.
echo Repository: %REPO_URL%
echo Branch: main
echo Status: Successfully pushed!
echo.
echo Your RET Academy is now live on GitHub! 🔥
pause
