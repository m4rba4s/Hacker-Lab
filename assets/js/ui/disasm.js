/**
 * Disassembly and Code Views
 * Handles the main content area with multiple tabs
 */

export const Disasm = {
    currentView: 'disasm',
    
    init(app) {
        console.log('Initializing Disasm UI...');
        this.app = app;
        this.setupElements();
        this.setupEventListeners();
        this.render();
    },
    
    setupElements() {
        this.viewContent = document.querySelector('.view-content');
        if (!this.viewContent) {
            throw new Error('View content element (.view-content) not found');
        }
        
        console.log('Disasm DOM elements found successfully');
    },
    
    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab && tab.dataset.tab) {
                this.switchView(tab.dataset.tab);
            }
        });
    },
    
    switchView(viewName) {
        this.currentView = viewName;
        
        // Update tab styling
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === viewName);
        });
        
        this.render();
    },
    
    render() {
        if (!this.viewContent) {
            console.error('ViewContent not available for rendering');
            // Try to find content element as fallback
            this.viewContent = document.querySelector('#disasm-content .view-content');
            if (!this.viewContent) {
                console.error('Could not find view content element');
                return;
            }
        }
        
        const content = this.viewContent;
        
        console.log(`Rendering view: ${this.currentView}`);
        
        switch (this.currentView) {
            case 'disasm':
                this.renderDisassembly(content);
                break;
            case 'source':
                this.renderSourceCode(content);
                break;
            case 'hex':
                this.renderHexView(content);
                break;
            case 'strings':
                this.renderStrings(content);
                break;
            case 'flow':
                this.renderFlow(content);
                break;
            case 'lesson':
                this.renderLesson(content);
                break;
            case 'stats':
                this.renderStats(content);
                break;
            case 'concepts':
                this.renderConcepts(content);
                break;
            case 'syscalls':
                this.renderSyscalls(content);
                break;
            default:
                content.innerHTML = '<p>View not implemented</p>';
        }
    },
    
    renderDisassembly(container) {
        if (!this.app.State.currentLesson || !this.app.State.currentLesson.disasm) {
            console.log('No lesson loaded for disassembly view');
            container.innerHTML = '<p class="muted">No lesson loaded. Use <code>load &lt;id&gt;</code> to load a lesson.</p>';
            return;
        }
        
        const disasm = this.app.State.currentLesson.disasm;
        const currentIP = this.app.State.ipIndex;
        
        let html = '<div class="disasm-container">';
        
        // Elite header
        html += `
            <div class="disasm-header">
                <div class="disasm-title">
                    <span>🔬</span>
                    <span>Elite Disassembly</span>
                    <span style="color: var(--muted); font-size: 11px;">IP: ${currentIP}/${disasm.length - 1}</span>
                </div>
                <div class="disasm-controls">
                    <button class="disasm-btn" id="toggle-analysis">📊 Analysis</button>
                    <button class="disasm-btn" id="set-breakpoint">🔴 Breakpoint</button>
                    <button class="disasm-btn" id="jump-to-addr">🎯 Jump</button>
                </div>
            </div>
        `;
        
        // Content area
        html += '<div class="disasm-content" id="disasm-content">';
        
        disasm.forEach((instr, i) => {
            const isCurrentIP = i === currentIP;
            const isBreakpoint = this.app.State.breakpoints.includes(instr.a);
            
            let rowClass = 'disasm-row patchable';
            if (isCurrentIP) rowClass += ' is-ip';
            if (isBreakpoint) rowClass += ' is-bp';
            
            html += `
                <div class="${rowClass}" data-addr="${instr.a}" data-index="${i}" title="Click for detailed analysis">
                    <div class="disasm-line-number">${i + 1}</div>
                    <div class="disasm-addr">${this.app.State.formatHex(instr.a)}</div>
                    <div class="disasm-bytes">${instr.b}</div>
                    <div class="disasm-mnemonic">${instr.s.split(' ')[0]}</div>
                    <div class="disasm-operands">${instr.s.split(' ').slice(1).join(' ')}</div>
                    <div class="disasm-comment">; ${this.generateSimpleComment(instr)}</div>
                </div>
            `;
        });
        
        html += '</div>'; // disasm-content
        
        // Analysis panel (hidden by default)
        html += '<div class="instruction-analysis" id="instruction-analysis"></div>';
        
        html += '</div>'; // disasm-container
        container.innerHTML = html;
        
        // Setup event listeners
        this.setupDisasmEventListeners();
    },
    
    generateSimpleComment(instr) {
        const asm = instr.s.toLowerCase();
        
        if (asm.startsWith('mov')) return 'Data movement';
        if (asm.startsWith('add')) return 'Addition';
        if (asm.startsWith('sub')) return 'Subtraction';
        if (asm.startsWith('call')) return 'Function call';
        if (asm.startsWith('ret')) return 'Return';
        if (asm.startsWith('jmp')) return 'Unconditional jump';
        if (asm.match(/^j[a-z]+/)) return 'Conditional jump';
        if (asm.startsWith('push')) return 'Push to stack';
        if (asm.startsWith('pop')) return 'Pop from stack';
        if (asm.startsWith('cmp')) return 'Compare values';
        
        return '';
    },
    
    setupDisasmEventListeners() {
        const container = document.querySelector('.disasm-container');
        if (!container) return;
        
        // Row click handlers
        container.querySelectorAll('.disasm-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const addr = row.dataset.addr;
                const index = parseInt(row.dataset.index);
                
                if (e.ctrlKey || e.metaKey) {
                    // Ctrl+click to toggle breakpoint
                    this.app.Terminal.executeCommand(`break ${parseInt(addr).toString(16)}`);
                } else {
                    // Regular click to jump to instruction
                    this.app.State.ipIndex = index;
                    this.app.State.regs.rip = BigInt(addr);
                    this.app.updateUI();
                }
            });
        });
        
        // Control button handlers
        const analysisBtn = container.querySelector('#toggle-analysis');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', () => {
                const panel = document.getElementById('instruction-analysis');
                if (panel) panel.classList.toggle('show');
            });
        }
    },

    renderSourceCode(container) {
        if (!this.app.State.currentLesson) {
            container.innerHTML = '<p class="muted">No lesson loaded. Use <code>load &lt;id&gt;</code> to load a lesson.</p>';
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        
        let html = '<div class="source-container">';
        html += '<div class="source-header">';
        html += `<h3><span class="source-icon">📄</span> ${this.escapeHtml(lesson.title)}</h3>`;
        
        // Определяем тип кода и показываем соответствующую информацию
        let codeType = 'No code available';
        let compilationInfo = '';
        let hasSourceCode = false;
        let hasAssemblyCode = false;
        
        if (lesson.sourceCode) {
            codeType = 'C/C++ Source Code';
            compilationInfo = lesson.compilationInfo || 'gcc -O0 -fno-stack-protector -m64';
            hasSourceCode = true;
        } else if (lesson.code) {
            codeType = 'Assembly Source Code';
            compilationInfo = 'nasm -f elf64 -o program.o && ld -o program program.o';
            hasAssemblyCode = true;
        }
        
        html += `<div class="compilation-info">
            <span class="code-type">${codeType}</span>
            ${compilationInfo && `<span class="compilation-cmd">${compilationInfo}</span>`}
        </div>`;
        html += '</div>';
        
        // Показываем исходный код
        if (hasSourceCode) {
            html += '<div class="source-code c-code">';
            html += '<div class="code-header">🔤 C/C++ Source:</div>';
            html += `<pre><code class="language-c">${this.highlightCCode(lesson.sourceCode)}</code></pre>`;
            html += '</div>';
            
            // Показываем маппинг если есть
            if (lesson.sourceMapping) {
                html += '<div class="source-mapping">';
                html += '<h4>📍 Source-to-Assembly Mapping:</h4>';
                lesson.sourceMapping.forEach((mapping, i) => {
                    html += `<div class="mapping-item">
                        <div class="mapping-header">
                            <span class="source-line">Line ${mapping.sourceLine}:</span>
                            <span class="asm-range">→ ASM [${mapping.asmRange[0]}-${mapping.asmRange[1]}]</span>
                        </div>
                        <div class="source-text"><code>${this.escapeHtml(mapping.sourceText)}</code></div>
                        <div class="mapping-explanation">${this.escapeHtml(mapping.explanation)}</div>
                    </div>`;
                });
                html += '</div>';
            }
        } else if (hasAssemblyCode) {
            html += '<div class="source-code asm-code">';
            html += '<div class="code-header">⚙️ Assembly Source:</div>';
            html += `<pre><code class="language-asm">${this.highlightAsmCode(lesson.code)}</code></pre>`;
            html += '</div>';
            
            // Add auto-generated pseudo C above assembly
            try {
                const pseudo = this.generatePseudoC(lesson.code);
                if (pseudo && pseudo.length > 0) {
                    html += '<div class="source-code c-code pseudo-code">';
                    html += '<div class="code-header">🧠 Pseudo-C (auto-generated)</div>';
                    html += `<pre><code class="language-c">${this.highlightCCode(pseudo)}</code></pre>`;
                    html += '</div>';
                }
            } catch (e) {
                console.warn('Pseudo-C generation failed:', e);
            }
            
            // Добавляем информацию об Assembly
            html += '<div class="assembly-info">';
            html += '<h4>🔧 Assembly Instructions Explained:</h4>';
            html += '<div class="asm-explanation">';
            html += '<p>This lesson works directly with assembly language - the human-readable form of machine code.</p>';
            html += '<ul>';
            html += '<li><strong>Instructions:</strong> Commands like MOV, ADD, JMP that the CPU executes</li>';
            html += '<li><strong>Registers:</strong> High-speed storage locations (RAX, RBX, etc.)</li>';
            html += '<li><strong>Memory:</strong> Data stored in RAM, accessed via addresses</li>';
            html += '<li><strong>Labels:</strong> Named locations for jumps and function calls</li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
        } else {
            html += '<div class="no-source enhanced">';
            html += '<h3>⚠️ Source Code Debug Info</h3>';
            html += '<p class="debug-info">Lesson ID: <strong>' + (lesson.id || 'unknown') + '</strong></p>';
            html += '<p class="debug-info">Title: <strong>' + (lesson.title || 'unknown') + '</strong></p>';
            html += '<p class="debug-info">Has sourceCode: ' + (!!(lesson.sourceCode)) + '</p>';
            html += '<p class="debug-info">Has code: ' + (!!(lesson.code)) + '</p>';
            if (lesson.code) {
                html += '<div class="fallback-code">';
                html += '<h4>📄 Available Assembly Code:</h4>';
                html += `<pre><code class="language-asm">${this.highlightAsmCode(lesson.code)}</code></pre>`;
                html += '</div>';
            }
            html += '<div class="lesson-tip">';
            html += '<h4>💡 What to do when there\'s no source?</h4>';
            html += '<ul>';
            html += '<li>Use the <strong>Disassembly</strong> tab to see machine instructions</li>';
            html += '<li>Check <strong>Strings</strong> for hardcoded text and error messages</li>';
            html += '<li>Analyze <strong>Hex View</strong> for binary patterns and structures</li>';
            html += '<li>Use <strong>Flow</strong> to understand program logic visually</li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
        }
        
        // Показываем контент урока если есть
        if (lesson.content) {
            html += '<div class="lesson-content">';
            html += '<h4>📚 Lesson Content:</h4>';
            html += this.renderMarkdown(lesson.content);
            html += '</div>';
        }
        
        // Дополнительная информация
        if (lesson.objective) {
            html += '<div class="lesson-objective">';
            html += `<h4>🎯 Objective:</h4>`;
            html += `<p>${this.escapeHtml(lesson.objective)}</p>`;
            html += '</div>';
        }
        
        if (lesson.hints && lesson.hints.length > 0) {
            html += '<div class="lesson-hints">';
            html += `<h4>💡 Hints:</h4>`;
            html += '<ul>';
            lesson.hints.forEach(hint => {
                html += `<li>${this.escapeHtml(hint)}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    },

    renderHexView(container) {
        if (!this.app.State.currentLesson) {
            container.innerHTML = '<p class="muted">No lesson loaded.</p>';
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        const bytes = lesson.bytes;
        
        let html = '<div class="hex-container">';
        
        if (!bytes || bytes.length === 0) {
            // No binary data available
            html += `
                <div class="disasm-header">
                    <div class="disasm-title">
                        <span>🗃️</span>
                        <span>Hex Editor</span>
                        <span style="color: var(--muted); font-size: 11px;">No binary data</span>
                    </div>
                </div>
            `;
            
            html += `
                <div class="no-hex-data">
                    <h3>⚠️ No Binary Data Available</h3>
                    <p class="muted">This lesson doesn't contain binary data for hex analysis.</p>
                    
                    <div class="hex-help">
                        <h4>💡 What is hex analysis used for?</h4>
                        <ul>
                            <li><strong>Binary inspection:</strong> View raw program bytes</li>
                            <li><strong>Pattern recognition:</strong> Find strings, numbers, structures</li>
                            <li><strong>Malware analysis:</strong> Identify packed/encrypted sections</li>
                            <li><strong>Reverse engineering:</strong> Understand file formats</li>
                            <li><strong>Exploit development:</strong> Craft payloads, find gadgets</li>
                        </ul>
                        
                        <div class="hex-examples">
                            <h5>📋 Common hex patterns:</h5>
                            <div class="pattern-grid">
                                <div class="pattern-item">
                                    <code>4D 5A</code> - PE executable header
                                </div>
                                <div class="pattern-item">
                                    <code>7F 45 4C 46</code> - ELF header
                                </div>
                                <div class="pattern-item">
                                    <code>FF D0</code> - call eax
                                </div>
                                <div class="pattern-item">
                                    <code>90 90 90</code> - NOP sled
                                </div>
                            </div>
                        </div>
                        
                        <p class="hint">🔍 Try lessons with binary analysis or exploitation!</p>
                    </div>
                </div>
            `;
        } else {
            // Enhanced hex editor header
            html += `
                <div class="disasm-header">
                    <div class="disasm-title">
                        <span>🗃️</span>
                        <span>Hex Editor</span>
                        <span style="color: var(--muted); font-size: 11px;">Size: ${bytes.length} bytes</span>
                    </div>
                    <div class="disasm-controls">
                        <button class="disasm-btn" id="search-hex">🔍 Search</button>
                        <button class="disasm-btn" id="goto-offset">🎯 Go To</button>
                        <button class="disasm-btn" id="export-hex">💾 Export</button>
                    </div>
                </div>
            `;
            
            // Hex analysis summary
            const analysis = this.analyzeBytes(bytes);
            html += `
                <div class="hex-analysis">
                    <h4>📊 Binary Analysis:</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <span class="analysis-label">Entropy:</span>
                            <span class="analysis-value">${analysis.entropy.toFixed(2)}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Null bytes:</span>
                            <span class="analysis-value">${analysis.nullBytes}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Printable:</span>
                            <span class="analysis-value">${analysis.printableBytes}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Patterns:</span>
                            <span class="analysis-value">${analysis.patterns.length}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Hex dump with enhanced formatting
            html += '<div class="hex-dump">';
            for (let i = 0; i < bytes.length; i += 16) {
                const offset = i.toString(16).padStart(8, '0').toUpperCase();
                let hexPart = '';
                let asciiPart = '';
                
                for (let j = 0; j < 16; j++) {
                    if ((i + j) < bytes.length) {
                        const byte = bytes[i + j];
                        const hexByte = byte.toString(16).padStart(2, '0').toUpperCase();
                        const byteClass = this.getByteClass(byte);
                        
                        hexPart += `<span class="hex-byte ${byteClass}" title="Offset: 0x${(i+j).toString(16).toUpperCase()}, Value: ${byte}">${hexByte}</span> `;
                        asciiPart += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
                    } else {
                        hexPart += '<span class="hex-byte empty">  </span> ';
                        asciiPart += ' ';
                    }
                    
                    // Add separator after 8 bytes
                    if (j === 7) hexPart += ' ';
                }
                
                html += `
                    <div class="hex-row enhanced">
                        <span class="hex-offset enhanced">${offset}</span>
                        <span class="hex-bytes enhanced">${hexPart}</span>
                        <span class="hex-ascii enhanced">${asciiPart}</span>
                    </div>
                `;
            }
            html += '</div>';
            
            // Pattern analysis if found
            if (analysis.patterns.length > 0) {
                html += '<div class="pattern-analysis">';
                html += '<h4>🔍 Detected Patterns:</h4>';
                analysis.patterns.forEach(pattern => {
                    html += `<div class="pattern-found">
                        <span class="pattern-type">${pattern.type}:</span>
                        <span class="pattern-desc">${pattern.description}</span>
                    </div>`;
                });
                html += '</div>';
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // Анализ байтов
    analyzeBytes(bytes) {
        let nullBytes = 0;
        let printableBytes = 0;
        const byteCounts = new Array(256).fill(0);
        const patterns = [];
        
        // Подсчет статистики
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            byteCounts[byte]++;
            
            if (byte === 0) nullBytes++;
            if (byte >= 32 && byte <= 126) printableBytes++;
        }
        
        // Вычисление энтропии
        let entropy = 0;
        for (let count of byteCounts) {
            if (count > 0) {
                const p = count / bytes.length;
                entropy -= p * Math.log2(p);
            }
        }
        
        // Поиск паттернов
        if (bytes.length >= 2) {
            // PE header
            if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
                patterns.push({type: 'PE Header', description: 'Windows executable file'});
            }
            
            // ELF header
            if (bytes.length >= 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
                patterns.push({type: 'ELF Header', description: 'Linux executable file'});
            }
        }
        
        // Повторяющиеся байты
        for (let i = 0; i < bytes.length - 2; i++) {
            if (bytes[i] === bytes[i+1] && bytes[i+1] === bytes[i+2]) {
                patterns.push({type: 'Repeated bytes', description: `Pattern 0x${bytes[i].toString(16)} at offset 0x${i.toString(16)}`});
                break;
            }
        }
        
        return {
            entropy,
            nullBytes,
            printableBytes,
            patterns
        };
    },
    
    // Классификация байтов для подсветки
    getByteClass(byte) {
        if (byte === 0) return 'null-byte';
        if (byte >= 32 && byte <= 126) return 'printable';
        if (byte === 0x90) return 'nop-instruction';  // NOP
        if (byte >= 0x40 && byte <= 0x4F) return 'rex-prefix';  // REX prefixes
        return 'non-printable';
    },

    renderStrings(container) {
        if (!this.app.State.currentLesson) {
            container.innerHTML = '<p class="muted">No lesson loaded.</p>';
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        const strings = lesson.strings || [];
        
        let html = '<div class="strings-container">';
        
        // Enhanced header
        html += `
            <div class="disasm-header">
                <div class="disasm-title">
                    <span>🔤</span>
                    <span>String Analysis</span>
                    <span style="color: var(--muted); font-size: 11px;">Found: ${strings.length} strings</span>
                </div>
                <div class="disasm-controls">
                    <button class="disasm-btn" id="extract-strings">🔍 Extract All</button>
                    <button class="disasm-btn" id="search-strings">🎯 Search</button>
                </div>
            </div>
        `;
        
        if (strings.length === 0) {
            html += `
                <div class="no-strings">
                    <h3>⚠️ No String Literals Found</h3>
                    <p class="muted">This lesson doesn't contain explicit string data.</p>
                    <div class="string-help">
                        <h4>💡 What are strings in assembly?</h4>
                        <ul>
                            <li><strong>String literals:</strong> "Hello World" in source code</li>
                            <li><strong>ASCII data:</strong> db "text", 0 in assembly</li>
                            <li><strong>Format strings:</strong> printf("%d", value)</li>
                            <li><strong>Error messages:</strong> "Access denied", "Invalid input"</li>
                        </ul>
                        <p class="hint">📝 Try lessons with string operations or error handling!</p>
                    </div>
                </div>
            `;
        } else {
            html += '<div class="strings-list">';
            
            strings.forEach((str, i) => {
                const analysis = this.analyzeString(str);
                
                html += `<div class="string-item enhanced">
                    <div class="string-header">
                        <span class="string-index">[${i}]</span>
                        <span class="string-length">${str.length} chars</span>
                        <span class="string-type ${analysis.type}">${analysis.type.toUpperCase()}</span>
                    </div>
                    <div class="string-content">
                        <div class="string-value">"${this.escapeHtml(str)}"</div>
                        <div class="string-hex">${this.stringToHex(str)}</div>
                    </div>
                    <div class="string-analysis">
                        ${analysis.description}
                    </div>
                </div>`;
            });
            
            html += '</div>';
            
            // String statistics
            html += '<div class="string-stats">';
            html += '<h4>📊 String Statistics:</h4>';
            html += '<div class="stats-grid">';
            html += `<div class="stat-item">
                <span class="stat-label">Total Strings:</span>
                <span class="stat-value">${strings.length}</span>
            </div>`;
            html += `<div class="stat-item">
                <span class="stat-label">Total Characters:</span>
                <span class="stat-value">${strings.reduce((sum, s) => sum + s.length, 0)}</span>
            </div>`;
            html += `<div class="stat-item">
                <span class="stat-label">Longest String:</span>
                <span class="stat-value">${Math.max(...strings.map(s => s.length))} chars</span>
            </div>`;
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // Анализ типа строки
    analyzeString(str) {
        if (str.includes('HTB{') || str.includes('flag') || str.includes('CTF')) {
            return {
                type: 'flag',
                description: '🚩 <strong>CTF Flag:</strong> Potential capture-the-flag flag or challenge identifier'
            };
        } else if (str.includes('error') || str.includes('Error') || str.includes('fail')) {
            return {
                type: 'error',
                description: '❌ <strong>Error Message:</strong> Used for error reporting or debugging'
            };
        } else if (str.includes('%') && (str.includes('d') || str.includes('s') || str.includes('x'))) {
            return {
                type: 'format',
                description: '📄 <strong>Format String:</strong> Used with printf/scanf family functions'
            };
        } else if (str.length <= 8 && /^[A-Z_]+$/.test(str)) {
            return {
                type: 'constant',
                description: '🔧 <strong>Constant:</strong> Likely a symbolic constant or identifier'
            };
        } else if (str.includes('\\') || str.includes('\n') || str.includes('\t')) {
            return {
                type: 'escaped',
                description: '🔀 <strong>Escaped String:</strong> Contains escape sequences or special characters'
            };
        } else {
            return {
                type: 'literal',
                description: '📝 <strong>String Literal:</strong> Plain text string for display or processing'
            };
        }
    },
    
    // Конвертация строки в hex
    stringToHex(str) {
        return Array.from(str)
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
    },

    renderFlow(container) {
        if (!this.app.State.currentLesson) {
            container.innerHTML = '<p class="muted">No lesson loaded.</p>';
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        let disasm = lesson.disasm;
        
        // Fallback: synthesize minimal disasm from assembly code if disasm missing
        if ((!disasm || disasm.length === 0) && lesson.code) {
            const lines = lesson.code.split('\n').map(l => l.trim()).filter(Boolean);
            let addr = 0x401000;
            disasm = lines
                .filter(l => !/^;/.test(l) && !/^section\b/i.test(l) && !/^global\b/i.test(l) && !/^[A-Za-z_][A-Za-z0-9_]*:\s*$/.test(l))
                .map(l => ({ a: addr += 5, b: [], s: l }));
        }
        
        if (!disasm || disasm.length === 0) {
            container.innerHTML = `
                <div class="flow-container">
                    <div class="disasm-header">
                        <div class="disasm-title">
                            <span>🌊</span>
                            <span>Control Flow Graph</span>
                            <span style="color: var(--muted); font-size: 11px;">No data</span>
                        </div>
                    </div>
                    <div class="no-flow-data">
                        <h3>⚠️ No Control Flow Available</h3>
                        <p class="muted">This lesson doesn't include disassembly yet.</p>
                        <div class="flow-help">
                            <h4>💡 How to read a CFG?</h4>
                            <ul>
                                <li>Blocks represent straight-line code without jumps</li>
                                <li>Arrows show transitions: conditional, jumps, calls, returns</li>
                                <li>Entry → computation → branches → exit</li>
                            </ul>
                        </div>
                    </div>
                </div>`;
            return;
        }
        
        // Header + SVG mount for simple flow
        let html = '<div class="flow-container">';
        html += `
            <div class="disasm-header">
                <div class="disasm-title">
                    <span>🌊</span>
                    <span>Control Flow Graph</span>
                    <span style="color: var(--muted); font-size: 11px;">Blocks: ${this.analyzeBasicBlocks(disasm).length}</span>
                </div>
                <div class="disasm-controls">
                    <button class="disasm-btn" id="reset-view">🔄 Reset View</button>
                    <button class="disasm-btn" id="center-current">🎯 Center Current</button>
                </div>
            </div>
            <div id="flow-canvas-container" style="height: 520px; overflow: auto; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px;">
                ${this.renderSimpleFlowGraph(disasm)}
            </div>
        `;
        html += '</div>';
        container.innerHTML = html;
        
        // Setup button handlers for simple flow
        const resetBtn = container.querySelector('#reset-view');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            container.querySelector('#flow-canvas-container').scrollTop = 0;
            container.querySelector('#flow-canvas-container').scrollLeft = 0;
        });
        
        const centerBtn = container.querySelector('#center-current');
        if (centerBtn) centerBtn.addEventListener('click', () => {
            const currentBlock = container.querySelector('.flow-block.active');
            if (currentBlock) {
                currentBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    },
    
    // Simple HTML-based flow graph rendering
    renderSimpleFlowGraph(disasm) {
        const blocks = this.analyzeBasicBlocks(disasm);
        
        if (blocks.length === 0) {
            return '<p style="color: var(--muted); text-align: center;">No control flow to display</p>';
        }
        
        let html = '<svg width="100%" height="600" viewBox="0 0 800 600" style="background: transparent;">';
        
        // Define arrow markers
        html += `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#7ea8ff" />
                </marker>
                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#49f7c2" />
                </marker>
            </defs>
        `;
        
        // Calculate positions for blocks
        const blockPositions = [];
        const blockHeight = 80;
        const blockWidth = 200;
        const xSpacing = 250;
        const ySpacing = 120;
        
        blocks.forEach((block, index) => {
            const x = 100 + (index % 3) * xSpacing;
            const y = 50 + Math.floor(index / 3) * ySpacing;
            blockPositions.push({ x, y, block, index });
        });
        
        // Draw connections first (behind blocks)
        blockPositions.forEach((pos, i) => {
            const block = pos.block;
            const lastInstr = block.instructions[block.instructions.length - 1];
            const asm = lastInstr.s.toLowerCase();
            
            // Determine next blocks
            if (asm.match(/^j[a-z]+/) && !asm.startsWith('jmp')) {
                // Conditional jump - connect to next block (fallthrough) and jump target
                if (i < blockPositions.length - 1) {
                    // Fallthrough edge
                    html += this.drawEdge(pos.x + blockWidth/2, pos.y + blockHeight, 
                                         blockPositions[i+1].x + blockWidth/2, blockPositions[i+1].y,
                                         'fallthrough');
                }
                // Jump edge (simplified - just to next+1 for demo)
                if (i < blockPositions.length - 2) {
                    html += this.drawEdge(pos.x + blockWidth, pos.y + blockHeight/2,
                                         blockPositions[i+2].x, blockPositions[i+2].y + blockHeight/2,
                                         'jump');
                }
            } else if (!asm.startsWith('ret') && i < blockPositions.length - 1) {
                // Normal flow to next block
                html += this.drawEdge(pos.x + blockWidth/2, pos.y + blockHeight,
                                     blockPositions[i+1].x + blockWidth/2, blockPositions[i+1].y,
                                     'normal');
            }
        });
        
        // Draw blocks
        blockPositions.forEach((pos, i) => {
            const block = pos.block;
            const isActive = this.app.State.ipIndex >= block.start && this.app.State.ipIndex <= block.end;
            const blockType = this.getBlockType(block);
            
            // Block rectangle
            html += `<rect x="${pos.x}" y="${pos.y}" width="${blockWidth}" height="${blockHeight}"
                          fill="${isActive ? 'rgba(73, 247, 194, 0.2)' : 'rgba(16, 22, 29, 0.9)'}"
                          stroke="${isActive ? '#49f7c2' : '#7ea8ff'}"
                          stroke-width="2"
                          rx="8"
                          class="flow-block ${isActive ? 'active' : ''}" />`;
            
            // Block label
            html += `<text x="${pos.x + 10}" y="${pos.y + 20}" fill="#49f7c2" font-size="12" font-weight="bold">
                        Block ${i} (${blockType})
                     </text>`;
            
            // First instruction preview
            if (block.instructions.length > 0) {
                const firstInstr = block.instructions[0];
                html += `<text x="${pos.x + 10}" y="${pos.y + 40}" fill="#e6f1ff" font-size="11" font-family="monospace">
                            ${this.formatHex(firstInstr.a, 32)}: ${firstInstr.s.substring(0, 20)}
                         </text>`;
            }
            
            // Instruction count
            html += `<text x="${pos.x + 10}" y="${pos.y + 60}" fill="#8aa2b2" font-size="10">
                        ${block.instructions.length} instructions
                     </text>`;
        });
        
        html += '</svg>';
        return html;
    },
    
    drawEdge(x1, y1, x2, y2, type) {
        const color = type === 'jump' ? '#ffd36e' : type === 'fallthrough' ? '#4df3a3' : '#7ea8ff';
        const strokeDash = type === 'jump' ? 'stroke-dasharray="5,5"' : '';
        
        // Simple bezier curve for better visuals
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const ctrlX = midX;
        const ctrlY = type === 'jump' ? Math.min(y1, y2) - 30 : midY;
        
        return `<path d="M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}"
                     fill="none" stroke="${color}" stroke-width="2" ${strokeDash}
                     marker-end="url(#arrowhead)" opacity="0.7" />`;
    },
    
    formatHex(value, bits = 64) {
        const bigValue = BigInt(value);
        const hex = bigValue.toString(16).padStart(bits / 4, '0');
        return '0x' + hex;
    },

    renderLesson(container) {
        if (!this.app.State.currentLesson) {
            container.innerHTML = '<p class="muted">No lesson loaded.</p>';
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        const completed = this.app.Progress.isCompleted(lesson.id);
        
        let html = '<div class="lesson-container">';
        html += `<div class="lesson-card">`;
        html += `<h2>${this.escapeHtml(lesson.title)}</h2>`;
        
        // Lesson metadata
        if (lesson.level) {
            html += `<div class="lesson-meta">
                <span class="lesson-level">Level ${lesson.level}</span>
                ${lesson.xp ? `<span class="lesson-xp">${lesson.xp} XP</span>` : ''}
                ${lesson.skills ? `<span class="lesson-skills">${lesson.skills.join(', ')}</span>` : ''}
            </div>`;
        }
        
        if (lesson.content) {
            html += '<div class="lesson-content">';
            html += this.renderMarkdown(lesson.content);
            html += '</div>';
        }
        
        if (lesson.objective) {
            html += `<div class="lesson-objective">`;
            html += `<h4>🎯 Objective</h4>`;
            html += `<p>${this.escapeHtml(lesson.objective)}</p>`;
            html += `</div>`;
        }
        
        html += `<div class="lesson-actions">`;
        html += `<button id="lesson-check-btn-main" class="btn success">Check Solution</button>`;
        html += `<button id="lesson-reset-btn-main" class="btn">Reset</button>`;
        
        if (completed) {
            html += `<span class="lesson-status completed">✓ Completed</span>`;
        }
        
        html += `</div>`;
        html += `</div>`;
        
        // Add interactive memory diagrams for appropriate lessons
        if (this.shouldShowMemoryDiagram(lesson)) {
            html += '<div id="memory-diagram-container"></div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelector('#lesson-check-btn-main').addEventListener('click', () => this.app.Terminal.executeCommand('check'));
        container.querySelector('#lesson-reset-btn-main').addEventListener('click', () => this.app.Terminal.executeCommand('reset'));
        
        // Mount memory diagram
        if (this.shouldShowMemoryDiagram(lesson)) {
            this.mountMemoryDiagram(lesson);
        }
    },

    renderStats(container) {
        if (!this.app.Gamification) {
            container.innerHTML = '<p class="muted">Gamification system not loaded.</p>';
            return;
        }
        
        const stats = this.app.Gamification.getStats();
        const levelTitle = this.app.Gamification.levels.getLevelTitle(stats.level);
        
        let html = '<div class="stats-container">';
        
        // Level and XP section
        html += '<div class="stats-section">';
        html += '<h2>🎯 Your Progress</h2>';
        html += '<div class="stats-dashboard">';
        
        html += `<div class="stat-card">
            <div class="stat-value">${stats.level}</div>
            <div class="stat-label">Level</div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-value">${stats.xp}</div>
            <div class="stat-label">Total XP</div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-value">${stats.totalLessons}</div>
            <div class="stat-label">Lessons</div>
        </div>`;
        
        html += `<div class="stat-card">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">Streak</div>
        </div>`;
        
        html += '</div>';
        html += `<p class="level-title">Current Title: <strong>${levelTitle}</strong></p>`;
        html += '</div>';
        
        // Achievements section
        html += '<div class="stats-section">';
        html += '<h3>🏆 Achievements</h3>';
        html += '<div class="achievement-grid">';
        
        const allAchievements = Object.values(this.app.Gamification.achievements);
        allAchievements.forEach(achievement => {
            const unlocked = stats.achievements.includes(achievement.id);
            const cardClass = unlocked ? 'achievement-card unlocked' : 'achievement-card locked';
            
            html += `<div class="${cardClass}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                ${unlocked ? `<div class="achievement-xp">+${achievement.xp} XP</div>` : '<div class="achievement-xp">🔒 Locked</div>'}
            </div>`;
        });
        
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
    },

    async renderConcepts(container) {
        // Import and use the new Concepts module
        try {
            const { Concepts } = await import('./concepts.js');
            Concepts.renderConcepts(container);
        } catch (error) {
            console.warn('Failed to load Concepts module, using fallback:', error);
            
            // Fallback to inline implementation if module fails to load
            let html = '<div class="concepts-container">';
            
            html += `
                <div class="concepts-header">
                    <h2>🎓 Assembly & Exploitation Concepts</h2>
                    <p>Interactive reference guide for reverse engineering</p>
                </div>
            `;
            
            // Memory layout with FIXED width
            html += `
                <div class="concept-section">
                    <h3>📊 Memory Layout</h3>
                    <div style="display: flex; justify-content: center; padding: 20px; overflow-x: auto;">
                        <div style="display: flex; flex-direction: column; gap: 2px; min-width: 600px; max-width: 800px; width: 100%; font-family: 'Fira Code', monospace; font-size: 13px;">
                            <div style="display: grid; grid-template-columns: 150px 1fr 200px; gap: 20px; align-items: center; padding: 12px 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(73, 247, 194, 0.2), rgba(73, 247, 194, 0.05)); border: 2px solid #49f7c2;">
                                <div style="font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">STACK</div>
                                <div style="color: #e6f1ff; opacity: 0.9; line-height: 1.4; padding: 0 10px;">Local variables, function parameters, return addresses</div>
                                <div style="text-align: right; color: #8aa2b2; font-family: monospace; font-size: 12px;">0x7fffffffe000</div>
                            </div>
                            <div style="text-align: center; color: #49f7c2; font-size: 16px; margin: 5px 0; opacity: 0.6;">↓ grows down</div>
                            <div style="display: grid; grid-template-columns: 150px 1fr 200px; gap: 20px; align-items: center; padding: 12px 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(126, 168, 255, 0.2), rgba(126, 168, 255, 0.05)); border: 2px solid #7ea8ff;">
                                <div style="font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">HEAP</div>
                                <div style="color: #e6f1ff; opacity: 0.9; line-height: 1.4; padding: 0 10px;">Dynamic memory (malloc, new), grows upward</div>
                                <div style="text-align: right; color: #8aa2b2; font-family: monospace; font-size: 12px;">0x555555559000</div>
                            </div>
                            <div style="text-align: center; color: #49f7c2; font-size: 16px; margin: 5px 0; opacity: 0.6;">↑ grows up</div>
                            <div style="display: grid; grid-template-columns: 150px 1fr 200px; gap: 20px; align-items: center; padding: 12px 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(255, 211, 110, 0.2), rgba(255, 211, 110, 0.05)); border: 2px solid #ffd36e;">
                                <div style="font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">DATA/BSS</div>
                                <div style="color: #e6f1ff; opacity: 0.9; line-height: 1.4; padding: 0 10px;">Global/static variables, initialized and uninitialized</div>
                                <div style="text-align: right; color: #8aa2b2; font-family: monospace; font-size: 12px;">0x555555558000</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 150px 1fr 200px; gap: 20px; align-items: center; padding: 12px 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(255, 92, 122, 0.2), rgba(255, 92, 122, 0.05)); border: 2px solid #ff5c7a;">
                                <div style="font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">TEXT</div>
                                <div style="color: #e6f1ff; opacity: 0.9; line-height: 1.4; padding: 0 10px;">Program code, read-only, executable instructions</div>
                                <div style="text-align: right; color: #8aa2b2; font-family: monospace; font-size: 12px;">0x555555554000</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            html += '</div>';
            container.innerHTML = html;
        }
    },

    // Helper functions
    shouldShowMemoryDiagram(lesson) {
        const memoryTopics = ['memory', 'stack', 'heap', 'buffer_overflow', 'pointers'];
        return lesson.skills && lesson.skills.some(skill => memoryTopics.includes(skill));
    },
    
    async mountMemoryDiagram(lesson) {
        const container = document.getElementById('memory-diagram-container');
        if (!container) return;
        
        try {
            const { MemoryViz } = await import('./memory_viz.js');
            MemoryViz.init(container);
        } catch (error) {
            console.warn('Failed to load memory visualization:', error);
        }
    },

    analyzeBasicBlocks(disasm) {
        const blocks = [];
        let currentBlock = { start: 0, end: 0, instructions: [] };
        
        for (let i = 0; i < disasm.length; i++) {
            const instr = disasm[i];
            const asm = instr.s.toLowerCase();
            currentBlock.instructions.push(instr);
            
            // Check if this instruction ends a basic block
            if (asm.startsWith('ret') || 
                asm.startsWith('jmp') || 
                asm.match(/^j[a-z]+/) ||
                asm.startsWith('call') ||
                i === disasm.length - 1) {
                
                currentBlock.end = i;
                blocks.push({ ...currentBlock });
                
                if (i < disasm.length - 1) {
                    currentBlock = { start: i + 1, end: 0, instructions: [] };
                }
            }
        }
        
        return blocks;
    },
    
    getBlockType(block) {
        if (!block.instructions || block.instructions.length === 0) return 'normal';
        
        const lastInstr = block.instructions[block.instructions.length - 1].s.toLowerCase();
        
        if (block.start === 0) return 'entry';
        if (lastInstr.startsWith('ret')) return 'exit';
        if (lastInstr.startsWith('call')) return 'call';
        if (lastInstr.match(/^j[a-z]+/) && !lastInstr.startsWith('jmp')) return 'conditional';
        if (lastInstr.startsWith('jmp')) return 'jump';
        
        return 'normal';
    },
    
    // Найти следующие блоки для данного блока
    findNextBlocks(block, allBlocks, disasm) {
        if (!block.instructions || block.instructions.length === 0) return [];
        
        const lastInstr = block.instructions[block.instructions.length - 1].s.toLowerCase();
        const nextBlocks = [];
        
        // Если это не последний блок, может быть fallthrough
        const currentBlockIndex = allBlocks.findIndex(b => b.start === block.start);
        
        if (lastInstr.startsWith('ret')) {
            return []; // Нет следующих блоков для return
        }
        
        if (lastInstr.match(/^j[a-z]+/) && !lastInstr.startsWith('jmp')) {
            // Условный переход - может быть fallthrough и jump target
            if (currentBlockIndex < allBlocks.length - 1) {
                nextBlocks.push(currentBlockIndex + 1); // Fallthrough
            }
            // TODO: определить jump target (требует парсинга адресов)
        } else if (lastInstr.startsWith('jmp')) {
            // Безусловный переход - только jump target
            // TODO: определить jump target
        } else if (!lastInstr.startsWith('call')) {
            // Обычная инструкция - fallthrough
            if (currentBlockIndex < allBlocks.length - 1) {
                nextBlocks.push(currentBlockIndex + 1);
            }
        } else {
            // Call - fallthrough после возврата
            if (currentBlockIndex < allBlocks.length - 1) {
                nextBlocks.push(currentBlockIndex + 1);
            }
        }
        
        return nextBlocks;
    },
    
    // Определить тип соединения между блоками
    getConnectionType(fromBlock, toBlockIndex, disasm) {
        if (!fromBlock.instructions || fromBlock.instructions.length === 0) return 'normal';
        
        const lastInstr = fromBlock.instructions[fromBlock.instructions.length - 1].s.toLowerCase();
        
        if (lastInstr.match(/^j[a-z]+/) && !lastInstr.startsWith('jmp')) {
            return 'conditional';
        } else if (lastInstr.startsWith('jmp')) {
            return 'jump';
        } else if (lastInstr.startsWith('call')) {
            return 'call';
        } else {
            return 'fallthrough';
        }
    },

    // Подсветка C/C++ кода
    highlightCCode(code) {
        let highlighted = this.escapeHtml(code);
        
        // C/C++ keywords
        const cKeywords = ['int', 'char', 'void', 'const', 'return', 'if', 'else', 'while', 'for', 
                          'break', 'continue', 'switch', 'case', 'default', 'struct', 'typedef',
                          'size_t', 'include', 'define', 'main', 'stddef'];
        
        cKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');
        
        // Comments
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b0x[0-9a-fA-F]+\b/g, '<span class="number hex">$&</span>');
        highlighted = highlighted.replace(/\b\d+\b/g, '<span class="number">$&</span>');
        
        // Preprocessor
        highlighted = highlighted.replace(/#\w+/g, '<span class="preprocessor">$&</span>');
        
        return highlighted;
    },
    
    // Подсветка Assembly кода
    highlightAsmCode(code) {
        let highlighted = this.escapeHtml(code);
        
        // Assembly instructions
        const asmInstructions = ['mov', 'add', 'sub', 'mul', 'div', 'cmp', 'test', 'jmp', 'je', 'jne', 
                               'jz', 'jnz', 'jl', 'jg', 'jle', 'jge', 'call', 'ret', 'push', 'pop',
                               'inc', 'dec', 'xor', 'and', 'or', 'not', 'shl', 'shr', 'sar', 'rol', 'ror',
                               'lea', 'nop', 'int', 'syscall', 'times', 'db', 'dw', 'dd', 'dq', 'resb',
                               'resw', 'resd', 'resq', 'section', 'global', 'extern'];
        
        asmInstructions.forEach(instr => {
            const regex = new RegExp(`\\b${instr}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="asm-instruction">${instr}</span>`);
        });
        
        // Registers
        const registers = ['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rsp', 'rbp', 'r8', 'r9', 'r10', 'r11',
                          'r12', 'r13', 'r14', 'r15', 'eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'ebp',
                          'ax', 'bx', 'cx', 'dx', 'si', 'di', 'sp', 'bp', 'al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh'];
        
        registers.forEach(reg => {
            const regex = new RegExp(`\\b${reg}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="asm-register">${reg}</span>`);
        });
        
        // Hex numbers
        highlighted = highlighted.replace(/\b0x[0-9a-fA-F]+\b/g, '<span class="number hex">$&</span>');
        
        // Binary numbers
        highlighted = highlighted.replace(/\b0b[01]+\b/g, '<span class="number binary">$&</span>');
        
        // Decimal numbers
        highlighted = highlighted.replace(/\b\d+\b/g, '<span class="number">$&</span>');
        
        // Labels
        highlighted = highlighted.replace(/^(\w+):/gm, '<span class="asm-label">$1:</span>');
        
        // Memory references
        highlighted = highlighted.replace(/\[[^\]]+\]/g, '<span class="asm-memory">$&</span>');
        
        // Comments
        highlighted = highlighted.replace(/;.*$/gm, '<span class="comment">$&</span>');
        
        // Strings
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');
        
        return highlighted;
    },
    
    highlightCode(code) {
        let highlighted = this.escapeHtml(code);
        
        // Generic keywords
        const keywords = ['int', 'void', 'char', 'long', 'if', 'else', 'for', 'while', 'return'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">$1</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b(0x[0-9a-fA-F]+|\d+)\b/g, '<span class="number">$1</span>');
        
        // Comments
        highlighted = highlighted.replace(/\/\/([^\n]*)/g, '<span class="comment">// $1</span>');
        
        return highlighted;
    },

    // HTML escaping для безопасности
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    renderMarkdown(content) {
        if (!content || typeof content !== 'string') return '';
        
        // Escape first to prevent HTML injection
        let html = this.escapeHtml(content);
        
        // Code blocks ```...```
        html = html.replace(/```([\s\S]*?)```/g, (m, code) => {
            return `<pre><code>${code}</code></pre>`;
        });
        
        // Inline code `...`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Headings
        html = html.replace(/^###\s+(.*)$/gim, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.*)$/gim, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.*)$/gim, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Links [text](url) – allow only http/https
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
            const safeUrl = this.sanitizeLinkUrl(url);
            if (!safeUrl) return `${text}`; // drop unsafe link, keep text
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });
        
        // Lists: simple conversion for lines starting with - or *
        html = html.replace(/^(?:- |\* )(.*)$/gim, '<li>$1</li>');
        // Wrap consecutive <li> into <ul>
        html = html.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, match => `<ul>${match}</ul>`);
        
        // Line breaks for plain paragraphs
        html = html.replace(/\n/g, '<br/>');
        
        return html;
    },

    sanitizeLinkUrl(url) {
        try {
            const trimmed = (url || '').trim();
            if (!/^https?:\/\//i.test(trimmed)) return '';
            // Disallow quotes in attribute context
            return trimmed.replace(/"/g, '');
        } catch {
            return '';
        }
    },

    // Generate simple pseudo-C from assembly listing (best-effort heuristic)
    generatePseudoC(asmText) {
        try {
            if (!asmText || typeof asmText !== 'string') return '';
            const lines = asmText.split('\n').map(l => l.trim());
            const c = [];

            const toHex = (v) => {
                if (/^0x[0-9a-f]+$/i.test(v)) return v.toLowerCase();
                if (/^\d+$/.test(v)) return '0x' + (parseInt(v, 10) >>> 0).toString(16);
                return v;
            };

            // header
            c.push('int main(void) {');
            c.push('    // pseudo-C generated from assembly');

            const regSet = new Set(['rax','rbx','rcx','rdx','rsi','rdi','rbp','rsp','r8','r9','r10','r11','r12','r13','r14','r15','eax','ebx','ecx','edx','esi','edi','ebp','esp']);
            const declared = new Set();
            const ensureDecl = (name) => {
                if (!declared.has(name)) {
                    c.push(`    long ${name} = 0;`);
                    declared.add(name);
                }
            };

            let lastCmp = null;

            for (let raw of lines) {
                if (!raw || raw.startsWith(';')) continue;
                if (/^section\b/i.test(raw) || /^global\b/i.test(raw) || /^extern\b/i.test(raw)) continue;

                if (/^[A-Za-z_][A-Za-z0-9_]*:\s*$/.test(raw)) {
                    const label = raw.replace(':','').trim();
                    c.push('');
                    c.push(`    // label ${label}`);
                    continue;
                }

                const m = raw.match(/^([a-z.]+)\s*(.*)$/i);
                if (!m) continue;
                const op = m[1].toLowerCase();
                const args = m[2].split(',').map(s => s.trim()).filter(Boolean);

                const isReg = (x) => regSet.has(x.toLowerCase());

                const emit = (s) => c.push('    ' + s);

                switch (op) {
                    case 'mov': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        emit(`${dst} = ${isReg(src) ? src : toHex(src)};`);
                        break;
                    }
                    case 'add': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        emit(`${dst} += ${isReg(src) ? src : toHex(src)};`);
                        break;
                    }
                    case 'sub': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        emit(`${dst} -= ${isReg(src) ? src : toHex(src)};`);
                        break;
                    }
                    case 'inc': {
                        const r = args[0];
                        if (isReg(r)) ensureDecl(r);
                        emit(`${r}++;`);
                        break;
                    }
                    case 'dec': {
                        const r = args[0];
                        if (isReg(r)) ensureDecl(r);
                        emit(`${r}--;`);
                        break;
                    }
                    case 'xor': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        if (isReg(dst) && src === dst) {
                            emit(`${dst} = 0;`);
                        } else {
                            emit(`${dst} ^= ${isReg(src) ? src : toHex(src)};`);
                        }
                        break;
                    }
                    case 'and': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        emit(`${dst} &= ${isReg(src) ? src : toHex(src)};`);
                        break;
                    }
                    case 'or': {
                        const dst = args[0];
                        const src = args[1];
                        if (isReg(dst)) ensureDecl(dst);
                        if (isReg(src)) ensureDecl(src);
                        emit(`${dst} |= ${isReg(src) ? src : toHex(src)};`);
                        break;
                    }
                    case 'lea': {
                        const dst = args[0];
                        ensureDecl(dst);
                        emit(`${dst} = /* address calc */ ${args[1] || '/* expr */'};`);
                        break;
                    }
                    case 'cmp': {
                        lastCmp = { a: args[0], b: args[1] };
                        break;
                    }
                    case 'test': {
                        lastCmp = { a: args[0], b: args[1] };
                        break;
                    }
                    case 'je': case 'jz': {
                        if (lastCmp) emit(`if (${lastCmp.a} == ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jne': case 'jnz': {
                        if (lastCmp) emit(`if (${lastCmp.a} != ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jg': case 'jnle': {
                        if (lastCmp) emit(`if (${lastCmp.a} > ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jge': case 'jnl': {
                        if (lastCmp) emit(`if (${lastCmp.a} >= ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jl': case 'jnge': {
                        if (lastCmp) emit(`if (${lastCmp.a} < ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jle': case 'jng': {
                        if (lastCmp) emit(`if (${lastCmp.a} <= ${toHex(lastCmp.b)}) {/* jump */}`);
                        break;
                    }
                    case 'jmp': {
                        emit(`/* goto ${args[0]} */`);
                        break;
                    }
                    case 'call': {
                        const fn = args[0].replace(/[^A-Za-z0-9_]/g,'');
                        emit(`${fn}();`);
                        break;
                    }
                    case 'ret': {
                        emit('return (int)rax;');
                        break;
                    }
                    default: {
                        emit(`/* ${raw} */`);
                    }
                }
            }

            c.push('    return (int)rax;');
            c.push('}');
            return c.join('\n');
        } catch (err) {
            return '';
        }
    },

    renderSyscalls(container) {
        // Check if SyscallsUI is available
        if (typeof SyscallsUI !== 'undefined') {
            // Create instance if not exists
            if (!this.syscallsUI) {
                this.syscallsUI = new SyscallsUI();
            }
            // Render the syscalls interface
            this.syscallsUI.render();
        } else {
            // Direct inline rendering if class not available
            const currentOS = 'linux';
            const syscallsDB = window.SYSCALLS_DB || {};
            const db = currentOS === 'linux' ? (syscallsDB.linux || {}) : (syscallsDB.windows || {});
            const syscalls = Object.entries(db).map(([num, syscall]) => ({...syscall, number: num}));
            
            let html = '<div class="syscalls-container">';
            
            // Header
            html += `
                <div class="syscalls-header">
                    <h2 class="syscalls-title">🔥 System Calls Reference</h2>
                    <div class="os-switcher">
                        <button class="os-btn active" data-os="linux">🐧 Linux x64</button>
                        <button class="os-btn" data-os="windows">🪟 Windows x64</button>
                    </div>
                </div>
            `;
            
            // Search
            html += `
                <div class="syscalls-controls">
                    <div class="syscall-search">
                        <input type="text" placeholder="Search syscalls..." id="syscall-search-input">
                        <span class="search-icon">🔍</span>
                    </div>
                </div>
            `;
            
            // Stats
            html += `
                <div class="syscall-stats">
                    <div class="stat-card">
                        <div class="stat-number">${syscalls.length}</div>
                        <div class="stat-label">Total Syscalls</div>
                    </div>
                </div>
            `;
            
            // Table
            html += '<div class="syscalls-table">';
            html += `
                <div class="syscalls-table-header">
                    <div>Number</div>
                    <div>Name</div>
                    <div>Description</div>
                    <div>Category</div>
                    <div>Details</div>
                </div>
            `;
            
            // Syscall rows
            syscalls.slice(0, 20).forEach(syscall => {
                html += `
                    <div class="syscall-row">
                        <div class="syscall-number">0x${parseInt(syscall.number).toString(16)}</div>
                        <div class="syscall-name">${syscall.name || 'unknown'}</div>
                        <div class="syscall-description">${syscall.description || ''}</div>
                        <div class="syscall-category ${syscall.category || ''}">${syscall.category || 'system'}</div>
                        <div class="syscall-expand">▼</div>
                    </div>
                `;
            });
            
            html += '</div>'; // close table
            
            // Playground
            html += `
                <div class="syscall-playground">
                    <div class="playground-header">
                        <h3 class="playground-title">🧪 Syscall Playground</h3>
                    </div>
                    <div class="playground-editor">
                        <div class="editor-section">
                            <h5>Assembly Code</h5>
                            <textarea class="code-input" placeholder="; Enter assembly code\nmov rax, 1\nmov rdi, 1\nsyscall"></textarea>
                        </div>
                        <div class="editor-section">
                            <h5>Quick Templates</h5>
                            <div class="templates-grid">
                                <button class="template-btn">Exit</button>
                                <button class="template-btn">Hello World</button>
                                <button class="template-btn">Shell</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            html += '</div>'; // close container
            container.innerHTML = html;
        }
    }
};
