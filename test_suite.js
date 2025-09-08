/**
 * 🧪 HACKER LAB TEST SUITE
 * Автоматическое тестирование всех функций
 */

console.log('🚀 HACKER LAB TEST SUITE STARTING...\n');

// Test counter
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
        testsFailed++;
    }
}

// Wait for app to load
window.addEventListener('DOMContentLoaded', async () => {
    // Give app time to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('=== TESTING CORE SYSTEMS ===\n');
    
    // Test 1: App initialization
    test('App initialization', () => {
        if (!window.HackerLabApp) throw new Error('App not initialized');
        if (!window.HackerLabApp.state.initialized) throw new Error('App not fully initialized');
    });
    
    // Test 2: Modules loaded
    test('All modules loaded', () => {
        const requiredModules = ['State', 'Simulator', 'Terminal', 'Sidebar', 'Disasm'];
        requiredModules.forEach(mod => {
            if (!window.HackerLabApp.modules[mod]) {
                throw new Error(`Module ${mod} not loaded`);
            }
        });
    });
    
    // Test 3: Lessons loaded
    test('Lessons loaded', () => {
        const lessons = window.HackerLabApp.State.lessons;
        if (!lessons || lessons.length === 0) throw new Error('No lessons loaded');
        if (lessons.length < 20) throw new Error(`Only ${lessons.length} lessons loaded, expected 20+`);
    });
    
    console.log('\n=== TESTING TERMINAL COMMANDS ===\n');
    
    // Test 4: Terminal commands
    const terminal = window.HackerLabApp.Terminal;
    
    test('Terminal help command', () => {
        terminal.executeCommand('help');
        // Check if help was displayed
        const lastLines = terminal.body.textContent;
        if (!lastLines.includes('Available commands')) throw new Error('Help not displayed');
    });
    
    test('Terminal levels command', () => {
        terminal.executeCommand('levels');
        const output = terminal.body.textContent;
        if (!output.includes('0.1:')) throw new Error('Levels not listed');
    });
    
    test('Terminal load command', () => {
        terminal.executeCommand('load 0.1');
        const lesson = window.HackerLabApp.State.currentLesson;
        if (!lesson || lesson.id !== '0.1') throw new Error('Lesson not loaded');
    });
    
    test('Terminal si (step) command', () => {
        const initialIP = window.HackerLabApp.State.ipIndex;
        terminal.executeCommand('si');
        const newIP = window.HackerLabApp.State.ipIndex;
        if (newIP <= initialIP) throw new Error('Step did not advance');
    });
    
    test('Terminal regs command', () => {
        terminal.executeCommand('regs');
        const output = terminal.body.textContent;
        if (!output.includes('RAX:')) throw new Error('Registers not displayed');
    });
    
    console.log('\n=== TESTING ELITE COMMANDS ===\n');
    
    test('ROP generator command', () => {
        terminal.executeCommand('ropgen');
        const output = terminal.body.textContent;
        if (!output.includes('ROP Chain Generator')) throw new Error('ROPgen not working');
    });
    
    test('Shellcode generator command', () => {
        terminal.executeCommand('shellgen');
        const output = terminal.body.textContent;
        if (!output.includes('Shellcode Generator')) throw new Error('Shellgen not working');
    });
    
    test('Checksec command', () => {
        terminal.executeCommand('checksec');
        const output = terminal.body.textContent;
        if (!output.includes('Binary Security Analysis')) throw new Error('Checksec not working');
    });
    
    test('Pattern generator command', () => {
        terminal.executeCommand('pattern 100');
        const output = terminal.body.textContent;
        if (!output.includes('De Bruijn Pattern')) throw new Error('Pattern gen not working');
    });
    
    console.log('\n=== TESTING UI COMPONENTS ===\n');
    
    test('Tab switching', () => {
        const tabs = document.querySelectorAll('.tab');
        if (tabs.length < 5) throw new Error('Not enough tabs');
        
        // Click on source tab
        const sourceTab = Array.from(tabs).find(t => t.textContent === 'Source Code');
        if (!sourceTab) throw new Error('Source tab not found');
        sourceTab.click();
        
        // Check if view changed
        const activeTab = document.querySelector('.tab.active');
        if (activeTab.textContent !== 'Source Code') throw new Error('Tab not switched');
    });
    
    test('Live suggestions popup', () => {
        // Type partial command
        terminal.input.value = 'ro';
        terminal.input.dispatchEvent(new Event('input'));
        
        // Check if suggestions appear
        const suggestions = document.getElementById('terminal-suggestions');
        if (!suggestions || suggestions.classList.contains('hidden')) {
            throw new Error('Suggestions not shown');
        }
    });
    
    console.log('\n=== TESTING SECURITY FEATURES ===\n');
    
    test('CSP headers present', () => {
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!csp) throw new Error('CSP meta tag missing');
        if (csp.content.includes('unsafe-inline')) throw new Error('CSP allows unsafe-inline');
    });
    
    test('XSS protection', () => {
        // Try to inject script
        const testXSS = '<script>alert("XSS")</script>';
        terminal.print(testXSS);
        
        // Check if script was escaped
        const lastLine = terminal.body.lastChild;
        if (lastLine.innerHTML.includes('<script>')) {
            throw new Error('XSS not prevented - script tag rendered');
        }
    });
    
    console.log('\n=== TESTING PERFORMANCE ===\n');
    
    test('DOM updates use requestAnimationFrame', () => {
        // Check if updateDisplay uses RAF
        const updateDisplay = window.HackerLabApp.Gamification.updateDisplay.toString();
        if (!updateDisplay.includes('requestAnimationFrame')) {
            throw new Error('updateDisplay not using requestAnimationFrame');
        }
    });
    
    test('Terminal line limit', () => {
        // Add many lines
        for (let i = 0; i < 1100; i++) {
            terminal.print(`Test line ${i}`);
        }
        
        // Check if old lines removed
        const lineCount = terminal.body.children.length;
        if (lineCount > 1000) throw new Error(`Too many lines: ${lineCount}`);
    });
    
    console.log('\n=== TESTING LESSON FUNCTIONALITY ===\n');
    
    test('Lesson completion check', () => {
        // Load a simple lesson
        terminal.executeCommand('load 0.2');
        
        // Step through to completion
        terminal.executeCommand('reset');
        for (let i = 0; i < 10; i++) {
            terminal.executeCommand('si');
        }
        
        // Check completion
        terminal.executeCommand('check');
        const output = terminal.body.textContent;
        if (!output.includes('PASS') && !output.includes('FAIL')) {
            throw new Error('Check command not working');
        }
    });
    
    test('Breakpoint functionality', () => {
        const lesson = window.HackerLabApp.State.currentLesson;
        if (!lesson || !lesson.disasm || lesson.disasm.length === 0) {
            throw new Error('No lesson loaded for breakpoint test');
        }
        
        const addr = lesson.disasm[0].a;
        terminal.executeCommand(`break 0x${addr.toString(16)}`);
        
        // Check if breakpoint set
        if (!window.HackerLabApp.State.breakpoints.includes(addr)) {
            throw new Error('Breakpoint not set');
        }
    });
    
    console.log('\n=== TEST RESULTS ===\n');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📊 Success Rate: ${Math.round(testsPassed / (testsPassed + testsFailed) * 100)}%`);
    
    if (testsFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! HACKER LAB IS READY! 🎉');
    } else {
        console.log('\n⚠️ Some tests failed. Please fix the issues.');
    }
    
    // Store results globally for inspection
    window.testResults = {
        passed: testsPassed,
        failed: testsFailed,
        total: testsPassed + testsFailed
    };
});
