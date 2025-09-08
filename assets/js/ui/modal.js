/**
 * Modal Management
 * Handles the Qoder modal and other modal dialogs
 */
export const Modal = {
    app: null,
    currentModal: null,
    
    init(app) {
        this.app = app;
        this.setupQoderModal();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Open Qoder button
        const openBtn = document.getElementById('open-qoder');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openQoder());
        }
        
        // Global escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.close();
            }
            if (e.target.closest('.modal-close-btn')) {
                this.close();
            }
            if (e.target.closest('#qoder-generate-btn')) {
                this.generateLesson();
            }
            if (e.target.closest('#qoder-clear-btn')) {
                this.clearOutput();
            }
            if (e.target.closest('#qoder-load-btn')) {
                this.loadGeneratedLesson();
            }
        });
    },
    
    setupQoderModal() {
        const modal = document.getElementById('qoder-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-card">
                <div class="modal-header">
                    <span>🤖 Qoder - Assembly Lesson Generator</span>
                    <button class="btn mini modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="q-grid">
                        <label>Template:</label>
                        <select id="q-template">
                            <option value="basic_mov_add">Basic MOV/ADD</option>
                            <option value="loop_demo">Loop Demo</option>
                            <option value="string_ops">String Operations</option>
                            <option value="stack_frame">Stack Frame</option>
                            <option value="conditional">Conditional Jumps</option>
                            <option value="bmi2_pext_pdep64_scatter">BMI2 64-bit: PEXT/PDEP + scatter/gather</option>
                            <option value="saturating_mul_i16">Saturating mul (int16)</option>
                            <option value="checked_add_sub_flags">Checked add/sub → flag via SBB</option>
                            <option value="bmi2_pext_pdep64_visual">BMI2 64-bit: Bit routing viz</option>
                            <option value="saturating_mul_i32">Saturating mul (int32)</option>
                            <!-- ARM64 (symbolic) -->
                            <option value="arm64_bitcount">ARM64: CLZ/CTZ/POPCNT (symbolic)</option>
                            <option value="arm64_checked_adds_subs">ARM64: ADDS/SUBS + CSET (symbolic)</option>
                            <option value="arm64_bitfield_ops">ARM64: UBFX/BFI/BFXIL (symbolic)</option>
                            <option value="arm64_saturating_mul_i16">ARM64: saturating mul16 (symbolic)</option>
                            <option value="arm64_sqdmulh_q15">ARM64: SQDMULH (Q15, symbolic)</option>
                        </select>
                        
                        <label>Base Address:</label>
                        <input type="text" id="q-base" value="0x401000" />
                        
                        <label>Difficulty:</label>
                        <select id="q-difficulty">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    
                    <div class="q-params" id="q-params">
                        <input type="text" id="q-param1" placeholder="Parameter 1" />
                        <input type="text" id="q-param2" placeholder="Parameter 2" />
                        <input type="text" id="q-param3" placeholder="Parameter 3" />
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <button id="qoder-generate-btn" class="btn">Generate Lesson</button>
                        <button id="qoder-clear-btn" class="btn">Clear</button>
                    </div>
                    
                    <div class="q-output" id="q-output">
                        <p>Select a template and parameters, then click Generate to create a custom lesson.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Setup template change handler
        const templateSelect = modal.querySelector('#q-template');
        if (templateSelect) {
            templateSelect.addEventListener('change', () => {
                this.updateParameterInputs(templateSelect.value);
            });
            
            // Initialize with default template
            this.updateParameterInputs(templateSelect.value);
        }
    },
    
    updateParameterInputs(templateName) {
        // Define parameter configurations for advanced templates
        const templateParams = {
            bmi2_pext_pdep64_scatter: [
                { label: 'src (u64 hex)', placeholder: '0xdeadbeefcafebabe' },
                { label: 'gather mask', placeholder: '0x0000f0f00f0ff00f' },
                { label: 'scatter mask', placeholder: '0x00f0000ff0000f00' }
            ],
            saturating_mul_i16: [
                { label: 'a (int16)', placeholder: '24000' },
                { label: 'b (int16)', placeholder: '2' },
                { label: '', placeholder: '' }
            ],
            checked_add_sub_flags: [
                { label: 'a (u64 hex)', placeholder: '0xfffffffffffffff0' },
                { label: 'b (u64 hex)', placeholder: '0x30' },
                { label: 'op (add|sub)', placeholder: 'add' }
            ],
            arm64_bitcount: [
                { label: 'x (u32)', placeholder: '305419896' },
                { label: '', placeholder: '' },
                { label: '', placeholder: '' }
            ],
            arm64_checked_adds_subs: [
                { label: 'a (u64 hex)', placeholder: '0xfffffffffffffff0' },
                { label: 'b (u64 hex)', placeholder: '0x30' },
                { label: 'op (adds|subs)', placeholder: 'adds' }
            ],
            arm64_bitfield_ops: [
                { label: 'val (u64 hex)', placeholder: '0x1234_5678_9abc_def0' },
                { label: 'lsb', placeholder: '8' },
                { label: 'len', placeholder: '12' }
            ],
            arm64_saturating_mul_i16: [
                { label: 'a (int16)', placeholder: '24000' },
                { label: 'b (int16)', placeholder: '2' },
                { label: '', placeholder: '' }
            ],
            bmi2_pext_pdep64_visual: [
                { label: 'src (u64 hex)', placeholder: '0xdeadbeefcafebabe' },
                { label: 'gather mask', placeholder: '0x0000f0f00f0ff00f' },
                { label: 'scatter mask', placeholder: '0x00f0000ff0000f00' }
            ],
            saturating_mul_i32: [
                { label: 'a (int32)', placeholder: '1600000000' },
                { label: 'b (int32)', placeholder: '3' },
                { label: '', placeholder: '' }
            ],
            arm64_sqdmulh_q15: [
                { label: 'a (int16, Q15)', placeholder: '24000' },
                { label: 'b (int16, Q15)', placeholder: '2' },
                { label: '', placeholder: '' }
            ]
        };
        
        const params = templateParams[templateName] || [
            { label: 'Parameter 1', placeholder: 'Parameter 1' },
            { label: 'Parameter 2', placeholder: 'Parameter 2' },
            { label: 'Parameter 3', placeholder: 'Parameter 3' }
        ];
        
        const paramsContainer = document.getElementById('q-params');
        if (paramsContainer) {
            // Clear existing content safely
            paramsContainer.textContent = '';
            
            // Create elements programmatically to avoid XSS
            params.forEach((param, i) => {
                const paramGroup = document.createElement('div');
                paramGroup.className = 'param-group';
                
                if (param.label) {
                    const label = document.createElement('label');
                    label.textContent = param.label + ':';
                    paramGroup.appendChild(label);
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `q-param${i + 1}`;
                    input.placeholder = param.placeholder;
                    input.value = param.placeholder;
                    paramGroup.appendChild(input);
                } else {
                    paramGroup.style.visibility = 'hidden';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `q-param${i + 1}`;
                    input.style.display = 'none';
                    paramGroup.appendChild(input);
                }
                
                paramsContainer.appendChild(paramGroup);
            });
        }
    },
    
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('hidden');
        this.currentModal = modal;
        
        // Focus first input
        const firstInput = modal.querySelector('input, select, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    },
    
    close() {
        if (this.currentModal) {
            this.currentModal.classList.add('hidden');
            this.currentModal = null;
        }
    },
    
    openQoder() {
        this.open('qoder-modal');
    },
    
    generateLesson() {
        const template = document.getElementById('q-template').value;
        const base = document.getElementById('q-base').value;
        const difficulty = document.getElementById('q-difficulty').value;
        const param1 = document.getElementById('q-param1').value;
        const param2 = document.getElementById('q-param2').value;
        const param3 = document.getElementById('q-param3').value;
        
        const output = document.getElementById('q-output');
        
        try {
            const lesson = this.createLessonFromTemplate({
                template,
                base: parseInt(base, 16) || 0x401000,
                difficulty,
                params: [param1, param2, param3].filter(p => p.trim())
            });
            
            output.innerHTML = `
                <h4>Generated Lesson:</h4>
                <pre>${JSON.stringify(lesson, null, 2)}</pre>
                <button id="qoder-load-btn" class="btn success">Load This Lesson</button>
            `;
            
            // Store for loading
            this.generatedLesson = lesson;
            
        } catch (error) {
            output.innerHTML = `<p style="color: var(--danger)">Error: ${error.message}</p>`;
        }
    },
    
    createLessonFromTemplate(config) {
        // Helper functions
        const hexs = (x) => {
            return '0x' + BigInt(x).toString(16).padStart(16, '0');
        };
        
        // ---- helpers (add once) ----
        const toImmLE = (v, nbytes) => {
            let x = BigInt(v);
            let out = [];
            for (let i = 0n; i < BigInt(nbytes); i++) {
                out.push(((x >> (8n * i)) & 0xffn).toString(16).padStart(2, '0'));
            }
            return out.join(' ');
        };
        
        const toImm16 = (v) => toImmLE(BigInt.asUintN(16, BigInt(v)), 2);
        const toImm32 = (v) => toImmLE(BigInt.asUintN(32, BigInt(v)), 4);
        const toImm64 = (v) => toImmLE(BigInt.asUintN(64, BigInt(v)), 8);
        
        const linearCFG = (disasm, title) => {
            return {
                type: 'linear',
                title: title || 'Linear Flow',
                blocks: [{
                    id: 'main',
                    instructions: disasm.map(d => d.s)
                }]
            };
        };
        
        const branchCFG = () => {
            return {
                type: 'branch',
                title: 'Conditional Branch',
                blocks: [
                    { id: 'entry', instructions: ['Entry block'] },
                    { id: 'true_path', instructions: ['True branch'] },
                    { id: 'false_path', instructions: ['False branch'] },
                    { id: 'merge', instructions: ['Merge point'] }
                ]
            };
        };
        
        // Bit routing visualization utility
        const bitRouteViz = (containerId, src, gatherMask, scatterMask) => {
            const N = 64, W = 760, H = N * 10 + 40, Lx = 120, Rx = W - 120;
            const srcU = BigInt.asUintN(64, BigInt(src));
            const gm = BigInt.asUintN(64, BigInt(gatherMask));
            const sm = BigInt.asUintN(64, BigInt(scatterMask));

            const leftBits = [], rightBits = [];
            for (let i = 0; i < N; i++) {
                const y = 20 + i * 10;
                leftBits.push({ i, y, bit: Number((srcU >> BigInt(i)) & 1n) });
            }
            
            // positions of 1s in masks
            const idxs = (m) => {
                let out = [];
                for (let i = 0; i < N; i++) {
                    if ((m >> BigInt(i)) & 1n) out.push(i);
                }
                return out;
            };
            
            const gi = idxs(gm), si = idxs(sm);
            const pairs = gi.map((from, i) => ({ from, to: si[i], on: Number((srcU >> BigInt(from)) & 1n) }))
                            .filter(p => p.to !== undefined);

            const c = document.getElementById(containerId);
            if (!c) return;
            
            c.innerHTML = '';
            const NS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(NS, 'svg');
            svg.classList.add('bitviz');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

            // columns labels
            const title = (x, y, t) => {
                const tx = document.createElementNS(NS, 'text');
                tx.setAttribute('x', x);
                tx.setAttribute('y', y);
                tx.textContent = t;
                svg.appendChild(tx);
            };
            
            title(Lx - 60, 14, 'SRC (64b)');
            title(Rx + 14, 14, 'DST (64b)');

            // draw dots
            const dot = (x, y, fill) => {
                const g = document.createElementNS(NS, 'g');
                const cc = document.createElementNS(NS, 'circle');
                cc.setAttribute('cx', x);
                cc.setAttribute('cy', y);
                cc.setAttribute('r', 3.2);
                if (fill) cc.setAttribute('fill', '#49f7c230');
                g.appendChild(cc);
                return g;
            };
            
            leftBits.forEach(b => svg.appendChild(dot(Lx, b.y, b.bit)));
            for (let i = 0; i < N; i++) {
                svg.appendChild(dot(Rx, 20 + i * 10, false));
            }

            // lines
            pairs.forEach(p => {
                const y1 = 20 + p.from * 10, y2 = 20 + p.to * 10;
                const ln = document.createElementNS(NS, 'line');
                ln.setAttribute('x1', Lx + 4);
                ln.setAttribute('y1', y1);
                ln.setAttribute('x2', Rx - 4);
                ln.setAttribute('y2', y2);
                if (p.on) ln.classList.add('active');
                svg.appendChild(ln);
            });

            // legend
            const lg = document.createElementNS(NS, 'text');
            lg.setAttribute('x', W / 2 - 160);
            lg.setAttribute('y', H - 10);
            lg.textContent = `gmask=${hexs(gm)}  smask=${hexs(sm)}  active lines = src&gmask`;
            svg.appendChild(lg);

            c.appendChild(svg);
        };
        
        const templates = {
            basic_mov_add: {
                title: 'Basic MOV/ADD Operations',
                goal: 'Execute MOV and ADD instructions to reach the target value',
                hint: 'Watch how values move between registers and get added together',
                disasm: [
                    { a: config.base, b: '48c7c010000000', s: 'mov rax, 0x10' },
                    { a: config.base + 7, b: '48c7c327000000', s: 'mov rbx, 0x27' },
                    { a: config.base + 14, b: '4801d8', s: 'add rax, rbx' },
                    { a: config.base + 17, b: 'c3', s: 'ret' }
                ],
                trace: [
                    { ip: 0, regs: { rax: 0n, rbx: 0n } },
                    { ip: 1, regs: { rax: 0x10n } },
                    { ip: 2, regs: { rbx: 0x27n } },
                    { ip: 3, regs: { rax: 0x37n } }
                ],
                check: 'state => state.regs.rax === 0x37n'
            },
            
            loop_demo: {
                title: 'Loop with Counter',
                goal: 'Execute the loop until RCX reaches zero',
                hint: 'DEC decrements the counter, JNZ jumps if not zero',
                disasm: [
                    { a: config.base, b: '48c7c103000000', s: 'mov rcx, 3' },
                    { a: config.base + 7, b: '48ffc9', s: 'dec rcx' },
                    { a: config.base + 10, b: '75fb', s: 'jnz 0x401007' },
                    { a: config.base + 12, b: 'c3', s: 'ret' }
                ],
                trace: [
                    { ip: 0, regs: { rcx: 0n } },
                    { ip: 1, regs: { rcx: 3n } },
                    { ip: 2, regs: { rcx: 2n } },
                    { ip: 1, regs: { rcx: 2n } },
                    { ip: 2, regs: { rcx: 1n } },
                    { ip: 1, regs: { rcx: 1n } },
                    { ip: 2, regs: { rcx: 0n } },
                    { ip: 3, regs: { rcx: 0n } }
                ],
                check: 'state => state.regs.rcx === 0n'
            },
            
            conditional: {
                title: 'Conditional Branching',
                goal: 'Take the correct branch based on comparison',
                hint: 'CMP sets flags, JZ jumps if zero flag is set',
                disasm: [
                    { a: config.base, b: '48c7c042000000', s: 'mov rax, 0x42' },
                    { a: config.base + 7, b: '4883f842', s: 'cmp rax, 0x42' },
                    { a: config.base + 11, b: '7405', s: 'jz 0x401012' },
                    { a: config.base + 13, b: '48c7c000000000', s: 'mov rax, 0' },
                    { a: config.base + 20, b: 'c3', s: 'ret' }
                ],
                trace: [
                    { ip: 0, regs: { rax: 0n }, flags: { zf: 0 } },
                    { ip: 1, regs: { rax: 0x42n } },
                    { ip: 2, flags: { zf: 1 } },
                    { ip: 4, regs: { rax: 0x42n } }
                ],
                check: 'state => state.regs.rax === 0x42n'
            },
            
            // === BMI2 64-bit: PEXT/PDEP + scatter/gather (symbolic, BigInt) ===
            bmi2_pext_pdep64_scatter: {
                title: 'BMI2 64-bit: PEXT/PDEP + scatter/gather',
                goal: 'Demonstrate bit manipulation using BMI2 instructions',
                hint: 'PEXT compacts bits by mask, PDEP distributes them to new positions',
                build: (p) => {
                    const toU64 = v => BigInt.asUintN(64, BigInt(v));
                    const src = toU64(p.src || '0xdeadbeefcafebabe');
                    const gm = toU64(p.gmsk || '0x0000f0f00f0ff00f');
                    const sm = toU64(p.smsk || '0x00f0000ff0000f00');

                    const pext64 = (s, m) => {
                        let out = 0n, bit = 0n;
                        for (let i = 0n; i < 64n; i++) {
                            if ((m >> i) & 1n) { 
                                if ((s >> i) & 1n) out |= (1n << bit); 
                                bit++; 
                            }
                        }
                        return out;
                    };
                    
                    const pdep64 = (s, m) => {
                        let out = 0n, bit = 0n;
                        for (let i = 0n; i < 64n; i++) {
                            if ((m >> i) & 1n) { 
                                if ((s >> bit) & 1n) out |= (1n << i); 
                                bit++; 
                            }
                        }
                        return out;
                    };

                    const gathered = pext64(src, gm);
                    const scattered = pdep64(gathered, sm);

                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '48 b8 ' + toImm64(src), s: `mov rax, ${hexs(src)}` },
                            { a: config.base + 0x0a, b: '48 bb ' + toImm64(gm), s: `mov rbx, ${hexs(gm)}   ; gather mask` },
                            { a: config.base + 0x14, b: '48 b9 ' + toImm64(sm), s: `mov rcx, ${hexs(sm)}   ; scatter mask` },
                            { a: config.base + 0x1e, b: '0f 38 f5 c3', s: 'pext rax, rbx, rax     ; (symbolic, rax=gather)' },
                            { a: config.base + 0x22, b: '0f 38 f4 c1', s: 'pdep rax, rcx, rax     ; (symbolic, rax=scatter)' },
                            { a: config.base + 0x26, b: 'c3', s: 'ret' }
                        ],
                        trace: [
                            { ip: 0, regs: { rax: src }, note: `src=${hexs(src)}` },
                            { ip: 1, regs: { rbx: gm }, note: `gmask=${hexs(gm)}` },
                            { ip: 2, regs: { rcx: sm }, note: `smask=${hexs(sm)}` },
                            { ip: 3, regs: { rax: gathered }, note: `PEXT → gathered=${hexs(gathered)}` },
                            { ip: 4, regs: { rax: scattered }, note: `PDEP → scattered=${hexs(scattered)}` },
                            { ip: 5 }
                        ],
                        check: `state => state.regs.rax === ${scattered}n`
                    };
                }
            },
            
            // === Saturating mul (int16) → clamp to [-32768, 32767] ===
            saturating_mul_i16: {
                title: 'Saturating mul (int16)',
                goal: 'Multiply with saturation to prevent overflow',
                hint: 'IMUL sets OF/CF on overflow; JO branches to clamp value',
                build: (p) => {
                    const toI16 = v => BigInt.asIntN(16, BigInt(v));
                    const a = toI16(p.a || '24000');
                    const b = toI16(p.b || '2');
                    const wide = a * b;
                    let of = 0, sat = wide;
                    const min = -32768n, max = 32767n;
                    if (wide < min) { sat = min; of = 1; }
                    else if (wide > max) { sat = max; of = 1; }

                    const raxFinal = BigInt.asIntN(16, sat);
                    
                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '66 b8 ' + toImm16(a), s: `mov ax, ${Number(a)}  ; a` },
                            { a: config.base + 0x03, b: '66 bb ' + toImm16(b), s: `mov bx, ${Number(b)}  ; b` },
                            { a: config.base + 0x06, b: '66 0f af c3', s: 'imul ax, bx           ; 16-bit' },
                            { a: config.base + 0x0a, b: '70 06', s: 'jo clamp' },
                            { a: config.base + 0x0c, b: '48 0f b7 c0', s: 'movzx rax, ax' },
                            { a: config.base + 0x10, b: 'c3', s: 'ret' },
                            { a: config.base + 0x11, b: '66 b8 ' + toImm16(sat), s: `clamp: mov ax, ${Number(sat)}` },
                            { a: config.base + 0x14, b: '48 0f bf c0', s: 'movsx rax, ax' },
                            { a: config.base + 0x18, b: 'c3', s: 'ret' }
                        ],
                        trace: of
                            ? [{ ip: 0 }, { ip: 1 }, { ip: 2, flags: { of: 1 }, note: 'IMUL overflow → JO taken' }, { ip: 6 }, { ip: 7, regs: { rax: raxFinal } }, { ip: 8 }]
                            : [{ ip: 0 }, { ip: 1 }, { ip: 2, flags: { of: 0 }, note: 'No overflow' }, { ip: 4, regs: { rax: BigInt.asUintN(16, a * b) } }, { ip: 5 }],
                        check: `state => state.regs.rax === ${raxFinal}n`
                    };
                }
            },
            
            // === Checked add/sub → boolean via SBB materialization ===
            checked_add_sub_flags: {
                title: 'Checked add/sub → flag via SBB',
                goal: 'Materialize carry/borrow flag into register',
                hint: 'SBB RDX,RDX converts CF into 0/-1; branchless flag materialization',
                build: (p) => {
                    const toU64 = v => BigInt.asUintN(64, BigInt(v));
                    const a = toU64(p.a || '0xfffffffffffffff0');
                    const b = toU64(p.b || '0x30');
                    const mask = (1n << 64n) - 1n;
                    const op = p.op || 'add';

                    let r = 0n, cf = 0;
                    if (op === 'add') {
                        const sum = a + b;
                        r = sum & mask;
                        cf = (sum >> 64n) & 1n ? 1 : 0;
                    } else {
                        const diff = a - b;
                        r = BigInt.asUintN(64, diff);
                        cf = (a < b) ? 1 : 0;
                    }

                    const flagMat = cf ? -1n : 0n;
                    
                    return {
                        disasm: op === 'add'
                            ? [
                                { a: config.base + 0x00, b: '48 b8 ' + toImm64(a), s: `mov rax, ${hexs(a)}` },
                                { a: config.base + 0x0a, b: '48 bb ' + toImm64(b), s: `mov rbx, ${hexs(b)}` },
                                { a: config.base + 0x14, b: '48 01 d8', s: 'add rax, rbx' },
                                { a: config.base + 0x17, b: '48 19 d2', s: 'sbb rdx, rdx   ; RDX=0 or -1 from CF' },
                                { a: config.base + 0x1a, b: 'c3', s: 'ret' }
                            ]
                            : [
                                { a: config.base + 0x00, b: '48 b8 ' + toImm64(a), s: `mov rax, ${hexs(a)}` },
                                { a: config.base + 0x0a, b: '48 bb ' + toImm64(b), s: `mov rbx, ${hexs(b)}` },
                                { a: config.base + 0x14, b: '48 29 d8', s: 'sub rax, rbx' },
                                { a: config.base + 0x17, b: '48 19 d2', s: 'sbb rdx, rdx   ; RDX=0 or -1 from borrow(CF)' },
                                { a: config.base + 0x1a, b: 'c3', s: 'ret' }
                            ],
                        trace: [
                            { ip: 0, regs: { rax: a } },
                            { ip: 1, regs: { rbx: b } },
                            { ip: 2, regs: { rax: r }, flags: { cf }, note: `${op.toUpperCase()} result=${hexs(r)} CF=${cf}` },
                            { ip: 3, regs: { rdx: flagMat }, note: 'SBB materializes CF → RDX=0 or -1' },
                            { ip: 4 }
                        ],
                        check: `state => state.regs.rax === ${r}n && state.regs.rdx === ${flagMat}n`
                    };
                }
            },
            
            // ========== ARM64: SYMBOLIC MIRRORS ==========
            
            // CLZ/CTZ/POPCNT (symbolic)
            arm64_bitcount: {
                title: 'ARM64: CLZ/CTZ/POPCNT (symbolic)',
                goal: 'Demonstrate ARM64 bit counting operations',
                hint: 'CTZ on ARM64: rbit + clz',
                build: (p) => {
                    const x = (parseInt(p.x || '305419896', 10) >>> 0);
                    const clz = Math.clz32(x);
                    const ctz = x === 0 ? 32 : (() => { let v = x, c = 0; while ((v & 1) === 0) { v >>>= 1; c++; } return c; })();
                    const pop = ((n) => { n >>>= 0; let c = 0; while (n) { n &= n - 1; c++; } return c; })(x);
                    
                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '—', s: `mov w0, #${x}` },
                            { a: config.base + 0x02, b: '—', s: 'clz w1, w0            ; leading zeros' },
                            { a: config.base + 0x04, b: '—', s: 'rbit w2, w0           ; reverse bits' },
                            { a: config.base + 0x06, b: '—', s: 'clz  w2, w2           ; → ctz' },
                            { a: config.base + 0x08, b: '—', s: 'dup  v0.16b, w0       ; (symbolic)' },
                            { a: config.base + 0x0a, b: '—', s: 'cnt  v0.16b, v0.16b   ; popcnt per byte' },
                            { a: config.base + 0x0c, b: '—', s: 'addv b0, v0.16b       ; horizontal sum → w3' },
                            { a: config.base + 0x0e, b: '—', s: 'ret' }
                        ],
                        trace: [
                            { ip: 0, regs: { w0: BigInt(x) }, note: `x=0x${x.toString(16)}` },
                            { ip: 1, regs: { w1: BigInt(clz) }, note: `clz=${clz}` },
                            { ip: 3, regs: { w2: BigInt(ctz) }, note: `ctz=${ctz}` },
                            { ip: 6, regs: { w3: BigInt(pop) }, note: `popcnt=${pop}` },
                            { ip: 7 }
                        ],
                        check: 'state => true' // Symbolic, always pass
                    };
                }
            },
            
            // ADDS/SUBS + CSET (symbolic)
            arm64_checked_adds_subs: {
                title: 'ARM64: ADDS/SUBS + CSET (symbolic)',
                goal: 'Demonstrate ARM64 flag materialization',
                hint: 'CSET materializes flag C into 0/1',
                build: (p) => {
                    const toU64 = v => BigInt.asUintN(64, BigInt(v));
                    const a = toU64(p.a || '0xfffffffffffffff0');
                    const b = toU64(p.b || '0x30');
                    const op = p.op || 'adds';
                    const mask = (1n << 64n) - 1n;
                    
                    let r = 0n, carry = 0;
                    if (op === 'adds') {
                        const sum = a + b;
                        r = sum & mask;
                        carry = (sum >> 64n) & 1n ? 1 : 0;
                    } else {
                        const diff = a - b;
                        r = BigInt.asUintN(64, diff);
                        carry = (a < b) ? 0 : 1; // C=NOT borrow
                    }
                    
                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '—', s: `mov x0, ${hexs(a)}` },
                            { a: config.base + 0x02, b: '—', s: `mov x1, ${hexs(b)}` },
                            { a: config.base + 0x04, b: '—', s: `${op} x0, x0, x1   ; set flags` },
                            { a: config.base + 0x06, b: '—', s: 'cset x2, cs         ; x2 = C?1:0 (unsigned carry)' },
                            { a: config.base + 0x08, b: '—', s: 'ret' }
                        ],
                        trace: [
                            { ip: 0, regs: { x0: a } },
                            { ip: 1, regs: { x1: b } },
                            { ip: 2, regs: { x0: r }, note: `${op.toUpperCase()} → x0=${hexs(r)} C=${carry}` },
                            { ip: 3, regs: { x2: BigInt(carry) } },
                            { ip: 4 }
                        ],
                        check: 'state => true' // Symbolic, always pass
                    };
                }
            },
            
            // UBFX/BFI/BFXIL (symbolic)
            arm64_bitfield_ops: {
                title: 'ARM64: UBFX/BFI/BFXIL (symbolic)',
                goal: 'Demonstrate ARM64 bitfield operations',
                hint: 'UBFX extracts field, BFI inserts field',
                build: (p) => {
                    const toU64 = v => BigInt.asUintN(64, BigInt(String(v).replace(/_/g, '')));
                    const val = toU64(p.val || '0x1234_5678_9abc_def0');
                    const lsb = +p.lsb || 8;
                    const len = +p.len || 12;
                    const ins = toU64(p.ins || '0x3ff');
                    
                    const mask = ((1n << BigInt(len)) - 1n) << BigInt(lsb);
                    const ubfx = BigInt.asUintN(64, (val & mask) >> BigInt(lsb));
                    const cleared = val & ~mask;
                    const bfi = BigInt.asUintN(64, cleared | ((ins & ((1n << BigInt(len)) - 1n)) << BigInt(lsb)));
                    
                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '—', s: `mov x0, ${hexs(val)}` },
                            { a: config.base + 0x02, b: '—', s: `ubfx x1, x0, #${lsb}, #${len} ; extract` },
                            { a: config.base + 0x04, b: '—', s: `mov x2, ${hexs(ins)}` },
                            { a: config.base + 0x06, b: '—', s: `bfi  x0, x2, #${lsb}, #${len} ; insert` },
                            { a: config.base + 0x08, b: '—', s: 'ret' }
                        ],
                        trace: [
                            { ip: 0, regs: { x0: val } },
                            { ip: 1, regs: { x1: ubfx }, note: `UBFX → ${hexs(ubfx)}` },
                            { ip: 3, regs: { x0: bfi }, note: `BFI  → ${hexs(bfi)}` },
                            { ip: 4 }
                        ],
                        check: 'state => true' // Symbolic, always pass
                    };
                }
            },
            
            // ARM64 Saturating mul16 (symbolic)
            arm64_saturating_mul_i16: {
                title: 'ARM64: saturating mul16 (symbolic)',
                goal: 'Demonstrate ARM64 saturating multiplication',
                hint: 'Uses smull + manual clamp, ARM64 equivalent to x86 version',
                build: (p) => {
                    const toI16 = v => BigInt.asIntN(16, BigInt(v));
                    const a = toI16(p.a || '24000');
                    const b = toI16(p.b || '2');
                    const wide = a * b;
                    const min = -32768n, max = 32767n;
                    let sat = wide;
                    if (wide < min) sat = min;
                    else if (wide > max) sat = max;
                    
                    const w0 = BigInt.asIntN(16, sat);
                    
                    return {
                        disasm: [
                            { a: config.base + 0x00, b: '—', s: `mov w0, #${Number(a)}` },
                            { a: config.base + 0x02, b: '—', s: `mov w1, #${Number(b)}` },
                            { a: config.base + 0x04, b: '—', s: 'smull x2, w0, w1    ; 32-bit wide' },
                            { a: config.base + 0x06, b: '—', s: `cmp x2, #${max}` },
                            { a: config.base + 0x08, b: '—', s: 'b.gt clamp_max' },
                            { a: config.base + 0x0a, b: '—', s: `cmp x2, #${min}` },
                            { a: config.base + 0x0c, b: '—', s: 'b.lt clamp_min' },
                            { a: config.base + 0x0e, b: '—', s: '; narrow w0 = x2[15:0] (symbolic)' },
                            { a: config.base + 0x10, b: '—', s: 'ret' },
                            { a: config.base + 0x12, b: '—', s: `clamp_max: mov w0, #${Number(max)} ; ret` },
                            { a: config.base + 0x14, b: '—', s: `clamp_min: mov w0, #${Number(min)} ; ret` }
                        ],
                        trace: (wide > max)
                            ? [{ ip: 0 }, { ip: 1 }, { ip: 2 }, { ip: 3 }, { ip: 4 }, { ip: 8, regs: { w0: BigInt(max) } }, { ip: 9 }]
                            : (wide < min)
                                ? [{ ip: 0 }, { ip: 1 }, { ip: 2 }, { ip: 5 }, { ip: 6 }, { ip: 10, regs: { w0: BigInt(min) } }, { ip: 9 }]
                                : [{ ip: 0 }, { ip: 1 }, { ip: 2 }, { ip: 7, regs: { w0: BigInt(w0) } }, { ip: 9 }],
                        check: 'state => true' // Symbolic, always pass
                    };
                }
            },
            
            // === BMI2 64-bit: Bit routing visualization ===
            bmi2_pext_pdep64_visual: {
                title: 'BMI2 64-bit: Bit routing viz',
                goal: 'Visualize bit routing in PEXT→PDEP operations',
                hint: 'Active lines show bits selected by gather mask',
                build: (p) => {
                    const toU64 = v => BigInt.asUintN(64, BigInt(v));
                    const src = toU64(p.src || '0xdeadbeefcafebabe');
                    const gm = toU64(p.gmsk || '0x0000f0f00f0ff00f');
                    const sm = toU64(p.smsk || '0x00f0000ff0000f00');
                    
                    const disasm = [
                        { a: config.base + 0x00, b: '48 b8 ' + toImm64(src), s: `mov rax, ${hexs(src)}` },
                        { a: config.base + 0x0a, b: '48 bb ' + toImm64(gm), s: `mov rbx, ${hexs(gm)} ; gather mask` },
                        { a: config.base + 0x14, b: '48 b9 ' + toImm64(sm), s: `mov rcx, ${hexs(sm)} ; scatter mask` },
                        { a: config.base + 0x1e, b: '0f 38 f5 c3', s: 'pext rax, rbx, rax   ; symbolic' },
                        { a: config.base + 0x22, b: '0f 38 f4 c1', s: 'pdep rax, rcx, rax   ; symbolic' },
                        { a: config.base + 0x26, b: 'c3', s: 'ret' }
                    ];
                    
                    const explain = `
                        <div style="margin:10px 0;padding:10px;border-left:3px solid var(--neon);background:rgba(73,247,194,.06);border-radius:8px;">
                            <b>Bit routing visualizer</b>: активные линии — те, где <code>src & gmask</code> имеет 1. 
                            Слева читаем биты по gmask (PEXT), справа раскладываем по smask (PDEP).
                        </div>
                        <div id="qviz" style="width:100%;max-height:520px;overflow:auto;"></div>
                    `;
                    
                    const trace = [
                        { ip: 0 },
                        { ip: 1 },
                        { ip: 2 },
                        { ip: 3, note: 'PEXT (gather)' },
                        { ip: 4, note: 'PDEP (scatter)' },
                        { ip: 5 }
                    ];
                    
                    const mount = () => bitRouteViz('qviz', src, gm, sm);
                    
                    return {
                        disasm,
                        trace,
                        explanation: explain,
                        mount,
                        check: '_ => true'
                    };
                }
            },
            
            // === Saturating mul (int32) ===
            saturating_mul_i32: {
                title: 'Saturating mul (int32)',
                goal: 'Multiply with saturation to prevent 32-bit overflow',
                hint: 'IMUL (32) sets OF/CF; on OF — clamp to int32 range',
                build: (p) => {
                    const MIN = -2147483648n, MAX = 2147483647n;
                    const a = BigInt.asIntN(32, BigInt(p.a || '1600000000'));
                    const b = BigInt.asIntN(32, BigInt(p.b || '3'));
                    const wide = a * b;
                    let of = 0, sat = wide;
                    if (wide < MIN) { sat = MIN; of = 1; }
                    else if (wide > MAX) { sat = MAX; of = 1; }
                    
                    const disasm = [
                        { a: config.base + 0x00, b: 'b8 ' + toImm32(a), s: `mov eax, ${Number(a)}` },
                        { a: config.base + 0x05, b: 'bb ' + toImm32(b), s: `mov ebx, ${Number(b)}` },
                        { a: config.base + 0x0a, b: '0f af c3', s: 'imul eax, ebx' },
                        { a: config.base + 0x0d, b: '70 05', s: 'jo clamp32' },
                        { a: config.base + 0x0f, b: '48 63 c0', s: 'movsxd rax, eax' },
                        { a: config.base + 0x12, b: 'c3', s: 'ret' },
                        { a: config.base + 0x13, b: 'b8 ' + toImm32(sat), s: `clamp32: mov eax, ${Number(BigInt.asIntN(32, sat))}` },
                        { a: config.base + 0x18, b: '48 63 c0', s: 'movsxd rax, eax' },
                        { a: config.base + 0x1b, b: 'c3', s: 'ret' }
                    ];
                    
                    const out = BigInt.asIntN(32, sat);
                    const trace = of
                        ? [{ ip: 0 }, { ip: 1 }, { ip: 2, flags: { of: 1 }, note: 'OF=1 → clamp' }, { ip: 6 }, { ip: 7, regs: { rax: out } }, { ip: 8 }]
                        : [{ ip: 0 }, { ip: 1 }, { ip: 2, flags: { of: 0 }, note: 'no overflow' }, { ip: 4, regs: { rax: BigInt.asIntN(32, wide) } }, { ip: 5 }];
                    
                    return {
                        disasm,
                        trace,
                        check: `state => state.regs.rax === ${out}n`
                    };
                }
            },
            
            // ARM64 SQDMULH (Q15, symbolic)
            arm64_sqdmulh_q15: {
                title: 'ARM64: SQDMULH (Q15, symbolic)',
                goal: 'Demonstrate ARM64 fixed-point saturating multiply',
                hint: 'Fixed-point Q15: doubled product with rounding and saturation',
                build: (p) => {
                    const toI16 = v => BigInt.asIntN(16, BigInt(v));
                    const a = toI16(p.a || '24000');
                    const b = toI16(p.b || '2');
                    // SQDMULH semantics (lane 16): sat((2*a*b + round) >> 15)
                    const round = 1n << 14n;
                    let tmp = 2n * a * b + round;
                    let res = tmp >> 15n;
                    // saturate to int16
                    const MIN = -32768n, MAX = 32767n;
                    if (res < MIN) res = MIN;
                    else if (res > MAX) res = MAX;
                    
                    const disasm = [
                        { a: config.base + 0x00, b: '—', s: `mov w0, #${Number(a)}` },
                        { a: config.base + 0x02, b: '—', s: `mov w1, #${Number(b)}` },
                        { a: config.base + 0x04, b: '—', s: '; symbolic: sqdmulh w2, w0, w1  (Q15)' },
                        { a: config.base + 0x06, b: '—', s: '; w2 = sat( (2*w0*w1 + 1<<14) >> 15 )' },
                        { a: config.base + 0x08, b: '—', s: 'mov w2, #<computed>' },
                        { a: config.base + 0x0a, b: '—', s: 'ret' }
                    ];
                    
                    const trace = [
                        { ip: 0, regs: { w0: a } },
                        { ip: 1, regs: { w1: b } },
                        { ip: 4, regs: { w2: res }, note: `sqdmulh(Q15) → ${Number(res)}` },
                        { ip: 5 }
                    ];
                    
                    return {
                        disasm,
                        trace,
                        check: 'state => true' // Symbolic, always pass
                    };
                }
            }
        };
        
        const template = templates[config.template];
        if (!template) {
            throw new Error(`Unknown template: ${config.template}`);
        }
        
        // Generate lesson ID
        const lessonId = `custom_${Date.now().toString(36)}`;
        
        // Handle templates with build functions
        let lessonData;
        if (typeof template.build === 'function') {
            // Advanced templates with dynamic generation
            const params = {};
            if (config.params) {
                config.params.forEach((param, i) => {
                    const key = template.params?.[i]?.key || `param${i + 1}`;
                    params[key] = param;
                });
            }
            
            const built = template.build(params);
            lessonData = {
                id: lessonId,
                title: built.title || template.title,
                difficulty: config.difficulty,
                base: config.base,
                goal: built.goal || template.goal,
                hint: built.hint || template.hint,
                explanation: built.explanation,
                disasm: built.disasm,
                trace: built.trace,
                bytes: new Uint8Array(built.disasm.map(i => 
                    i.b.split(' ').map(hex => parseInt(hex, 16))
                ).flat().filter(b => !isNaN(b))),
                strings: built.strings || [],
                cfg: built.cfg,
                mount: built.mount, // Add mount function support
                check: new Function('state', `return ${built.check}`)
            };
        } else {
            // Simple static templates
            lessonData = {
                id: lessonId,
                title: template.title,
                difficulty: config.difficulty,
                base: config.base,
                goal: template.goal,
                hint: template.hint,
                disasm: template.disasm,
                trace: template.trace,
                bytes: new Uint8Array(template.disasm.map(i => 
                    i.b.match(/.{2}/g).map(hex => parseInt(hex, 16))
                ).flat()),
                strings: [],
                check: new Function('state', `return ${template.check}`)
            };
        }
        
        return lessonData;
    },
    
    loadGeneratedLesson() {
        if (!this.generatedLesson) {
            this.app.Terminal.print('No lesson to load', 'error');
            return;
        }
        
        // Add to lessons array in state (single source of truth)
        if (!this.app.State.lessons) {
            this.app.State.lessons = [];
        }
        this.app.State.lessons.push(this.generatedLesson);
        
        // Load the lesson
        this.app.State.loadLesson(this.generatedLesson);
        this.app.Terminal.print(`Loaded custom lesson: ${this.generatedLesson.title}`);
        
        // Update UI
        this.app.updateUI();
        
        // Close modal
        this.close();
    },
    
    clearOutput() {
        const output = document.getElementById('q-output');
        output.innerHTML = '<p>Select a template and parameters, then click Generate to create a custom lesson.</p>';
        this.generatedLesson = null;
    }
};