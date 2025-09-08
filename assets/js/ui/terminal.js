/**
 * Terminal Interface
 * Provides a pwndbg-style command interface
 */

// Import patch commands
import { PatchCommands } from '../commands/patch_commands.js';

export const Terminal = {
    app: null, // To hold reference to the main App
    history: [],
    historyIndex: -1,
    
    init(app) {
        this.app = app;
        this.setupElements();
        this.setupEventListeners();
        // Welcome message is now handled by app.js showWelcomeMessage()
    },
    
    setupElements() {
        this.body = document.getElementById('term-body');
        this.input = document.getElementById('term-input');
        this.prompt = document.getElementById('term-prompt');
        
        // Register patch commands
        this.registerPatchCommands();
        
        if (!this.body) {
            throw new Error('Terminal body element (#term-body) not found');
        }
        if (!this.input) {
            throw new Error('Terminal input element (#term-input) not found');
        }
        if (!this.prompt) {
            throw new Error('Terminal prompt element (#term-prompt) not found');
        }
        
        // Create suggestions popup
        this.suggestionsPopup = document.createElement('div');
        this.suggestionsPopup.className = 'terminal-suggestions hidden';
        this.suggestionsPopup.id = 'terminal-suggestions';
        document.getElementById('terminal').appendChild(this.suggestionsPopup);
        
        console.log('Terminal DOM elements found successfully');
    },
    
    // Register custom command modules
    registerPatchCommands() {
        Object.entries(PatchCommands).forEach(([name, cmd]) => {
            this.commands[name] = function(...args) {
                const result = cmd.execute(args, this.app);
                if (result) {
                    this.print(result.output, result.type || 'normal');
                }
            };
        });
        console.log('✅ Patch commands registered');
    },
    
    setupEventListeners() {
        // Input handling for live suggestions
        this.input.addEventListener('input', (e) => {
            this.showLiveSuggestions();
        });
        
        // Keyboard handling
        this.input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand(this.input.value.trim());
                    this.input.value = '';
                    this.historyIndex = -1;
                    this.hideSuggestions();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1);
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.autoComplete();
                    break;
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target === this.input) return;
            
            switch (e.key) {
                case 'F10':
                    e.preventDefault();
                    this.executeCommand('si');
                    break;
                case 'F9':
                    e.preventDefault();
                    this.executeCommand('c');
                    break;
                case '/':
                    e.preventDefault();
                    this.input.focus();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.toggle();
                    break;
            }
        });
    },
    
    executeCommand(cmd) {
        if (!cmd) return;
        
        // Add to history
        this.history.unshift(cmd);
        if (this.history.length > 50) this.history.pop();
        
        // Show command in terminal
        this.print(`(hlab)> ${cmd}`, 'command');
        
        // Parse and execute
        const [command, ...args] = cmd.split(/\s+/);
        const handler = this.commands[command];
        
        if (handler) {
            try {
                const result = handler.call(this, ...args);
                if (result && typeof result === 'string') {
                    this.print(result);
                }
            } catch (error) {
                this.print(`Error: ${error.message}`, 'error');
            }
        } else {
            this.print(`Unknown command: ${command}`, 'error');
            this.print('Type help for available commands.');
        }

        // After every command, update the UI
        if (this.app) {
            this.app.updateUI();
        }
    },
    
    navigateHistory(direction) {
        if (this.history.length === 0) return;
        
        this.historyIndex = Math.max(-1, Math.min(this.history.length - 1, this.historyIndex + direction));
        
        if (this.historyIndex === -1) {
            this.input.value = '';
        } else {
            this.input.value = this.history[this.historyIndex];
        }
    },
    
    autoComplete() {
        const input = this.input.value.trim();
        const parts = input.split(' ');
        const currentCmd = parts[0];
        
        // Command completion
        if (parts.length === 1) {
        const commands = Object.keys(this.commands);
            const matches = commands.filter(cmd => cmd.startsWith(currentCmd));
        
        if (matches.length === 1) {
            this.input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
                this.print('💡 Available commands:', 'warn');
                
                // Group commands by category
                const basic = matches.filter(cmd => ['help', 'levels', 'load', 'goal', 'hint', 'clear'].includes(cmd));
                const debug = matches.filter(cmd => ['si', 'ni', 'c', 'regs', 'stack', 'flags', 'break', 'del', 'bps', 'check', 'reset'].includes(cmd));
                const analysis = matches.filter(cmd => ['strings', 'hexdump', 'x/8i'].includes(cmd));
                const elite = matches.filter(cmd => ['ropgen', 'shellgen', 'exploit', 'aslr', 'canary', 'pwn'].includes(cmd));
                const forensics = matches.filter(cmd => ['checksec', 'vmmap', 'pattern', 'gadgets'].includes(cmd));
                
                if (basic.length) this.print(`📚 Basic: ${basic.join(', ')}`, 'normal');
                if (debug.length) this.print(`🕹️ Debug: ${debug.join(', ')}`, 'normal');
                if (analysis.length) this.print(`🎯 Analysis: ${analysis.join(', ')}`, 'normal');
                if (elite.length) this.print(`💀 Elite: ${elite.join(', ')}`, 'success');
                if (forensics.length) this.print(`🔍 Forensics: ${forensics.join(', ')}`, 'warn');
            }
        }
        
        // Argument completion for specific commands
        else if (parts.length === 2) {
            const cmd = parts[0];
            const arg = parts[1];
            
            if (cmd === 'exploit') {
                const exploits = ['buffer_overflow', 'ret2libc', 'rop_chain', 'format_string', 'heap_overflow', 'use_after_free'];
                const matches = exploits.filter(exp => exp.startsWith(arg));
                
                if (matches.length === 1) {
                    this.input.value = `${cmd} ${matches[0]}`;
                } else if (matches.length > 1) {
                    this.print(`💥 Available exploits: ${matches.join(', ')}`, 'warn');
                }
            }
            
            else if (cmd === 'load') {
                const lessons = this.app?.State?.lessons || [];
                const lessonIds = lessons.map(l => l.id);
                const matches = lessonIds.filter(id => id.startsWith(arg));
                
                if (matches.length === 1) {
                    this.input.value = `${cmd} ${matches[0]}`;
                } else if (matches.length > 1) {
                    this.print(`📚 Available lessons: ${matches.slice(0, 10).join(', ')}${matches.length > 10 ? '...' : ''}`, 'normal');
                }
            }
        }
    },
    
    print(text, type = 'normal') {
        // Safety check
        if (!this.body) {
            console.error('Terminal not initialized, cannot print:', text);
            return;
        }
        
        // Sanitize type to prevent class injection
        const validTypes = ['normal', 'command', 'error', 'success', 'warn', 'muted', 'danger'];
        const safeType = validTypes.includes(type) ? type : 'normal';
        
        const line = document.createElement('div');
        line.className = `term-line term-line--${safeType}`;
        line.textContent = text; // textContent auto-escapes HTML
        
        this.body.appendChild(line);
        this.body.scrollTop = this.body.scrollHeight;
        
        // Limit lines for performance
        while (this.body.children.length > 1000) {
            this.body.removeChild(this.body.firstChild);
        }
    },
    
    clear() {
        // Безопасная очистка без innerHTML
        while (this.body.firstChild) {
            this.body.removeChild(this.body.firstChild);
        }
    },
    
    toggle() {
        const terminal = document.getElementById('terminal');
        terminal.style.display = terminal.style.display === 'none' ? 'flex' : 'none';
    },
    
    focus() {
        this.input.focus();
    },
    
    // Command implementations
    commands: {
        help() {
            this.print('🔥 HACKER LAB COMMAND REFERENCE 🔥', 'warn');
            this.print('');
            this.print('📚 Basic Commands:');
            this.print('  help           - Show this help');
            this.print('  levels         - List all lessons');
            this.print('  load <id>      - Load lesson by ID');
            this.print('  goal           - Show current lesson goal');
            this.print('  hint           - Show lesson hint');
            this.print('  clear          - Clear terminal');
            this.print('');
            this.print('🕹️ Debugging Commands:');
            this.print('  si             - Step one instruction (F10)');
            this.print('  ni             - Next instruction (over calls)');
            this.print('  c              - Continue execution (F9)');
            this.print('  x/8i $rip     - Show 8 instructions at RIP');
            this.print('  regs           - Show registers');
            this.print('  stack          - Show stack');
            this.print('  flags          - Show flags');
            this.print('  break <addr>   - Set breakpoint');
            this.print('  del <addr>     - Delete breakpoint');
            this.print('  bps            - List breakpoints');
            this.print('  check          - Check lesson completion');
            this.print('  reset          - Reset lesson state');
            this.print('');
            this.print('🎯 Analysis Commands:');
            this.print('  strings        - Show strings');
            this.print('  hexdump        - Show hex dump');
            this.print('');
            this.print('💀 ELITE HACKING TOOLS:');
            this.print('  ropgen         - ROP chain generator');
            this.print('  shellgen       - Shellcode generator');
            this.print('  exploit <type> - Exploit database');
            this.print('  aslr           - ASLR bypass techniques');
            this.print('  canary         - Stack canary bypass');
            this.print('  pwn            - Activate PWN mode! 🔥');
            this.print('');
            this.print('🔍 MEMORY FORENSICS:');
            this.print('  checksec       - Binary security analysis');
            this.print('  vmmap          - Virtual memory layout');
            this.print('  pattern <size> - Generate cyclic pattern');
            this.print('  gadgets        - Find ROP gadgets');
            this.print('');
            this.print('💡 Pro tip: Use TAB for autocompletion!', 'success');
        },
        
        levels() {
            const lessons = this.app?.State?.lessons || [];
            if (!lessons.length) {
                this.print('No lessons available', 'error');
                return;
            }
            
            this.print('Available lessons:');
            lessons.forEach(lesson => {
                const completed = this.app.Progress.isCompleted(lesson.id);
                const status = completed ? '✓' : ' ';
                this.print(`  ${status} ${lesson.id}: ${lesson.title}`);
            });
        },
        
        load(id) {
            if (!id) {
                this.print('Usage: load <lesson_id>', 'error');
                return;
            }
            
            const lesson = (this.app?.State?.lessons || []).find(l => l.id === id);
            if (!lesson) {
                this.print(`Lesson not found: ${id}`, 'error');
                return;
            }
            
            this.app.State.loadLesson(lesson);
            this.print(`Loaded lesson: ${lesson.title}`);
        },
        
        goal() {
            if (!this.app.State.currentLesson) {
                this.print('No lesson loaded', 'error');
                return;
            }
            return `Goal: ${this.app.State.currentLesson.goal}`;
        },
        
        hint() {
            if (!this.app.State.currentLesson) {
                this.print('No lesson loaded', 'error');
                return;
            }
            return `Hint: ${this.app.State.currentLesson.hint}`;
        },
        
        si() {
            const result = this.app.Simulator.step();
            switch (result) {
                case 'ok':
                    return `Step: ${this.app.State.formatHex(this.app.State.regs.rip)}`;
                case 'breakpoint':
                    const addr = this.app.State.getCurrentInstruction()?.a;
                    return `** Breakpoint hit at ${this.app.State.formatHex(addr)} **`;
                case 'end':
                    return '— End of trace —';
                case 'no-lesson':
                    return 'No lesson loaded';
            }
        },
        
        ni() {
            // For now, same as si
            return this.si();
        },
        
        c() {
            const result = this.app.Simulator.continue();
            switch (result) {
                case 'breakpoint':
                    const addr = this.app.State.getCurrentInstruction()?.a;
                    return `** Breakpoint hit at ${this.app.State.formatHex(addr)} **`;
                case 'end':
                    return '— End of trace —';
                default:
                    return `Execution stopped: ${result}`;
            }
        },
        
        'x/8i'(target) {
            const context = this.app.Simulator.getDisasmContext(8);
            if (context.length === 0) {
                this.print('No disassembly available', 'error');
                return;
            }
            
            let output = '';
            context.forEach(instr => {
                const marker = instr.isCurrent ? '=> ' : '   ';
                const bp = instr.isBreakpoint ? '*' : ' ';
                output += `${marker}${bp}${this.app.State.formatHex(instr.a)}: ${instr.s}\n`;
            });
            return output.trim();
        },
        
        regs() {
            let output = 'Registers:\n';
            Object.entries(this.app.State.regs).forEach(([name, value]) => {
                output += `  ${name.toUpperCase()}: ${this.app.State.formatHex(value)}\n`;
            });
            return output.trim();
        },
        
        stack() {
            let output = 'Stack (top 10):\n';
            const stackStart = this.app.State.regs.rsp;
            this.app.State.stack.slice(0, 10).forEach((value, i) => {
                const addr = stackStart + BigInt(i * 8);
                output += `  ${this.app.State.formatHex(addr)}: ${this.app.State.formatHex(value)}\n`;
            });
            return output.trim();
        },
        
        flags() {
            let output = 'Flags:\n';
            Object.entries(this.app.State.flags).forEach(([name, value]) => {
                output += `  ${name.toUpperCase()}: ${value}\n`;
            });
            return output.trim();
        },
        
        break(addr) {
            if (!addr) {
                return 'Usage: break <address>';
            }
            
            let address;
            if (addr === '$rip' || addr === '$ip') {
                const current = this.app.State.getCurrentInstruction();
                if (!current) {
                    return 'No current instruction';
                }
                address = current.a;
            } else {
                address = parseInt(addr, 16);
                if (isNaN(address)) {
                    return 'Invalid address format';
                }
            }
            
            const added = this.app.Simulator.toggleBreakpoint(address);
            return `${added ? 'Added' : 'Removed'} breakpoint at ${this.app.State.formatHex(address)}`;
        },
        
        del(addr) {
            if (!addr) {
                return 'Usage: del <address>';
            }
            
            const address = parseInt(addr, 16);
            if (isNaN(address)) {
                return 'Invalid address format';
            }
            
            const exists = this.app.State.breakpoints.includes(address);
            if (!exists) {
                return `No breakpoint at ${this.app.State.formatHex(address)}`;
            }
            this.app.Simulator.toggleBreakpoint(address);
            return `Removed breakpoint at ${this.app.State.formatHex(address)}`;
        },
        
        bps() {
            return this.app.Simulator.showBreakpoints();
        },
        
        strings() {
            if (!this.app.State.currentLesson || !this.app.State.currentLesson.strings) {
                this.print('No strings available', 'error');
                return;
            }
            
            let output = 'Strings:\n';
            this.app.State.currentLesson.strings.forEach((str, i) => {
                output += `  [${i}] "${str}"\n`;
            });
            return output.trim();
        },
        
        hexdump() {
            if (!this.app.State.currentLesson || !this.app.State.currentLesson.bytes) {
                this.print('No hex data available', 'error');
                return;
            }
            
            const bytes = this.app.State.currentLesson.bytes;
            const base = this.app.State.currentLesson.base || 0x401000;
            
            let output = 'Hex dump:\n';
            for (let i = 0; i < bytes.length; i += 16) {
                const addr = base + i;
                const chunk = bytes.slice(i, i + 16);
                const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
                const ascii = Array.from(chunk).map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.').join('');
                output += `  ${this.app.State.formatHex(addr)}: ${hex.padEnd(48)} |${ascii}|\n`;
            }
            return output.trim();
        },
        
        check() {
            const result = this.app.Simulator.check();
            this.print(result.message, result.passed ? 'success' : 'error');
            
            if (result.passed) {
                this.app.Simulator.showSuccess();
                
                // Award XP and track completion
                const lesson = this.app.State.currentLesson;
                if (lesson && this.app.Gamification) {
                    // Calculate completion time (simplified for now)
                    const timeSpent = 120; // TODO: track actual time
                    const hintsUsed = 0; // TODO: track hints used
                    
                    this.app.Gamification.onLessonComplete(
                        lesson.id, 
                        timeSpent, 
                        hintsUsed, 
                        true
                    );
                    
                    // Mark as completed in progress
                    this.app.Progress.save(lesson.id, true);
                    
                    this.print(`🎉 Lesson completed! Check your stats in the header.`, 'success');
                }
            }
        },
        
        reset() {
            return this.app.Simulator.reset();
        },
        
        clear() {
            this.clear();
        },
        
        // ========== КРУТЫЕ НОВЫЕ КОМАНДЫ ==========
        
        ropgen() {
            this.print('🔗 ROP Chain Generator', 'warn');
            this.print('Available ROP gadgets:');
            this.print('  0x401234: pop rdi; ret');
            this.print('  0x401245: pop rsi; ret');
            this.print('  0x401256: pop rdx; ret');
            this.print('  0x401267: syscall; ret');
            this.print('');
            this.print('Example ROP chain for execve("/bin/sh"):');
            this.print('  payload = "A"*72              # Padding');
            this.print('  payload += p64(0x401234)       # pop rdi; ret');
            this.print('  payload += p64("/bin/sh")      # arg1: filename');
            this.print('  payload += p64(0x401245)       # pop rsi; ret');
            this.print('  payload += p64(0)              # arg2: argv (NULL)');
            this.print('  payload += p64(0x401256)       # pop rdx; ret');
            this.print('  payload += p64(0)              # arg3: envp (NULL)');
            this.print('  payload += p64(0x401267)       # syscall');
            this.print('');
            this.print('💀 ROP chain ready to pwn!', 'success');
        },
        
        shellgen() {
            this.print('🐚 Shellcode Generator', 'warn');
            this.print('x64 Linux execve("/bin/sh") shellcode:');
            this.print('');
            this.print('\\x48\\x31\\xf6\\x56\\x48\\xbf\\x2f\\x62\\x69\\x6e\\x2f\\x2f\\x73\\x68');
            this.print('\\x57\\x54\\x5f\\x6a\\x3b\\x58\\x99\\x0f\\x05');
            this.print('');
            this.print('Disassembly:');
            this.print('  xor    rsi, rsi       ; argv = NULL');
            this.print('  push   rsi            ; null terminator');
            this.print('  movabs rdi, 0x68732f2f6e69622f ; "/bin//sh"');
            this.print('  push   rdi');
            this.print('  push   rsp');
            this.print('  pop    rdi            ; filename = "/bin/sh"');
            this.print('  push   0x3b          ; execve syscall');
            this.print('  pop    rax');
            this.print('  cdq                   ; rdx = 0 (envp)');
            this.print('  syscall');
            this.print('');
            this.print('Size: 23 bytes | Null-free: Yes', 'success');
        },
        
        exploit(target) {
            if (!target) {
                this.print('💥 Exploit Database', 'warn');
                this.print('Available exploits:');
                this.print('  buffer_overflow - Classic stack overflow');
                this.print('  ret2libc       - Return-to-libc attack');
                this.print('  rop_chain      - Return-oriented programming');
                this.print('  format_string  - Format string vulnerability');
                this.print('  heap_overflow  - Heap-based buffer overflow');
                this.print('  use_after_free - Use-after-free exploitation');
                this.print('');
                this.print('Usage: exploit <target>', 'muted');
                return;
            }
            
            const exploits = {
                buffer_overflow: {
                    desc: 'Classic stack buffer overflow',
                    payload: 'python -c "print(\'A\'*72 + p64(0x41414141))"',
                    technique: 'Overwrite return address on stack'
                },
                ret2libc: {
                    desc: 'Return-to-libc without shellcode',
                    payload: '"A"*padding + p64(system) + p64(exit) + p64("/bin/sh")',
                    technique: 'Call existing library functions'
                },
                rop_chain: {
                    desc: 'Return-oriented programming chain',
                    payload: 'See: ropgen command for full chain',
                    technique: 'Chain code gadgets ending in RET'
                },
                format_string: {
                    desc: 'Format string vulnerability',
                    payload: '"%x "*20 + "%n"',
                    technique: 'Leak/write memory via printf specifiers'
                }
            };
            
            const exp = exploits[target];
            if (exp) {
                this.print(`💀 Exploit: ${exp.desc}`, 'warn');
                this.print(`Technique: ${exp.technique}`);
                this.print(`Payload: ${exp.payload}`, 'success');
            } else {
                this.print(`Unknown exploit: ${target}`, 'error');
            }
        },
        
        aslr() {
            this.print('🎭 ASLR Bypass Techniques', 'warn');
            this.print('');
            this.print('1. Information Leak');
            this.print('   - Leak stack/heap/code addresses');
            this.print('   - Use format strings: %p %p %p');
            this.print('   - Buffer over-read vulnerabilities');
            this.print('');
            this.print('2. Partial Overwrite');
            this.print('   - Overwrite least significant bytes only');
            this.print('   - Works when randomization is limited');
            this.print('');
            this.print('3. Brute Force');
            this.print('   - Guess randomized addresses');
            this.print('   - Works against 32-bit ASLR');
            this.print('');
            this.print('4. Return-to-PLT');
            this.print('   - PLT entries have known offsets');
            this.print('   - Use GOT leaks to calculate libc base');
            this.print('');
            this.print('💡 Combine multiple techniques for best results!', 'success');
        },
        
        canary() {
            this.print('🕯️ Stack Canary Bypass', 'warn');
            this.print('');
            this.print('Stack canaries detect buffer overflows:');
            this.print('  [buffer][canary][saved_rbp][return_addr]');
            this.print('');
            this.print('Bypass techniques:');
            this.print('');
            this.print('1. Canary Leak');
            this.print('   - Use format string to leak canary value');
            this.print('   - Buffer over-read to expose canary');
            this.print('');
            this.print('2. Canary Brute Force');
            this.print('   - Guess byte-by-byte');
            this.print('   - Works against forking servers');
            this.print('');
            this.print('3. Stack Smashing');
            this.print('   - Overwrite __stack_chk_fail GOT entry');
            this.print('   - Redirect to your shellcode');
            this.print('');
            this.print('4. One-byte Overflow');
            this.print('   - Partial canary overwrite');
            this.print('   - Preserve canary structure');
            this.print('');
            this.print('🔥 Canaries are just another obstacle!', 'success');
        },
        
        // ========== НОВЫЕ ТОПОВЫЕ КОМАНДЫ ==========
        
        tutorial(type) {
            if (!type) {
                this.print('🎓 Available Interactive Tutorials:', 'warn');
                this.print('  tutorial breakpoints - Master debugging with breakpoints', 'success');
                this.print('  tutorial patching    - Learn dynamic code patching', 'success');
                this.print('  tutorial rop         - Build ROP chains like a pro', 'success');
                this.print('  tutorial exploit     - Full exploitation walkthrough', 'success');
                this.print('');
                this.print('Usage: tutorial <type>', 'muted');
                return;
            }
            
            if (window.TutorialSystem) {
                if (window.TutorialSystem.startTutorial(type)) {
                    this.print(`🎓 Starting tutorial: ${type}`, 'success');
                    this.print('Follow the on-screen instructions!', 'normal');
                } else {
                    this.print(`Unknown tutorial: ${type}`, 'error');
                    this.print('Type "tutorial" to see available tutorials', 'muted');
                }
            } else {
                this.print('Tutorial system not loaded!', 'error');
            }
        },
        
        checksec() {
            this.print('🛡️ Binary Security Check', 'warn');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            const lesson = this.app.State.currentLesson;
            
            // Симулируем проверку защит для текущего урока
            const protections = {
                aslr: lesson && lesson.id > '2.0' ? 'Enabled' : 'Disabled',
                nx: lesson && lesson.id > '1.5' ? 'Enabled' : 'Disabled', 
                canary: lesson && lesson.id > '3.0' ? 'Present' : 'Not found',
                pie: 'Disabled', // Для обучения всегда выключен
                relro: lesson && lesson.id > '2.5' ? 'Full' : 'Partial'
            };
            
            this.print(`  [*] ASLR:    ${protections.aslr}  ${protections.aslr === 'Disabled' ? '⚠️' : '✅'}`);
            this.print(`  [*] NX:      ${protections.nx}  ${protections.nx === 'Disabled' ? '⚠️' : '✅'}`);
            this.print(`  [*] Canary:  ${protections.canary}  ${protections.canary === 'Not found' ? '⚠️' : '✅'}`);
            this.print(`  [*] PIE:     ${protections.pie}  ${protections.pie === 'Disabled' ? '⚠️' : '✅'}`);
            this.print(`  [*] RELRO:   ${protections.relro}  ${protections.relro === 'Partial' ? '⚠️' : '✅'}`);
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Рекомендации
            if (protections.nx === 'Disabled') {
                this.print('💡 NX disabled: Direct shellcode execution possible!', 'success');
            } else {
                this.print('💡 NX enabled: Use ROP/ret2libc techniques', 'warn');
            }
            
            if (protections.canary === 'Not found') {
                this.print('💡 No canary: Stack overflow exploitation easier', 'success');
            } else {
                this.print('💡 Canary present: Need leak or bruteforce', 'warn');
            }
        },
        
        vmmap() {
            this.print('📍 Virtual Memory Map', 'warn');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.print('Start              End                Perm  Name');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.print('0x0000000000400000 0x0000000000401000 r-xp  /binary');
            this.print('0x0000000000600000 0x0000000000601000 r--p  /binary');
            this.print('0x0000000000601000 0x0000000000602000 rw-p  /binary');
            this.print('0x00007ffff7a1c000 0x00007ffff7bd2000 r-xp  /lib/libc.so.6');
            this.print('0x00007ffff7dd2000 0x00007ffff7dd3000 rw-p  /lib/libc.so.6');
            this.print('0x00007ffff7dd3000 0x00007ffff7dfd000 r-xp  /lib/ld.so');
            this.print('0x00007ffffffde000 0x00007ffffffff000 rw-p  [stack]');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        },
        
        pattern(action, arg) {
            if (!action) {
                this.print('🔄 Pattern Generator', 'warn');
                this.print('Usage:');
                this.print('  pattern create <length> - Generate cyclic pattern');
                this.print('  pattern offset <value>  - Find offset in pattern');
                return;
            }
            
            if (action === 'create') {
                const length = parseInt(arg) || 100;
                let pattern = '';
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                
                for (let i = 0; i < length; i++) {
                    pattern += chars[(i % 62)];
                }
                
                this.print(`Generated pattern (${length} bytes):`, 'success');
                this.print(pattern);
                this.print('');
                this.print('💡 Use this pattern to find exact overflow offset', 'muted');
            } else if (action === 'offset') {
                // Simplified offset finder
                this.print(`Pattern offset for ${arg}: 72`, 'success');
                this.print('💡 This means you need 72 bytes to reach return address', 'muted');
            }
        },
        
        telescope(addr) {
            const startAddr = addr ? parseInt(addr, 16) : Number(this.app.State.regs.rsp);
            this.print('🔭 Stack Telescope', 'warn');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            for (let i = 0; i < 8; i++) {
                const currentAddr = startAddr + (i * 8);
                const value = this.app.State.stack[i] || 0n;
                const arrow = i === 0 ? '◂—' : '  ';
                
                let annotation = '';
                if (value === 0n) annotation = ' (null)';
                else if (value === 0x41414141n) annotation = ' ← AAAA (overflow marker)';
                else if (value > 0x400000n && value < 0x500000n) annotation = ' ← .text (code)';
                else if (value > 0x7ffff7000000n) annotation = ' ← libc region';
                else if (value > 0x7ffffffde000n) annotation = ' ← stack';
                
                this.print(`${arrow} ${this.app.State.formatHex(currentAddr)}: ${this.app.State.formatHex(value)}${annotation}`);
            }
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        },
        
        flag(flagStr) {
            if (!flagStr) {
                this.print('Usage: flag <CTF_FLAG>', 'error');
                this.print('Example: flag HTB{f1rst_bl00d}', 'muted');
                return;
            }
            
            if (!this.app.CTF) {
                this.print('CTF module not loaded!', 'error');
                return;
            }
            
            const result = this.app.CTF.submitFlag(flagStr);
            if (result.success) {
                this.print(result.message, 'success');
                this.print('🔥 Keep hunting for more flags!', 'success');
            } else {
                this.print(result.message, result.message.includes('already') ? 'warn' : 'error');
            }
        },
        
        ctf() {
            if (!this.app.CTF) {
                this.print('CTF module not loaded!', 'error');
                return;
            }
            
            const stats = this.app.CTF.getStats();
            this.print('🚩 CTF CHALLENGE STATUS 🚩', 'success');
            this.print(`Flags captured: ${stats.found}/${stats.total}`, 'normal');
            this.print(`Total points: ${stats.points}`, 'normal');
            this.print('', 'normal');
            this.print('Use "flag <FLAG>" to submit a flag', 'muted');
            this.print('Flags are hidden in lessons and challenges!', 'muted');
        },
        
        pwn() {
            this.print('', 'normal');
            this.print('██████╗ ██╗    ██╗███╗   ██╗██████╗ ██████╗ ', 'danger');
            this.print('██╔══██╗██║    ██║████╗  ██║██╔══██╗██╔══██╗', 'danger');
            this.print('██████╔╝██║ █╗ ██║██╔██╗ ██║██████╔╝██████╔╝', 'danger');
            this.print('██╔═══╝ ██║███╗██║██║╚██╗██║██╔══██╗██╔══██╗', 'danger');
            this.print('██║     ╚███╔███╔╝██║ ╚████║██║  ██║██████╔╝', 'danger');
            this.print('╚═╝      ╚══╝╚══╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝ ', 'danger');
            this.print('', 'normal');
            this.print('🔥 PWN MODE ACTIVATED! 🔥', 'danger');
            this.print('Ready to exploit everything in sight!', 'warn');
            this.print('Type "exploit" to see available attacks.', 'normal');
        },
        
        checksec() {
            this.print('🛡️ Binary Security Analysis', 'warn');
            this.print('');
            this.print('Protection Mechanisms:');
            this.print('');
            
            // Simulate security analysis of current lesson
            const lesson = this.app?.State?.currentLesson;
            if (!lesson) {
                this.print('❌ No binary loaded', 'error');
                return;
            }
            
            this.print(`📁 File: ${lesson.title}`, 'normal');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'muted');
            
            // Analyze based on lesson content
            const hasCanary = lesson.id.includes('2.3') || lesson.content?.includes('canary');
            const hasASLR = lesson.id.includes('3.3') || lesson.content?.includes('ASLR');
            const hasNX = lesson.id.includes('3.1') || lesson.content?.includes('NX') || lesson.content?.includes('DEP');
            const hasPIE = lesson.compilationInfo?.includes('-fPIE');
            const hasRelRO = !lesson.compilationInfo?.includes('-z norelro');
            
            this.print(`🕯️  Stack Canary    : ${hasCanary ? '🟢 ENABLED' : '🔴 DISABLED'}`, hasCanary ? 'success' : 'danger');
            this.print(`🎭 ASLR           : ${hasASLR ? '🟢 ENABLED' : '🔴 DISABLED'}`, hasASLR ? 'success' : 'danger');
            this.print(`🚫 NX/DEP         : ${hasNX ? '🟢 ENABLED' : '🔴 DISABLED'}`, hasNX ? 'success' : 'danger');
            this.print(`🥧 PIE            : ${hasPIE ? '🟢 ENABLED' : '🔴 DISABLED'}`, hasPIE ? 'success' : 'danger');
            this.print(`🔒 RelRO          : ${hasRelRO ? '🟢 Full' : '🟡 Partial'}`, hasRelRO ? 'success' : 'warn');
            this.print('');
            
            // Vulnerability assessment
            let vulnScore = 0;
            if (!hasCanary) vulnScore += 2;
            if (!hasASLR) vulnScore += 2;
            if (!hasNX) vulnScore += 3;
            if (!hasPIE) vulnScore += 1;
            if (!hasRelRO) vulnScore += 1;
            
            if (vulnScore >= 6) {
                this.print('🚨 EXPLOIT DIFFICULTY: TRIVIAL 🚨', 'danger');
                this.print('Multiple critical protections disabled!', 'danger');
            } else if (vulnScore >= 3) {
                this.print('⚠️  EXPLOIT DIFFICULTY: MODERATE ⚠️', 'warn');
                this.print('Some protections missing - exploitation possible.', 'warn');
            } else {
                this.print('💪 EXPLOIT DIFFICULTY: HARD 💪', 'success');
                this.print('Modern protections enabled - need advanced techniques.', 'success');
            }
        },
        
        vmmap() {
            this.print('🗺️ Virtual Memory Map', 'warn');
            this.print('');
            this.print('Start Address    End Address      Perms  Description');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Simulate memory layout based on current lesson
            const base = this.app?.State?.currentLesson?.base || 0x401000;
            
            this.print(`0x${(base).toString(16).padStart(12, '0')} 0x${(base + 0x1000).toString(16).padStart(12, '0')} r-x    [text] Executable code`, 'success');
            this.print(`0x${(base + 0x1000).toString(16).padStart(12, '0')} 0x${(base + 0x2000).toString(16).padStart(12, '0')} r--    [rodata] Read-only data`, 'normal');
            this.print(`0x${(base + 0x2000).toString(16).padStart(12, '0')} 0x${(base + 0x3000).toString(16).padStart(12, '0')} rw-    [data] Global variables`, 'warn');
            this.print('0x00007ffffffde000 0x00007ffffffff000 rw-    [stack] Program stack', 'warn');
            this.print('0x00007ffff7a0d000 0x00007ffff7bcd000 r-x    [libc] C library', 'success');
            this.print('0x00007ffff7bcd000 0x00007ffff7dcd000 ---    [libc] Guard pages', 'muted');
            this.print('0x00007ffff7dcd000 0x00007ffff7dd1000 r--    [libc] Data segment', 'normal');
            this.print('0x00007ffff7dd1000 0x00007ffff7dd3000 rw-    [libc] BSS segment', 'warn');
            this.print('0x00007ffff7dd3000 0x00007ffff7dda000 rw-    [heap] Dynamic allocation', 'warn');
            this.print('');
            this.print('💡 Look for RWX regions - perfect for shellcode!', 'success');
        },
        
        pattern(size) {
            const targetSize = size ? parseInt(size) : 100;
            if (isNaN(targetSize) || targetSize <= 0) {
                this.print('Usage: pattern <size>', 'error');
                return;
            }
            
            this.print(`🎨 De Bruijn Pattern Generator (${targetSize} bytes)`, 'warn');
            this.print('');
            
            // Generate cyclic pattern (simplified version)
            let pattern = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            
            for (let i = 0; i < targetSize; i++) {
                pattern += chars[i % chars.length];
            }
            
            // Show pattern in chunks of 64 characters
            this.print('Generated pattern:');
            for (let i = 0; i < pattern.length; i += 64) {
                const chunk = pattern.substring(i, i + 64);
                const offset = i.toString().padStart(4, '0');
                this.print(`${offset}: ${chunk}`, 'success');
            }
            
            this.print('');
            this.print('💡 Use this pattern to find EIP/RIP offset in buffer overflows!', 'warn');
            this.print('Example: When program crashes at "cdefghij", offset is ~34', 'muted');
        },
        
        gadgets() {
            this.print('🔗 ROP Gadget Scanner', 'warn');
            this.print('');
            
            // Simulate gadget finding in current lesson
            const lesson = this.app?.State?.currentLesson;
            if (!lesson) {
                this.print('❌ No binary loaded', 'error');
                return;
            }
            
            this.print('🔍 Scanning for useful gadgets...');
            this.print('');
            
            // Simulate found gadgets based on lesson type
            const gadgets = [
                { addr: '0x401234', gadget: 'pop rdi ; ret', usefulness: '★★★★★' },
                { addr: '0x401245', gadget: 'pop rsi ; ret', usefulness: '★★★★★' },
                { addr: '0x401256', gadget: 'pop rdx ; ret', usefulness: '★★★★★' },
                { addr: '0x401267', gadget: 'pop rax ; ret', usefulness: '★★★★☆' },
                { addr: '0x401278', gadget: 'pop rcx ; ret', usefulness: '★★★☆☆' },
                { addr: '0x401289', gadget: 'pop rbx ; ret', usefulness: '★★☆☆☆' },
                { addr: '0x40129a', gadget: 'mov rax, rdi ; ret', usefulness: '★★★☆☆' },
                { addr: '0x4012ab', gadget: 'syscall ; ret', usefulness: '★★★★★' },
                { addr: '0x4012bc', gadget: 'xor rax, rax ; ret', usefulness: '★★★★☆' },
                { addr: '0x4012cd', gadget: 'add rsp, 8 ; ret', usefulness: '★★☆☆☆' }
            ];
            
            this.print('Address     Gadget                  Usefulness');
            this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            gadgets.forEach(g => {
                const color = g.usefulness.includes('★★★★★') ? 'success' : 
                             g.usefulness.includes('★★★★') ? 'warn' : 'normal';
                this.print(`${g.addr}  ${g.gadget.padEnd(20)} ${g.usefulness}`, color);
            });
            
            this.print('');
            this.print('💀 Perfect for building exploitation chains!', 'success');
            this.print('Tip: Prioritize 5-star gadgets for reliable exploits.', 'muted');
        }
    },
    
    // ========== LIVE SUGGESTIONS SYSTEM ==========
    showLiveSuggestions() {
        const input = this.input.value.trim();
        if (!input) {
            this.hideSuggestions();
            return;
        }
        
        const allCommands = Object.keys(this.commands);
        const matches = allCommands.filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 0 || (matches.length === 1 && matches[0] === input)) {
            this.hideSuggestions();
            return;
        }
        
        // Create suggestion items
        this.suggestionsPopup.textContent = '';
        matches.slice(0, 5).forEach(cmd => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            const cmdSpan = document.createElement('span');
            cmdSpan.className = 'suggestion-cmd';
            cmdSpan.textContent = cmd;
            
            const descSpan = document.createElement('span');
            descSpan.className = 'suggestion-desc';
            descSpan.textContent = this.getCommandDescription(cmd);
            
            item.appendChild(cmdSpan);
            item.appendChild(descSpan);
            
            item.addEventListener('click', () => {
                this.input.value = cmd + ' ';
                this.input.focus();
                this.hideSuggestions();
            });
            
            this.suggestionsPopup.appendChild(item);
        });
        
        // Position popup above input
        const inputRect = this.input.getBoundingClientRect();
        const terminalRect = document.getElementById('terminal').getBoundingClientRect();
        this.suggestionsPopup.style.bottom = (terminalRect.bottom - inputRect.top + 5) + 'px';
        this.suggestionsPopup.style.left = inputRect.left - terminalRect.left + 'px';
        
        this.suggestionsPopup.classList.remove('hidden');
    },
    
    hideSuggestions() {
        this.suggestionsPopup.classList.add('hidden');
    },
    
    getCommandDescription(cmd) {
        const descriptions = {
            help: 'Show available commands',
            levels: 'List all lessons',
            load: 'Load a lesson by ID',
            goal: 'Show current lesson goal',
            hint: 'Get a hint for current lesson',
            si: 'Step one instruction',
            ni: 'Next instruction',
            c: 'Continue execution',
            regs: 'Show registers',
            stack: 'Display stack contents',
            flags: 'Show CPU flags',
            break: 'Set breakpoint',
            del: 'Delete breakpoint',
            bps: 'List all breakpoints',
            strings: 'Show strings in binary',
            hexdump: 'Display hex dump',
            check: 'Check lesson completion',
            reset: 'Reset current lesson',
            clear: 'Clear terminal',
            ropgen: 'Generate ROP chains',
            shellgen: 'Generate shellcode',
            exploit: 'Show exploit database',
            aslr: 'ASLR bypass techniques',
            canary: 'Stack canary bypass',
            pwn: 'Activate PWN mode',
            checksec: 'Analyze binary security',
            vmmap: 'Show memory layout',
            pattern: 'Generate cyclic pattern',
            gadgets: 'Find ROP gadgets'
        };
        
        return descriptions[cmd] || '';
    }
};