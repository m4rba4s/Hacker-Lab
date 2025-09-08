# RET Academy Production Cleanup
# Remove temporary and test files

$filesToRemove = @(
    "final_fixes_test.html",
    "final_test.html",
    "fix_critical.js", 
    "height_fix_test.html",
    "memory_fix_test.html",
    "patch_test.html",
    "quick_fix.html",
    "run_tests.html",
    "tabtest.html",
    "test.html",
    "test_basic.html", 
    "test_final.html",
    "test_full.js",
    "test_layout.html",
    "test_scrollbar.html",
    "test_simple.html",
    "test_suite.js",
    "welcome_test.html",
    "diagnose.html",
    "hacker_lab.html",
    "hacker_lab_standalone.html", 
    "index_simple.html",
    "OPEN_ME.html",
    "FIX_SUMMARY.md"
)

foreach ($file in $filesToRemove) {
    $path = "C:\lowlevel_lab\$file"
    if (Test-Path $path) {
        Write-Host "Removing: $file" -ForegroundColor Red
        Remove-Item $path -Force
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nCleanup completed!" -ForegroundColor Green
