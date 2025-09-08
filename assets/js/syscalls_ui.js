/**
 * 🔥 SYSCALLS UI MODULE
 * Interactive syscall reference and playground
 */

// Use global SYSCALLS_DB and SYSCALL_HELPERS from window object
const SYSCALLS_DB = window.SYSCALLS_DB || {};
const SYSCALL_HELPERS = window.SYSCALL_HELPERS || {};

class SyscallsUI {
    constructor() {
        this.currentOS = 'linux';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.syscalls = [];
        this.init();
    }

    init() {
        this.loadSyscalls();
        this.setupEventListeners();
    }

    loadSyscalls() {
        const db = this.currentOS === 'linux' ? SYSCALLS_DB.linux : SYSCALLS_DB.windows;
        this.syscalls = Object.entries(db).map(([num, syscall]) => ({
            ...syscall,
            number: parseInt(num, this.currentOS === 'windows' ? 16 : 10)
        }));
    }

    render() {
        const container = document.querySelector('.view-content');
        if (!container) return;

        container.innerHTML = `
            <div class="syscalls-container">
                ${this.renderHeader()}
                ${this.renderControls()}
                ${this.renderStats()}
                ${this.renderTable()}
                ${this.renderPlayground()}
            </div>
        `;

        this.attachEventHandlers();
    }

    renderHeader() {
        return `
            <div class="syscalls-header">
                <h2 class="syscalls-title">🔥 System Calls Reference</h2>
                <div class="os-switcher">
                    <button class="os-btn ${this.currentOS === 'linux' ? 'active' : ''}" data-os="linux">
                        🐧 Linux x64
                    </button>
                    <button class="os-btn ${this.currentOS === 'windows' ? 'active' : ''}" data-os="windows">
                        🪟 Windows x64
                    </button>
                </div>
            </div>
        `;
    }

    renderControls() {
        const categories = [...new Set(this.syscalls.map(s => s.category))];
        
        return `
            <div class="syscalls-controls">
                <div class="syscall-search">
                    <input type="text" placeholder="Search syscalls..." value="${this.searchQuery}" id="syscall-search-input">
                    <span class="search-icon">🔍</span>
                </div>
                <div class="category-filters">
                    <button class="category-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
                        All
                    </button>
                    ${categories.map(cat => `
                        <button class="category-btn ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderStats() {
        const filtered = this.getFilteredSyscalls();
        const categories = {};
        filtered.forEach(s => {
            categories[s.category] = (categories[s.category] || 0) + 1;
        });

        return `
            <div class="syscall-stats">
                <div class="stat-card">
                    <div class="stat-number">${filtered.length}</div>
                    <div class="stat-label">Total Syscalls</div>
                </div>
                ${Object.entries(categories).map(([cat, count]) => `
                    <div class="stat-card">
                        <div class="stat-number">${count}</div>
                        <div class="stat-label">${cat}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTable() {
        const filtered = this.getFilteredSyscalls();
        
        if (filtered.length === 0) {
            return `
                <div class="syscalls-empty">
                    <h3>No syscalls found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
        }

        return `
            <div class="syscalls-table">
                <div class="syscalls-table-header">
                    <div>Number</div>
                    <div>Name</div>
                    <div>Description</div>
                    <div>Category</div>
                    <div>Details</div>
                </div>
                ${filtered.map(syscall => this.renderSyscallRow(syscall)).join('')}
            </div>
        `;
    }

    renderSyscallRow(syscall) {
        const hexNum = this.currentOS === 'windows' ? 
            `0x${syscall.number.toString(16).toUpperCase().padStart(4, '0')}` : 
            syscall.number.toString();

        return `
            <div class="syscall-row" data-syscall="${syscall.name}">
                <div class="syscall-number">${hexNum}</div>
                <div class="syscall-name">${syscall.name}</div>
                <div class="syscall-description">${syscall.description}</div>
                <div class="syscall-category ${syscall.category}">${syscall.category}</div>
                <div class="syscall-expand">▼</div>
                
                <div class="syscall-details">
                    ${this.renderSyscallDetails(syscall)}
                </div>
            </div>
        `;
    }

    renderSyscallDetails(syscall) {
        return `
            <div class="syscall-signature">
                <code>${syscall.signature || 'No signature available'}</code>
            </div>
            
            ${syscall.args ? `
                <div class="syscall-args">
                    <h4>Arguments:</h4>
                    <table class="args-table">
                        ${Object.entries(syscall.args).map(([reg, desc]) => {
                            if (reg === 'stack') {
                                return `
                                    <tr>
                                        <td>Stack</td>
                                        <td>${Array.isArray(desc) ? desc.join(', ') : desc}</td>
                                    </tr>
                                `;
                            }
                            return `
                                <tr>
                                    <td>${reg.toUpperCase()}</td>
                                    <td>${desc}</td>
                                </tr>
                            `;
                        }).join('')}
                    </table>
                </div>
            ` : ''}
            
            ${syscall.example ? `
                <div class="syscall-example">
                    <h4>
                        Example Code
                        <button class="copy-btn" data-copy="${btoa(syscall.example)}">Copy</button>
                    </h4>
                    <pre class="code-example">${this.highlightAsm(syscall.example)}</pre>
                </div>
            ` : ''}
            
            ${syscall.notes ? `
                <div class="syscall-notes">
                    <h4>Notes:</h4>
                    <p>${syscall.notes}</p>
                </div>
            ` : ''}
        `;
    }

    renderPlayground() {
        return `
            <div class="syscall-playground">
                <div class="playground-header">
                    <h3 class="playground-title">🧪 Syscall Playground</h3>
                    <div class="playground-controls">
                        <button class="btn primary" id="generate-shellcode">Generate Shellcode</button>
                        <button class="btn secondary" id="test-syscall">Test Syscall</button>
                    </div>
                </div>
                
                <div class="playground-editor">
                    <div class="editor-section">
                        <h5>Assembly Code</h5>
                        <textarea class="code-input" id="asm-input" placeholder="; Enter your assembly code here\nmov rax, 1\nmov rdi, 1\n..."></textarea>
                    </div>
                    <div class="editor-section">
                        <h5>Hex Output</h5>
                        <div class="playground-output" id="hex-output">Assembled bytes will appear here...</div>
                    </div>
                </div>
                
                <div class="shellcode-templates">
                    <h4>Quick Templates:</h4>
                    <div class="templates-grid">
                        <button class="template-btn" data-template="exit">Exit</button>
                        <button class="template-btn" data-template="hello">Hello World</button>
                        <button class="template-btn" data-template="shell">Spawn Shell</button>
                        <button class="template-btn" data-template="reverse">Reverse Shell</button>
                        <button class="template-btn" data-template="mmap">Allocate Memory</button>
                        <button class="template-btn" data-template="antidebug">Anti-Debug</button>
                    </div>
                </div>
            </div>
        `;
    }

    getFilteredSyscalls() {
        let filtered = [...this.syscalls];
        
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(s => s.category === this.currentCategory);
        }
        
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query) ||
                (s.signature && s.signature.toLowerCase().includes(query))
            );
        }
        
        return filtered.sort((a, b) => a.number - b.number);
    }

    highlightAsm(code) {
        return code
            .replace(/;[^\n]*/g, '<span class="comment">$&</span>')
            .replace(/\b(mov|lea|push|pop|call|syscall|ret|jmp|je|jne|jz|jnz|cmp|test|xor|add|sub|inc|dec)\b/g, 
                     '<span class="instruction">$1</span>')
            .replace(/\b(rax|rbx|rcx|rdx|rsi|rdi|rbp|rsp|r8|r9|r10|r11|r12|r13|r14|r15|eax|ebx|ecx|edx|al|ah|bl|bh)\b/g, 
                     '<span class="register">$1</span>')
            .replace(/0x[0-9a-fA-F]+|\b\d+\b/g, '<span class="number">$&</span>');
    }

    attachEventHandlers() {
        // OS Switcher
        document.querySelectorAll('.os-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentOS = e.target.dataset.os;
                this.loadSyscalls();
                this.render();
            });
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.render();
            });
        });

        // Search
        const searchInput = document.getElementById('syscall-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render();
            });
        }

        // Expand syscall details
        document.querySelectorAll('.syscall-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.classList.contains('copy-btn')) {
                    row.classList.toggle('expanded');
                }
            });
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const code = atob(e.target.dataset.copy);
                navigator.clipboard.writeText(code).then(() => {
                    e.target.textContent = 'Copied!';
                    setTimeout(() => e.target.textContent = 'Copy', 2000);
                });
            });
        });

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = this.getTemplate(e.target.dataset.template);
                document.getElementById('asm-input').value = template;
                this.assembleCode(template);
            });
        });

        // Generate shellcode
        document.getElementById('generate-shellcode')?.addEventListener('click', () => {
            const asm = document.getElementById('asm-input').value;
            this.assembleCode(asm);
        });
    }

    getTemplate(name) {
        const templates = {
            exit: `; Exit syscall
mov rax, 60     ; sys_exit
xor rdi, rdi    ; exit code 0
syscall`,
            hello: `; Hello World
mov rax, 1      ; sys_write
mov rdi, 1      ; stdout
lea rsi, [msg]  ; message
mov rdx, 13     ; length
syscall

msg: db "Hello, World!"`,
            shell: `; Spawn /bin/sh
mov rax, 59     ; sys_execve
lea rdi, [sh]   ; "/bin/sh"
xor rsi, rsi    ; argv = NULL
xor rdx, rdx    ; envp = NULL
syscall

sh: db "/bin/sh", 0`,
            reverse: SYSCALL_HELPERS.COMMON_SEQUENCES.linux_reverse_shell,
            mmap: `; Allocate RWX memory
mov rax, 9      ; sys_mmap
xor rdi, rdi    ; addr = NULL
mov rsi, 0x1000 ; 4096 bytes
mov rdx, 7      ; RWX
mov r10, 0x22   ; MAP_PRIVATE|MAP_ANONYMOUS
mov r8, -1      ; no file
xor r9, r9      ; offset = 0
syscall`,
            antidebug: `; Anti-debug check
mov rax, 101    ; sys_ptrace
xor rdi, rdi    ; PTRACE_TRACEME
xor rsi, rsi
xor rdx, rdx
xor r10, r10
syscall
test rax, rax
jnz debugger_detected`
        };
        return templates[name] || '';
    }

    assembleCode(asm) {
        // Simple hex representation (would need real assembler)
        const output = document.getElementById('hex-output');
        if (!output) return;
        
        // Mock assembly to hex
        const lines = asm.split('\n').filter(l => l.trim() && !l.trim().startsWith(';'));
        const hex = lines.map(line => {
            if (line.includes('mov rax')) return '48 c7 c0';
            if (line.includes('mov rdi')) return '48 c7 c7';
            if (line.includes('syscall')) return '0f 05';
            if (line.includes('xor')) return '48 31';
            return 'XX XX';
        }).join(' ');
        
        output.innerHTML = `
            <div style="font-family: monospace; word-wrap: break-word;">
                ${hex}
            </div>
            <div style="margin-top: 10px; color: #666; font-size: 12px;">
                Size: ${hex.split(' ').length} bytes
            </div>
        `;
    }

    setupEventListeners() {
        // Called once during init
    }
}

// Export for use in main app
window.SyscallsUI = SyscallsUI;
