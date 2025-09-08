/**
 * Sidebar Management
 * Handles left sidebar (lessons) and right sidebar (registers/stack)
 */
export const Sidebar = {
    app: null,
    previousRegs: {},

    init(app) {
        this.app = app;
        // Initialize with default register values
        this.previousRegs = {
            rax: 0n, rbx: 0n, rcx: 0n, rdx: 0n,
            rdi: 0n, rsi: 0n, rbp: 0n, rsp: 0n, rip: 0n
        };
        this.renderLessons();
        this.renderRightPanel();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Lesson clicks
        document.addEventListener('click', (e) => {
            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                const lessonId = lessonItem.dataset.lessonId;
                this.loadLesson(lessonId);
            }

            const exportBtn = e.target.closest('#export-progress-btn');
            if (exportBtn) {
                this.exportProgress();
            }
        });
    },
    
    renderLessons() {
        const sidebar = document.getElementById('sidebar-left');
        if (!sidebar) {
            console.error('Sidebar-left element not found');
            return;
        }
        
        const lessons = this.app?.State?.lessons || [];
        console.log(`Rendering ${lessons.length} lessons in sidebar`);
        
        if (!lessons.length) {
            sidebar.innerHTML = `
                <div class="no-lessons">
                    <h3>⚠️ No Lessons Available</h3>
                    <p>Failed to load lesson data.</p>
                    <p>Check console for errors.</p>
                </div>
            `;
            return;
        }
        
        // Group lessons by module dynamically
        const modules = {};
        
        lessons.forEach(lesson => {
            const moduleId = lesson.id.split('.')[0];
            if (!modules[moduleId]) {
                // Create module title based on ID or lesson data
                let moduleTitle = `Module ${moduleId}`;
                if (lesson.level) {
                    const level = lesson.level;
                    if (level <= 5) moduleTitle = `🎯 Foundation (${moduleId})`;
                    else if (level <= 10) moduleTitle = `⚡ Intermediate (${moduleId})`;
                    else if (level <= 15) moduleTitle = `🔥 Advanced (${moduleId})`;
                    else moduleTitle = `👑 Master (${moduleId})`;
                } else {
                    // Fallback to old naming for modules 0-2
                    const titles = {
                        '0': 'Module 0: Orientation',
                        '1': 'Module 1: Control & Data', 
                        '2': 'Module 2: Advanced'
                    };
                    moduleTitle = titles[moduleId] || `Module ${moduleId}`;
                }
                modules[moduleId] = { title: moduleTitle, lessons: [] };
            }
            modules[moduleId].lessons.push(lesson);
        });
        
        let html = '';
        
        Object.entries(modules).forEach(([moduleId, module]) => {
            if (module.lessons.length === 0) return;
            
            html += `<div class="module-section">`;
            html += `<h3>${module.title}</h3>`;
            
            module.lessons.forEach(lesson => {
                const completed = this.app.Progress.isCompleted(lesson.id);
                const isActive = this.app.State.currentLesson && this.app.State.currentLesson.id === lesson.id;
                
                let itemClass = 'lesson-item';
                if (completed) itemClass += ' completed';
                if (isActive) itemClass += ' active';
                
                // Format lesson info
                const level = lesson.level ? `Lvl ${lesson.level}` : '';
                const xp = lesson.xp ? `${lesson.xp} XP` : '';
                const desc = lesson.desc || '';
                
                html += `
                    <div class="${itemClass}" 
                         data-lesson-id="${lesson.id}"
                         ${lesson.level ? `data-level="${lesson.level}"` : ''}
                         ${lesson.difficulty ? `data-difficulty="${lesson.difficulty}"` : ''}>
                        <div class="lesson-header">
                            <span class="lesson-title">${lesson.id}: ${this.escapeHtml(lesson.title)}</span>
                            ${level ? `<span class="lesson-level">${level}</span>` : ''}
                        </div>
                        ${desc ? `<div class="lesson-desc">${this.escapeHtml(desc)}</div>` : ''}
                        <div class="lesson-meta">
                            ${xp ? `<span class="lesson-xp">💰 ${xp}</span>` : ''}
                            ${lesson.skills ? `<span class="lesson-skills">🎨 ${lesson.skills.slice(0, 3).join(', ')}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        // Add progress summary
        const completedCount = this.app.Progress.getCompletedCount();
        const totalCount = lessons.length;
        
        html += `<div class="progress-section">`;
        html += `<h3>Progress</h3>`;
        html += `<p>Completed: ${completedCount}/${totalCount}</p>`;
        html += `<button id="export-progress-btn" class="btn mini">Export Progress</button>`;
        html += `</div>`;
        
        sidebar.innerHTML = html;
    },
    
    loadLesson(lessonId) {
        const lessons = this.app?.State?.lessons || [];
        const lesson = lessons.find(l => l.id === lessonId);
        if (!lesson) {
            this.app.Terminal.print(`Lesson not found: ${lessonId}`, 'error');
            return;
        }
        
        this.app.State.loadLesson(lesson);
        this.app.Terminal.print(`Loaded lesson: ${lesson.title}`);
        
        // Update UI
        this.app.updateUI();
    },
    
    renderRightPanel() {
        const sidebar = document.getElementById('sidebar-right');
        if (!sidebar) {
            console.error('Sidebar-right element not found');
            return;
        }
        
        let html = `
            <div class="registers-section">
                <h3>Registers</h3>
                <div class="reg-grid" id="reg-grid">
                    <!-- Registers will be populated by updateRegisters() -->
                </div>
            </div>
            
            <div class="flags-section">
                <h3>Flags</h3>
                <div class="flags" id="flags-container">
                    <!-- Flags will be populated by updateFlags() -->
                </div>
            </div>
            
            <div class="stack-section">
                <h3>Stack</h3>
                <div class="stack-view" id="stack-view">
                    <!-- Stack will be populated by updateStack() -->
                </div>
            </div>
            
            <div class="lesson-section">
                <div id="lesson-card-container">
                    <!-- Lesson card will be populated by updateLessonCard() -->
                </div>
            </div>
        `;
        
        sidebar.innerHTML = html;
        this.updateRightPanel();
    },
    
    updateRightPanel() {
        this.updateRegisters();
        this.updateFlags();
        this.updateStack();
        this.updateLessonCard();
    },
    
    updateRegisters() {
        const container = document.getElementById('reg-grid');
        if (!container) return;
        
        const registers = ['rax', 'rbx', 'rcx', 'rdx', 'rdi', 'rsi', 'rbp', 'rsp', 'rip'];
        
        let html = '';
        registers.forEach(reg => {
            const value = this.app.State.regs[reg] || 0n;
            const prevValue = this.previousRegs[reg] || 0n;
            const flashClass = value !== prevValue ? 'flash' : '';
            
            html += `
                <div class="reg-item ${flashClass}" data-reg="${reg}">
                    <div class="name">${reg.toUpperCase()}</div>
                    <div class="value">${this.app.State.formatHex(value)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        this.previousRegs = { ...this.app.State.regs };
    },
    
    updateFlags() {
        const container = document.getElementById('flags-container');
        if (!container) return;
        
        const flags = ['zf', 'sf', 'of', 'cf'];
        
        let html = '';
        flags.forEach(flag => {
            const value = this.app.State.flags[flag] || 0;
            const flagClass = value ? 'flag on' : 'flag';
            const displayName = flag.toUpperCase().replace('F', '');
            
            html += `<div class="${flagClass}">${displayName}</div>`;
        });
        
        container.innerHTML = html;
    },
    
    updateStack() {
        const container = document.getElementById('stack-view');
        if (!container) return;
        
        if (!this.app.State.stack || this.app.State.stack.length === 0) {
            container.innerHTML = '<p class="muted">Stack empty</p>';
            return;
        }
        
        const rsp = this.app.State.regs.rsp || 0n;
        
        let html = '';
        this.app.State.stack.slice(0, 10).forEach((value, i) => {
            const addr = rsp + BigInt(i * 8);
            html += `
                <div class="stack-item">
                    <div class="stack-addr">${this.app.State.formatHex(addr)}</div>
                    <div class="stack-value">${this.app.State.formatHex(value)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    updateLessonCard() {
        const container = document.getElementById('lesson-card-container');
        if (!container) return;
        
        if (!this.app.State.currentLesson) {
            container.innerHTML = `
                <div class="lesson-card">
                    <h4>No Lesson Loaded</h4>
                    <p>Use <code>load &lt;id&gt;</code> to load a lesson.</p>
                </div>
            `;
            return;
        }
        
        const lesson = this.app.State.currentLesson;
        const completed = this.app.Progress.isCompleted(lesson.id);
        
        let html = `
            <div class="lesson-card">
                <h4>${this.escapeHtml(lesson.title)}</h4>
                
                <div class="lesson-goal">
                    <strong>Goal:</strong>
                    <p>${this.escapeHtml(lesson.goal)}</p>
                </div>
                
                <div class="lesson-actions">
                    <button id="lesson-hint-btn" class="btn">Show Hint</button>
                    <button id="lesson-check-btn" class="btn success">Check</button>
                    <button id="lesson-reset-btn" class="btn">Reset</button>
                </div>
        `;
        
        if (completed) {
            html += `<div class="lesson-status">✓ Completed</div>`;
        }
        
        html += '</div>';
        container.innerHTML = html;

        // Add event listeners for the new buttons
        container.querySelector('#lesson-hint-btn').addEventListener('click', () => this.app.Terminal.executeCommand('hint'));
        container.querySelector('#lesson-check-btn').addEventListener('click', () => this.app.Terminal.executeCommand('check'));
        container.querySelector('#lesson-reset-btn').addEventListener('click', () => this.app.Terminal.executeCommand('reset'));
    },
    
    exportProgress() {
        const data = this.app.Progress.export();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hacker-lab-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.app.Terminal.print('Progress exported to file');
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};