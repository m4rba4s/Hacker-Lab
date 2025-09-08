# Hacker Lab Quick Launcher
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   HACKER LAB v2.0 - ELITE EDITION     " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
$pythonExists = Get-Command python -ErrorAction SilentlyContinue
if ($pythonExists) {
    Write-Host "[+] Python found at: $($pythonExists.Source)" -ForegroundColor Green
    
    # Start HTTP server in background
    Write-Host "[*] Starting HTTP server on port 8000..." -ForegroundColor Yellow
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        python -m http.server 8000
    }
    
    Write-Host "[+] Server started (Job ID: $($serverJob.Id))" -ForegroundColor Green
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 2
    
    # Open browser
    Write-Host "[*] Opening browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:8000"
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "[!] Server is running in background" -ForegroundColor Cyan
    Write-Host "[!] To stop server, run: Stop-Job $($serverJob.Id)" -ForegroundColor Yellow
    Write-Host "[!] Or press Ctrl+C in this window" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Cyan
    
    # Keep script running
    Write-Host ""
    Write-Host "Press any key to stop the server and exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop server
    Stop-Job $serverJob
    Remove-Job $serverJob
    Write-Host "[+] Server stopped" -ForegroundColor Green
    
} else {
    Write-Host "[!] Python not found!" -ForegroundColor Red
    Write-Host "[*] Trying direct file open (may not work with ES6 modules)..." -ForegroundColor Yellow
    
    # Try to open standalone version
    $standaloneFile = Join-Path $PWD "hacker_lab.html"
    if (Test-Path $standaloneFile) {
        Write-Host "[*] Opening standalone version: $standaloneFile" -ForegroundColor Yellow
        Start-Process $standaloneFile
        Write-Host "[!] Note: Some features may not work without HTTP server" -ForegroundColor Yellow
    } else {
        Write-Host "[!] File not found: $standaloneFile" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "To install Python:" -ForegroundColor Cyan
    Write-Host "1. Download from https://python.org" -ForegroundColor White
    Write-Host "2. Or use: winget install Python.Python.3" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
