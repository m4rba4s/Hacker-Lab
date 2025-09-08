#!/usr/bin/env node
/**
 * 🔥 CRITICAL FIX SCRIPT FOR HACKER LAB 🔥
 * Fixes all major issues preventing the app from starting
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 HACKER LAB CRITICAL FIX SCRIPT');
console.log('==================================\n');

// Fix 1: Ensure Storage export in storage.js
console.log('📝 Fixing storage.js exports...');
const storagePath = path.join(__dirname, 'assets/js/core/storage.js');
let storageContent = fs.readFileSync(storagePath, 'utf8');

// Check if Storage export already exists
if (!storageContent.includes('export const Storage = LS;')) {
    // Find the right place to add it (after STORAGE_KEYS)
    const insertPoint = storageContent.indexOf('// Progress management');
    if (insertPoint !== -1) {
        const before = storageContent.substring(0, insertPoint);
        const after = storageContent.substring(insertPoint);
        storageContent = before + '\n// Export Storage as alias for LS (for backward compatibility)\nexport const Storage = LS;\n\n' + after;
        fs.writeFileSync(storagePath, storageContent);
        console.log('✅ Added Storage export to storage.js');
    }
} else {
    console.log('✅ Storage export already exists');
}

// Fix 2: Check and fix app.js imports
console.log('\n📝 Checking app.js imports...');
const appPath = path.join(__dirname, 'assets/js/app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

// Fix the import statement if needed
const badImport = "import { LS as Storage, Progress } from './core/storage.js';";
const goodImport = "import { Storage, Progress } from './core/storage.js';";

if (appContent.includes(badImport)) {
    appContent = appContent.replace(badImport, goodImport);
    fs.writeFileSync(appPath, appContent);
    console.log('✅ Fixed Storage import in app.js');
} else if (appContent.includes(goodImport)) {
    console.log('✅ Storage import already correct');
} else {
    console.log('⚠️  Unexpected import format in app.js');
}

// Fix 3: Ensure index.html has correct CSP headers
console.log('\n📝 Fixing index.html security headers...');
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Remove the commented CSP and add a working one
const cspComment = /<!--\s*<meta http-equiv="Content-Security-Policy"[\s\S]*?-->/g;
indexContent = indexContent.replace(cspComment, '');

// Add proper CSP if not exists
if (!indexContent.includes('Content-Security-Policy') || indexContent.includes('<!-- <meta http-equiv="Content-Security-Policy"')) {
    const cspMeta = `    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; 
                   script-src 'self' 'unsafe-inline'; 
                   style-src 'self' 'unsafe-inline'; 
                   img-src 'self' data:; 
                   connect-src 'self';
                   font-src 'self' data:;
                   object-src 'none'; 
                   base-uri 'none';
                   form-action 'none';
                   frame-ancestors 'none';">`;
    
    // Insert after charset meta
    const charsetIndex = indexContent.indexOf('<meta name="viewport"');
    if (charsetIndex !== -1) {
        indexContent = indexContent.substring(0, charsetIndex) + cspMeta + '\n    ' + indexContent.substring(charsetIndex);
        fs.writeFileSync(indexPath, indexContent);
        console.log('✅ Added proper CSP headers');
    }
} else {
    console.log('✅ CSP headers already present');
}

// Fix 4: Create a startup test file
console.log('\n📝 Creating startup test file...');
const testContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hacker Lab - Quick Test</title>
    <style>
        body {
            background: #0a0e1a;
            color: #49f7c2;
            font-family: 'Courier New', monospace;
            padding: 20px;
        }
        .test-result {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #49f7c2;
            border-radius: 5px;
        }
        .success { border-color: #4df3a3; color: #4df3a3; }
        .error { border-color: #ff5c7a; color: #ff5c7a; }
        pre { background: #000; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>🔧 HACKER LAB SYSTEM TEST 🔧</h1>
    <div id="results"></div>
    
    <script type="module">
        const results = document.getElementById('results');
        
        function addResult(message, success = true) {
            const div = document.createElement('div');
            div.className = 'test-result ' + (success ? 'success' : 'error');
            div.textContent = (success ? '✅ ' : '❌ ') + message;
            results.appendChild(div);
        }
        
        // Test module loading
        try {
            addResult('Testing module imports...');
            
            const modules = [
                './assets/js/core/state.js',
                './assets/js/core/storage.js',
                './assets/js/core/simulator.js',
                './assets/js/ui/terminal.js',
                './assets/data/lessons.js'
            ];
            
            for (const modulePath of modules) {
                try {
                    const module = await import(modulePath);
                    addResult(\`Loaded: \${modulePath}\`);
                } catch (e) {
                    addResult(\`Failed to load: \${modulePath} - \${e.message}\`, false);
                }
            }
            
            // Test Storage export specifically
            const { Storage, Progress } = await import('./assets/js/core/storage.js');
            if (Storage && Progress) {
                addResult('Storage and Progress exports working!');
            } else {
                addResult('Storage or Progress export missing!', false);
            }
            
            // Test main app
            addResult('Loading main app...');
            await import('./assets/js/app.js');
            addResult('Main app loaded successfully!');
            
            setTimeout(() => {
                if (window.HackerLabApp && window.HackerLabApp.state.initialized) {
                    addResult('🎯 APP INITIALIZED SUCCESSFULLY! 🎯');
                    addResult('You can now use the main app at index.html');
                } else {
                    addResult('App not fully initialized after 2 seconds', false);
                }
            }, 2000);
            
        } catch (error) {
            addResult(\`Critical error: \${error.message}\`, false);
            const pre = document.createElement('pre');
            pre.textContent = error.stack;
            results.appendChild(pre);
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'test_startup.html'), testContent);
console.log('✅ Created test_startup.html');

console.log('\n' + '='.repeat(50));
console.log('🎯 FIXES COMPLETE!');
console.log('='.repeat(50));
console.log('\nTo test the fixes:');
console.log('1. Start your web server: python -m http.server 8000');
console.log('2. Open: http://localhost:8000/test_startup.html');
console.log('3. If all tests pass, open: http://localhost:8000/index.html');
console.log('\n🔥 HACKER LAB SHOULD NOW BE OPERATIONAL! 🔥');
