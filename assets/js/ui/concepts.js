/**
 * 🧠 CONCEPTS RENDERER
 * Educational reference materials and diagrams
 */

export const Concepts = {
    renderConcepts(container) {
        let html = '<div class="concepts-container">';
        
        html += `
            <div class="concepts-header">
                <h2>🎓 Assembly & Exploitation Concepts</h2>
                <p>Interactive reference guide for reverse engineering</p>
            </div>
        `;
        
        // Memory Layout Section with FIXED width
        html += `
            <div class="concept-section">
                <h3>📊 Memory Layout</h3>
                <div class="memory-layout-fixed">
                    <style>
                        .memory-layout-fixed {
                            display: flex;
                            justify-content: center;
                            padding: 20px;
                            overflow-x: auto;
                        }
                        .memory-diagram-wide {
                            display: flex;
                            flex-direction: column;
                            gap: 2px;
                            min-width: 600px;
                            max-width: 800px;
                            width: 100%;
                            font-family: 'Fira Code', monospace;
                            font-size: 13px;
                        }
                        .memory-region {
                            display: grid;
                            grid-template-columns: 150px 1fr 200px;
                            gap: 20px;
                            align-items: center;
                            padding: 12px 16px;
                            border-radius: 8px;
                            transition: all 0.3s ease;
                            position: relative;
                            min-height: 50px;
                        }
                        .memory-region:hover {
                            transform: translateX(5px);
                            box-shadow: 0 5px 15px rgba(73, 247, 194, 0.2);
                        }
                        .memory-region.stack {
                            background: linear-gradient(90deg, rgba(73, 247, 194, 0.2), rgba(73, 247, 194, 0.05));
                            border: 2px solid #49f7c2;
                        }
                        .memory-region.heap {
                            background: linear-gradient(90deg, rgba(126, 168, 255, 0.2), rgba(126, 168, 255, 0.05));
                            border: 2px solid #7ea8ff;
                        }
                        .memory-region.data {
                            background: linear-gradient(90deg, rgba(255, 211, 110, 0.2), rgba(255, 211, 110, 0.05));
                            border: 2px solid #ffd36e;
                        }
                        .memory-region.text {
                            background: linear-gradient(90deg, rgba(255, 92, 122, 0.2), rgba(255, 92, 122, 0.05));
                            border: 2px solid #ff5c7a;
                        }
                        .region-name {
                            font-weight: bold;
                            color: inherit;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        .region-content {
                            color: #e6f1ff;
                            opacity: 0.9;
                            line-height: 1.4;
                            padding: 0 10px;
                        }
                        .region-address {
                            text-align: right;
                            color: #8aa2b2;
                            font-family: monospace;
                            font-size: 12px;
                        }
                        .memory-arrow {
                            text-align: center;
                            color: #49f7c2;
                            font-size: 16px;
                            margin: 5px 0;
                            opacity: 0.6;
                        }
                    </style>
                    <div class="memory-diagram-wide">
                        <div class="memory-region stack">
                            <div class="region-name">STACK</div>
                            <div class="region-content">Local variables, function parameters, return addresses</div>
                            <div class="region-address">0x7fffffffe000</div>
                        </div>
                        <div class="memory-arrow">↓ grows down</div>
                        <div class="memory-region heap">
                            <div class="region-name">HEAP</div>
                            <div class="region-content">Dynamic memory (malloc, new), grows upward</div>
                            <div class="region-address">0x555555559000</div>
                        </div>
                        <div class="memory-arrow">↑ grows up</div>
                        <div class="memory-region data">
                            <div class="region-name">DATA/BSS</div>
                            <div class="region-content">Global/static variables, initialized and uninitialized</div>
                            <div class="region-address">0x555555558000</div>
                        </div>
                        <div class="memory-region text">
                            <div class="region-name">TEXT</div>
                            <div class="region-content">Program code, read-only, executable instructions</div>
                            <div class="region-address">0x555555554000</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // x86-64 Registers
        html += `
            <div class="concept-section">
                <h3>📦 x86-64 Registers</h3>
                <div class="reference-grid">
                    <div class="ref-card">
                        <h4>🎯 General Purpose</h4>
                        <div class="ref-list">
                            <code>RAX</code> - Accumulator, return values<br/>
                            <code>RBX</code> - Base register, preserved<br/>
                            <code>RCX</code> - Counter, 4th argument<br/>
                            <code>RDX</code> - Data, 3rd argument<br/>
                            <code>RSI</code> - Source index, 2nd arg<br/>
                            <code>RDI</code> - Destination, 1st arg<br/>
                            <code>RBP</code> - Base pointer (frame)<br/>
                            <code>RSP</code> - Stack pointer
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🆕 Extended Registers</h4>
                        <div class="ref-list">
                            <code>R8</code> - 5th function argument<br/>
                            <code>R9</code> - 6th function argument<br/>
                            <code>R10-R11</code> - Temporary<br/>
                            <code>R12-R15</code> - Callee-saved
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🚩 Status Flags</h4>
                        <div class="ref-list">
                            <code>ZF</code> - Zero flag (result = 0)<br/>
                            <code>SF</code> - Sign flag (negative)<br/>
                            <code>CF</code> - Carry flag (unsigned overflow)<br/>
                            <code>OF</code> - Overflow flag (signed overflow)<br/>
                            <code>PF</code> - Parity flag (even # of 1s)<br/>
                            <code>AF</code> - Auxiliary carry flag
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Common Instructions
        html += `
            <div class="concept-section">
                <h3>⚡ Common Instructions</h3>
                <div class="reference-grid">
                    <div class="ref-card">
                        <h4>📤 Data Movement</h4>
                        <div class="ref-list">
                            <code>mov dst, src</code> - Copy data<br/>
                            <code>lea dst, [addr]</code> - Load address<br/>
                            <code>push val</code> - Push to stack<br/>
                            <code>pop reg</code> - Pop from stack<br/>
                            <code>xchg a, b</code> - Exchange values
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>➕ Arithmetic</h4>
                        <div class="ref-list">
                            <code>add dst, src</code> - Addition<br/>
                            <code>sub dst, src</code> - Subtraction<br/>
                            <code>mul src</code> - Unsigned multiply<br/>
                            <code>imul src</code> - Signed multiply<br/>
                            <code>div src</code> - Unsigned divide<br/>
                            <code>inc/dec dst</code> - Increment/decrement
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🔀 Control Flow</h4>
                        <div class="ref-list">
                            <code>jmp addr</code> - Unconditional jump<br/>
                            <code>je/jz addr</code> - Jump if equal/zero<br/>
                            <code>jne/jnz addr</code> - Jump if not equal<br/>
                            <code>jg/jl addr</code> - Jump if greater/less<br/>
                            <code>call func</code> - Call function<br/>
                            <code>ret</code> - Return from function
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Exploitation Techniques
        html += `
            <div class="concept-section">
                <h3>💀 Exploitation Techniques</h3>
                <div class="exploit-concepts">
                    <div class="concept-card">
                        <h4>🌊 Buffer Overflow</h4>
                        <div class="buffer-demo">
                            <div class="buffer-part safe">Buffer[64] - Safe zone</div>
                            <div class="overflow-arrow">⬇️ Overflow direction ⬇️</div>
                            <div class="buffer-part saved-rbp">Saved RBP (8 bytes)</div>
                            <div class="buffer-part return-addr">Return Address (8 bytes) 🎯</div>
                        </div>
                        <p style="margin-top: 15px; color: #8aa2b2; font-size: 12px;">
                            Overwrite return address to hijack control flow
                        </p>
                    </div>
                    
                    <div class="concept-card">
                        <h4>🔗 ROP Chain</h4>
                        <div class="rop-chain">
                            <div class="rop-gadget">pop rdi; ret</div>
                            <div class="rop-data">"/bin/sh" address</div>
                            <div class="rop-gadget">pop rsi; ret</div>
                            <div class="rop-data">0 (NULL)</div>
                            <div class="rop-gadget">pop rdx; ret</div>
                            <div class="rop-data">0 (NULL)</div>
                            <div class="rop-gadget">syscall; ret</div>
                        </div>
                        <p style="margin-top: 15px; color: #8aa2b2; font-size: 12px;">
                            Chain gadgets to bypass DEP/NX
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Calling Conventions
        html += `
            <div class="concept-section">
                <h3>📞 Calling Conventions</h3>
                <div class="reference-grid">
                    <div class="ref-card">
                        <h4>🐧 Linux x64 (System V)</h4>
                        <div class="ref-list">
                            Arguments: <code>RDI, RSI, RDX, RCX, R8, R9</code><br/>
                            Return: <code>RAX</code><br/>
                            Preserved: <code>RBX, RBP, R12-R15</code><br/>
                            Stack alignment: 16 bytes<br/>
                            Red zone: 128 bytes below RSP
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🪟 Windows x64</h4>
                        <div class="ref-list">
                            Arguments: <code>RCX, RDX, R8, R9</code><br/>
                            Return: <code>RAX</code><br/>
                            Shadow space: 32 bytes<br/>
                            Stack alignment: 16 bytes<br/>
                            Preserved: <code>RBX, RBP, RDI, RSI, R12-R15</code>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Security Mitigations
        html += `
            <div class="concept-section">
                <h3>🛡️ Security Mitigations</h3>
                <div class="reference-grid">
                    <div class="ref-card">
                        <h4>🎲 ASLR</h4>
                        <div class="ref-list">
                            Randomizes memory addresses<br/>
                            Bypass: Info leak, bruteforce<br/>
                            Check: <code>cat /proc/sys/kernel/randomize_va_space</code>
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🚫 DEP/NX</h4>
                        <div class="ref-list">
                            Non-executable stack/heap<br/>
                            Bypass: ROP, ret2libc<br/>
                            Check: <code>checksec binary</code>
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🍪 Stack Canary</h4>
                        <div class="ref-list">
                            Random value before return address<br/>
                            Bypass: Leak canary, bruteforce<br/>
                            Pattern: <code>0x00******</code> (null byte)
                        </div>
                    </div>
                    
                    <div class="ref-card">
                        <h4>🥧 PIE</h4>
                        <div class="ref-list">
                            Position Independent Executable<br/>
                            Randomizes code segment<br/>
                            Bypass: Leak .text address
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        html += '</div>'; // concepts-container
        container.innerHTML = html;
    }
};
