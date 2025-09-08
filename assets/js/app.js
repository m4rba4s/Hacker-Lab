/**
 * RET ACADEMY - Interactive Reverse Engineering Platform
 * Educational platform for learning assembly and reverse engineering
 * 
 * Architecture:
 * - Single orchestrator pattern
 * - Deterministic module initialization
 * - Secure input handling
 * - Optimized DOM updates
 * - Dark cyberpunk theme
 */

console.log('🔥 RET ACADEMY - INITIALIZING...');
console.log('📍 Script location:', window.location.href);
console.log('🔍 Document readyState:', document.readyState);

// Immediate visibility test
// Respect current theme variable for background
try {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg')?.trim() || '#0a0e1a';
    document.body.style.backgroundColor = bg;
} catch (_) {
    document.body.style.backgroundColor = '#0a0e1a';
}
const testDiv = document.createElement('div');
testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #49f7c2; color: black; padding: 10px; z-index: 9999; font-family: monospace;';
testDiv.textContent = '⚡ Loading modules...';
document.body.appendChild(testDiv);

// Import all modules statically (for better compatibility)
import { State } from './core/state.js';
import { Simulator } from './core/simulator.js';
import { Storage, Progress } from './core/storage.js';
import { Gamification } from './core/gamification.js';
import { CTF } from './core/ctf.js';
import { Patcher } from './core/patcher.js';
import { TutorialSystem } from './core/tutorial_system.js';
import { Terminal } from './ui/terminal.js';
import { Sidebar } from './ui/sidebar.js';
import { Disasm } from './ui/disasm.js';
import { Modal } from './ui/modal.js';
import { PatchOverlay } from './ui/patch-overlay.js';
import { Lessons } from '../data/lessons.js';

console.log('✅ All modules imported successfully!');

// Loading status display
function showLoading(msg) {
    const termBody = document.getElementById('term-body');
    if (termBody) {
        const line = document.createElement('div');
        line.className = 'loading-message';
        line.textContent = `⚡ ${msg}`;
        termBody.appendChild(line);
    }
}

/**
 * Main Application Orchestrator
 * Central control point for the entire system
 */
const HackerLabApp = {
    // Версия и метаданные
    version: '3.0-PLAYGROUND',
    author: '0UTSP0KEN',
    
    // Модули будут загружены сюда
    modules: {},
    
    // Состояние инициализации
    state: {
        initialized: false,
        errors: [],
        warnings: []
    },
    
    /**
     * ГЛАВНАЯ ТОЧКА ВХОДА
     */
    async init() {
        try {
            console.log('=== PHASE 1: GLOBAL SETUP ===');
            this.setupGlobalErrorHandlers();
            showLoading('Global handlers installed');
            
            console.log('=== PHASE 2: LOADING MODULES ===');
            await this.loadAllModules();
            showLoading('All modules loaded');
            
            console.log('=== PHASE 3: INITIALIZING CORE ===');
            await this.initializeCore();
            showLoading('Core systems online');
            
            console.log('=== PHASE 4: INITIALIZING UI ===');
            await this.initializeUI();
            showLoading('UI components ready');
            
            console.log('=== PHASE 5: LOADING DATA ===');
            await this.loadInitialData();
            showLoading('Lessons loaded successfully');
            
            console.log('=== PHASE 6: FINAL SETUP ===');
            this.finalSetup();
            
            // Успех!
            this.state.initialized = true;
            console.log('🎯 HACKER LAB READY! Total time:', performance.now().toFixed(0) + 'ms');
            
            // Очищаем терминал и показываем приветствие
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('💀 FATAL INITIALIZATION ERROR:', error);
            this.showFatalError(error);
        }
    },
    
    /**
     * Загружаем все модули
     */
    async loadAllModules() {
        console.log('Assigning imported modules...');
        
        // Assign already imported modules
        this.modules = {
            State,
            Simulator,
            Storage,
            Progress,
            Gamification,
            CTF,
            Patcher,
            TutorialSystem,
            Terminal,
            Sidebar,
            Disasm,
            Modal,
            PatchOverlay,
            Lessons
        };
        
        // Verify all modules loaded
        const requiredModules = ['State', 'Simulator', 'Terminal', 'Sidebar', 'Disasm'];
        for (const name of requiredModules) {
            if (!this.modules[name]) {
                throw new Error(`Required module ${name} not loaded!`);
            }
        }
        
        // Update status div
        testDiv.textContent = '✅ All modules ready!';
        testDiv.style.background = '#4df3a3';
        
        console.log('✅ All modules assigned successfully');
        
    },
    
    /**
     * Инициализация ядра
     */
    async initializeCore() {
        // Создаем прямые ссылки на модули для обратной совместимости
        this.State = this.modules.State;
        this.Simulator = this.modules.Simulator;
        this.Progress = this.modules.Progress;
        this.Gamification = this.modules.Gamification;
        this.CTF = this.modules.CTF;
        this.Patcher = this.modules.Patcher;
        this.Terminal = this.modules.Terminal;
        this.Sidebar = this.modules.Sidebar;
        this.Disasm = this.modules.Disasm;
        this.Modal = this.modules.Modal;
        this.PatchOverlay = this.modules.PatchOverlay;
        
        // State должен быть первым
        if (this.State && this.State.init) {
            this.State.init();
            console.log('✅ State initialized');
        }
        
        // Инициализируем систему геймификации
        if (this.Gamification && this.Gamification.init) {
            this.Gamification.init();
            console.log('✅ Gamification initialized');
        }
        
        // Инициализируем CTF модуль
        if (this.CTF && this.CTF.init) {
            this.CTF.init();
            console.log('✅ CTF module initialized');
        }
        
        // Инициализируем Patcher модуль
        if (this.Patcher && this.Patcher.init) {
            this.Patcher.setApp(this); // Связываем с приложением
            this.Patcher.init();
            console.log('✅ Patcher module initialized');
        }
        
        // Внедряем уроки в State
        if (this.modules.Lessons && Array.isArray(this.modules.Lessons)) {
            this.State.lessons = this.modules.Lessons;
            console.log(`✅ Injected ${this.modules.Lessons.length} lessons into State`);
        } else {
            throw new Error('Lessons not found or invalid format');
        }
    },
    
    /**
     * Инициализация UI компонентов
     */
    async initializeUI() {
        const uiModules = ['Terminal', 'Sidebar', 'Disasm', 'Modal'];
        
        for (const name of uiModules) {
            try {
                const module = this.modules[name];
                if (module && module.init) {
                    // Передаем App как контекст для межмодульной коммуникации
                    module.init(this);
                    console.log(`✅ ${name} UI initialized`);
                }
            } catch (error) {
                console.error(`⚠️ ${name} init failed:`, error);
                this.state.warnings.push({ module: name, error: error.message });
            }
        }
        
        // Инициализируем PatchOverlay после основных UI модулей
        if (this.PatchOverlay && this.PatchOverlay.init) {
            this.PatchOverlay.init();
            console.log('✅ PatchOverlay UI initialized');
        }
    },
    
    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        // Загружаем первый урок
        if (this.State.lessons && this.State.lessons.length > 0) {
            const firstLesson = this.State.lessons[0];
            this.State.loadLesson(firstLesson);
            console.log(`✅ Loaded default lesson: ${firstLesson.title}`);
            
            // Обновляем UI
            this.updateUI();
        }
    },
    
    /**
     * Финальная настройка
     */
    finalSetup() {
        // Фокус на терминал
        setTimeout(() => {
            const input = document.getElementById('term-input');
            if (input) input.focus();
        }, 100);
        
        // Экспортируем глобальные функции для отладки
        this.exportDebugFunctions();
    },
    
    /**
     * Приветственное сообщение
     */
    showWelcomeMessage() {
        const term = this.Terminal;
        if (term && term.body) {
            // Очищаем loading сообщения
            term.body.innerHTML = '';
            
            // Минималистичное приветствие без ASCII арта
            term.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
            term.print('INTERACTIVE ASSEMBLY & REVERSE ENGINEERING PLAYGROUND LAB', 'success');
            term.print('Created by 0UTSP0KEN - online sandbox and hacking simulation', 'muted');
            term.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
            term.print('', 'normal');
            term.print('Welcome! Type "help" for available commands.', 'normal');
            term.print('Use F10 to step, F9 to continue, or type commands directly.', 'muted');
            term.print('', 'normal');
        }
    },
    
    /**
     * Обновление всего UI
     */
    updateUI() {
        console.log('Updating UI...');
        
        if (this.Sidebar) {
            this.Sidebar.updateRightPanel();
            this.Sidebar.renderLessons();
        }
        
        if (this.Disasm) {
            this.Disasm.render();
        }
    },
    
    /**
     * Глобальные обработчики ошибок
     */
    setupGlobalErrorHandlers() {
        window.addEventListener('error', (e) => {
            const msg = e.error ? e.error.message : e.message;
            console.error('Global error:', e.error || e);
            
            if (this.Terminal && this.Terminal.print) {
                this.Terminal.print(`❌ Error: ${msg}`, 'error');
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            const msg = e.reason ? (e.reason.message || String(e.reason)) : 'Unknown';
            console.error('Unhandled rejection:', e.reason);
            
            if (this.Terminal && this.Terminal.print) {
                this.Terminal.print(`❌ Promise error: ${msg}`, 'error');
            }
        });
    },
    
    /**
     * Показать критическую ошибку
     */
    showFatalError(error) {
        document.getElementById('app').innerHTML = `
            <div style="padding: 50px; text-align: center; color: #ff5c7a;">
                <h1>💀 FATAL ERROR 💀</h1>
                <p style="font-size: 20px;">Hacker Lab failed to initialize</p>
                <pre style="background: #000; padding: 20px; margin: 20px; text-align: left; overflow: auto;">
${error.message}

${error.stack}
                </pre>
                <p>Check browser console (F12) for details</p>
                <p style="margin-top: 30px;">
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
                        🔄 Reload Page
                    </button>
                </p>
            </div>
        `;
    },
    
    /**
     * Экспорт функций для отладки
     */
    exportDebugFunctions() {
        window.HackerLab = {
            app: this,
            version: this.version,
            modules: this.modules,
            
            // Быстрые команды
            state: () => this.State,
            lessons: () => this.State.lessons,
            loadLesson: (id) => {
                const lesson = this.State.lessons.find(l => l.id === id);
                if (lesson) {
                    this.State.loadLesson(lesson);
                    this.updateUI();
                    return `Loaded: ${lesson.title}`;
                }
                return 'Lesson not found';
            },
            
            // Команды симулятора
            step: () => this.Terminal.executeCommand('si'),
            continue: () => this.Terminal.executeCommand('c'),
            reset: () => this.Terminal.executeCommand('reset'),
            check: () => this.Terminal.executeCommand('check'),
            
            // Информация
            help: () => {
                console.log('%c🔥 HACKER LAB DEBUG COMMANDS 🔥', 'color: #49f7c2; font-size: 16px;');
                console.log('HackerLab.state() - Get current state');
                console.log('HackerLab.lessons() - List all lessons');
                console.log('HackerLab.loadLesson(id) - Load specific lesson');
                console.log('HackerLab.step() - Step one instruction');
                console.log('HackerLab.continue() - Continue execution');
                console.log('HackerLab.reset() - Reset current lesson');
                console.log('HackerLab.check() - Check lesson completion');
            }
        };
        
        console.log('🔧 Debug functions available as window.HackerLab');
    }
};

// Запускаем когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        HackerLabApp.init();
    });
} else {
    HackerLabApp.init();
}

// Экспортируем глобально для отладки
window.HackerLabApp = HackerLabApp;
