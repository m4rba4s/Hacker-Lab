/**
 * 🧠 INTERACTIVE MEMORY VISUALIZATION
 * Интерактивные схемы памяти и структур данных
 */

export const MemoryViz = {
    container: null,
    
    init(container) {
        this.container = container;
        this.render();
    },
    
    render() {
        let html = '<div class="memory-visualization">';
        
        // Memory Layout Diagram
        html += this.generateMemoryLayout();
        
        // Stack Frame Diagram
        html += this.generateStackFrame();
        
        // Register State Diagram  
        html += this.generateRegisterDiagram();
        
        html += '</div>';
        
        this.container.innerHTML = html;
        this.setupInteractions();
    },
    
    generateMemoryLayout() {
        return `
            <div class="memory-section">
                <h3>🏗️ Memory Layout</h3>
                <div class="memory-diagram">
                    <div class="memory-region high-addr">
                        <div class="region-header">High Addresses (0xFFFFFFFF)</div>
                        <div class="region-block kernel">
                            <span class="region-name">Kernel Space</span>
                            <span class="region-desc">System code (Ring 0)</span>
                        </div>
                        <div class="region-block stack">
                            <span class="region-name">Stack</span>
                            <span class="region-desc">Local vars, return addresses</span>
                            <div class="stack-arrow">⬇️ Grows Down</div>
                        </div>
                        <div class="region-spacer">
                            <div class="spacer-line"></div>
                            <span class="spacer-label">Free Space</span>
                        </div>
                        <div class="region-block heap">
                            <span class="region-name">Heap</span>
                            <span class="region-desc">Dynamic allocation</span>
                            <div class="heap-arrow">⬆️ Grows Up</div>
                        </div>
                        <div class="region-block bss">
                            <span class="region-name">BSS</span>
                            <span class="region-desc">Uninitialized globals</span>
                        </div>
                        <div class="region-block data">
                            <span class="region-name">Data</span>
                            <span class="region-desc">Initialized globals</span>
                        </div>
                        <div class="region-block text">
                            <span class="region-name">Text (Code)</span>
                            <span class="region-desc">Your executable code</span>
                        </div>
                        <div class="region-header">Low Addresses (0x00000000)</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    generateStackFrame() {
        return `
            <div class="memory-section">
                <h3>📚 Stack Frame Structure</h3>
                <div class="stack-diagram">
                    <div class="stack-direction">Higher Addresses ⬆️</div>
                    
                    <div class="stack-frame">
                        <div class="frame-part caller-frame">
                            <span class="frame-label">Caller's Frame</span>
                        </div>
                        
                        <div class="frame-part args">
                            <span class="frame-label">Arguments (7th+)</span>
                            <span class="frame-detail">Stack-passed args</span>
                        </div>
                        
                        <div class="frame-part return-addr">
                            <span class="frame-label">Return Address</span>
                            <span class="frame-detail">🎯 Exploit target!</span>
                        </div>
                        
                        <div class="frame-part saved-rbp">
                            <span class="frame-label">Saved RBP</span>
                            <span class="frame-detail">Old frame pointer</span>
                            <span class="register-pointer">← RBP</span>
                        </div>
                        
                        <div class="frame-part locals">
                            <span class="frame-label">Local Variables</span>
                            <span class="frame-detail">Function locals</span>
                        </div>
                        
                        <div class="frame-part temp">
                            <span class="frame-label">Temporary Space</span>
                            <span class="frame-detail">Expression evaluation</span>
                            <span class="register-pointer">← RSP</span>
                        </div>
                    </div>
                    
                    <div class="stack-direction">Lower Addresses ⬇️</div>
                </div>
            </div>
        `;
    },
    
    generateRegisterDiagram() {
        return `
            <div class="memory-section">
                <h3>📦 x64 Register Architecture</h3>
                <div class="register-diagram">
                    <div class="register-category">
                        <h4>General Purpose</h4>
                        <div class="register-grid">
                            <div class="register-item rax">
                                <div class="reg-name">RAX</div>
                                <div class="reg-desc">Accumulator</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rbx">
                                <div class="reg-name">RBX</div>
                                <div class="reg-desc">Base</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rcx">
                                <div class="reg-name">RCX</div>
                                <div class="reg-desc">Counter</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rdx">
                                <div class="reg-name">RDX</div>
                                <div class="reg-desc">Data</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="register-category">
                        <h4>Index/Pointer</h4>
                        <div class="register-grid">
                            <div class="register-item rsi">
                                <div class="reg-name">RSI</div>
                                <div class="reg-desc">Source Index</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rdi">
                                <div class="reg-name">RDI</div>
                                <div class="reg-desc">Destination</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rsp">
                                <div class="reg-name">RSP</div>
                                <div class="reg-desc">Stack Pointer</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                            <div class="register-item rbp">
                                <div class="reg-name">RBP</div>
                                <div class="reg-desc">Base Pointer</div>
                                <div class="reg-size">64-bit</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="register-category">
                        <h4>Extended (R8-R15)</h4>
                        <div class="register-grid">
                            <div class="register-item r8">
                                <div class="reg-name">R8-R15</div>
                                <div class="reg-desc">General Purpose</div>
                                <div class="reg-size">x64 only</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupInteractions() {
        // Add hover effects and tooltips
        const regions = this.container.querySelectorAll('.region-block');
        regions.forEach(region => {
            region.addEventListener('mouseenter', (e) => {
                this.showRegionTooltip(e.target);
            });
            
            region.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
        
        // Register interactions
        const registers = this.container.querySelectorAll('.register-item');
        registers.forEach(reg => {
            reg.addEventListener('click', (e) => {
                this.showRegisterDetail(e.target);
            });
        });
    },
    
    showRegionTooltip(element) {
        const regionName = element.querySelector('.region-name')?.textContent;
        
        const tooltips = {
            'Stack': 'LIFO structure. Critical for function calls and local variables. Primary target for buffer overflows!',
            'Heap': 'Dynamic memory allocation. Vulnerable to use-after-free, heap overflow, and double-free bugs.',
            'Text (Code)': 'Your executable code lives here. Usually read-only and protected.',
            'Data': 'Initialized global variables. Contains string literals and constants.',
            'BSS': 'Uninitialized global variables. Zeroed out at program start.',
            'Kernel Space': 'Protected memory space. Ring 0 access required. Ultimate privilege escalation target!'
        };
        
        const tooltip = tooltips[regionName];
        if (tooltip) {
            this.createTooltip(element, tooltip);
        }
    },
    
    showRegisterDetail(element) {
        const regName = element.querySelector('.reg-name')?.textContent;
        
        const details = {
            'RAX': 'Accumulator register. Used for return values and arithmetic operations.',
            'RBX': 'Base register. Often used for array base addresses.',
            'RCX': 'Counter register. Used for loop counters and string operations.',
            'RDX': 'Data register. Used for I/O operations and large arithmetic.',
            'RSI': 'Source Index. Source pointer for string operations.',
            'RDI': 'Destination Index. Destination pointer for string operations.',
            'RSP': 'Stack Pointer. Points to the top of the stack. Critical!',
            'RBP': 'Base Pointer. Points to the current stack frame base.',
            'R8-R15': 'Extended registers. Additional general-purpose registers in x64.'
        };
        
        const detail = details[regName];
        if (detail) {
            alert(`${regName}: ${detail}`); // Could be replaced with better modal
        }
    },
    
    createTooltip(element, text) {
        // Simple tooltip implementation
        const existing = document.querySelector('.memory-tooltip');
        if (existing) existing.remove();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'memory-tooltip';
        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            left: ${rect.left}px;
            background: rgba(0, 0, 0, 0.9);
            color: var(--neon);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            z-index: 10000;
            border: 1px solid var(--neon);
        `;
        
        document.body.appendChild(tooltip);
    },
    
    hideTooltip() {
        const tooltip = document.querySelector('.memory-tooltip');
        if (tooltip) tooltip.remove();
    }
};

