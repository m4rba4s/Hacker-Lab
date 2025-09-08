/**
 * HACKER LAB v2.0 - SIMPLE VERSION
 * Simplified version without complex modules
 */

console.log('🔥 HACKER LAB SIMPLE VERSION STARTING...');

// Simple version without dynamic imports
const SimpleApp = {
    state: {
        initialized: false,
        currentLesson: null
    },
    
    async init() {
        try {
            console.log('⚡ Initializing Simple App...');
            
            // Basic initialization
            this.setupUI();
            this.setupTerminal();
            
            this.state.initialized = true;
            console.log('✅ Simple App Ready!');
            
            // Show successful loading
            this.showSuccess();
            
        } catch (error) {
            console.error('💀 Simple App Error:', error);
            this.showError(error);
        }
    },
    
    setupUI() {
        // Remove loading elements
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Show main content
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
        }
    },
    
    setupTerminal() {
        const termBody = document.getElementById('term-body');
        const termInput = document.getElementById('term-input');
        
        if (!termBody || !termInput) {
            console.warn('Terminal elements not found');
            return;
        }
        
        // Clear terminal
        termBody.innerHTML = '';
        
        // Add greeting
        this.printToTerminal('🔥 HACKER LAB v2.0 - SIMPLE VERSION', 'success');
        this.printToTerminal('Welcome to the assembly and reverse engineering trainer!');
        this.printToTerminal('');
        this.printToTerminal('Available commands:', 'warn');
        this.printToTerminal('  help    - Show available commands');
        this.printToTerminal('  status  - Show system status');
        this.printToTerminal('  clear   - Clear terminal');
        this.printToTerminal('  hello   - Test command');
        this.printToTerminal('');
        
        // Command processing
        termInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = termInput.value.trim();
                if (cmd) {
                    this.executeCommand(cmd);
                }
                termInput.value = '';
            }
        });
    },
    
    printToTerminal(text, type = '') {
        const termBody = document.getElementById('term-body');
        if (!termBody) return;
        
        const line = document.createElement('div');
        line.className = `term-line term-line--${type}`;
        line.textContent = text;
        
        termBody.appendChild(line);
        termBody.scrollTop = termBody.scrollHeight;
    },
    
    executeCommand(cmd) {
        this.printToTerminal(`(hlab)> ${cmd}`, 'command');
        
        const [command, ...args] = cmd.split(/\s+/);
        
        switch (command) {
            case 'help':
                this.printToTerminal('Available commands:', 'success');
                this.printToTerminal('  help    - Show this help');
                this.printToTerminal('  status  - Show system status');
                this.printToTerminal('  clear   - Clear terminal');
                this.printToTerminal('  hello   - Test greeting');
                break;
                
            case 'status':
                this.printToTerminal('🚀 System Status:', 'success');
                this.printToTerminal('  Version: 2.0 Simple');
                this.printToTerminal('  Status: ' + (this.state.initialized ? 'Online' : 'Offline'));
                this.printToTerminal('  Mode: Training Ready');
                break;
                
            case 'clear':
                document.getElementById('term-body').innerHTML = '';
                break;
                
            case 'hello':
                this.printToTerminal('Hello, Elite Hacker! 💀🔥', 'success');
                this.printToTerminal('Ready to learn some assembly?');
                break;
                
            default:
                this.printToTerminal(`Unknown command: ${command}`, 'error');
                this.printToTerminal('Type "help" for available commands.');
        }
    },
    
    showSuccess() {
        // Show that everything works
        const testDiv = document.createElement('div');
        testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #4df3a3; color: black; padding: 15px; z-index: 9999; font-family: monospace; border-radius: 8px;';
        testDiv.textContent = '✅ SIMPLE VERSION LOADED!';
        document.body.appendChild(testDiv);
        
        setTimeout(() => {
            testDiv.remove();
        }, 5000);
    },
    
    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff5c7a; color: white; padding: 20px; z-index: 9999; font-family: monospace; border-radius: 8px;';
        errorDiv.innerHTML = `
            <h3>💀 ERROR</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="padding: 10px; margin-top: 10px;">🔄 Reload</button>
        `;
        document.body.appendChild(errorDiv);
    }
};

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimpleApp.init();
    });
} else {
    SimpleApp.init();
}

// Export globally
window.HackerLabApp = SimpleApp;
