/**
 * 🎓 ADVANCED TUTORIAL SYSTEM
 * Интерактивная система обучения с брейкпоинтами и пошаговыми объяснениями
 */

export const TutorialSystem = {
    currentStep: 0,
    isActive: false,
    currentTutorial: null,
    
    // Туториалы для каждого типа урока
    tutorials: {
        'breakpoints': {
            title: '🔴 Mastering Breakpoints',
            steps: [
                {
                    instruction: 'Click on any instruction line or use Ctrl+Click',
                    highlight: '.disasm-row',
                    action: 'Set your first breakpoint at the CMP instruction',
                    validate: (state) => state.breakpoints.length > 0
                },
                {
                    instruction: 'Press F9 or type "c" to continue execution',
                    highlight: '#term-input',
                    action: 'Run until breakpoint is hit',
                    validate: (state) => state.hitBreakpoint === true
                },
                {
                    instruction: 'Examine registers at breakpoint',
                    highlight: '#reg-grid',
                    action: 'Check RAX and flags values',
                    validate: (state) => true
                },
                {
                    instruction: 'Remove breakpoint with "del" command',
                    highlight: '#term-input',
                    action: 'Clear all breakpoints',
                    validate: (state) => state.breakpoints.length === 0
                }
            ]
        },
        
        'patching': {
            title: '🔧 Dynamic Patching',
            steps: [
                {
                    instruction: 'Select a JZ/JNZ instruction',
                    highlight: '.disasm-row',
                    action: 'Find conditional jump to patch',
                    validate: (state) => true
                },
                {
                    instruction: 'Press Ctrl+P or right-click',
                    highlight: '.patch-dialog',
                    action: 'Open patch dialog',
                    validate: (state) => true
                },
                {
                    instruction: 'Change JZ to JMP or NOP',
                    highlight: '#patch-input',
                    action: 'Bypass the condition check',
                    validate: (state) => state.patchApplied === true
                },
                {
                    instruction: 'Run and see different behavior',
                    highlight: '#term-input',
                    action: 'Execute patched code',
                    validate: (state) => state.goalAchieved === true
                }
            ]
        },
        
        'rop': {
            title: '🔗 ROP Chain Construction',
            steps: [
                {
                    instruction: 'Identify useful gadgets',
                    highlight: '.disasm-content',
                    action: 'Look for: pop rdi; ret',
                    validate: (state) => true
                },
                {
                    instruction: 'Note gadget addresses',
                    highlight: '.disasm-addr',
                    action: 'Write down addresses for chain',
                    validate: (state) => true
                },
                {
                    instruction: 'Build payload structure',
                    highlight: '#term-input',
                    action: 'Type: ropgen to see template',
                    validate: (state) => true
                },
                {
                    instruction: 'Chain gadgets for execve',
                    highlight: '.rop-chain',
                    action: 'Construct: pop rdi → "/bin/sh" → syscall',
                    validate: (state) => state.ropChainValid === true
                }
            ]
        }
    },
    
    // Начать туториал
    startTutorial(type) {
        if (!this.tutorials[type]) return false;
        
        this.currentTutorial = this.tutorials[type];
        this.currentStep = 0;
        this.isActive = true;
        
        this.showTutorialOverlay();
        this.highlightElement();
        
        return true;
    },
    
    // Следующий шаг
    nextStep() {
        if (!this.isActive || !this.currentTutorial) return;
        
        const step = this.currentTutorial.steps[this.currentStep];
        if (step.validate && !step.validate(window.HackerLabApp.State)) {
            this.showError('Complete current step first!');
            return;
        }
        
        this.currentStep++;
        
        if (this.currentStep >= this.currentTutorial.steps.length) {
            this.completeTutorial();
        } else {
            this.highlightElement();
            this.updateOverlay();
        }
    },
    
    // Показать оверлей туториала
    showTutorialOverlay() {
        // Удаляем старый если есть
        const oldOverlay = document.getElementById('tutorial-overlay');
        if (oldOverlay) oldOverlay.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: linear-gradient(135deg, #1a1f2e, #0a0e13);
            border: 2px solid #49f7c2;
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        `;
        
        this.updateOverlay(overlay);
        document.body.appendChild(overlay);
    },
    
    // Обновить содержимое оверлея
    updateOverlay(overlay = null) {
        if (!overlay) {
            overlay = document.getElementById('tutorial-overlay');
        }
        if (!overlay || !this.currentTutorial) return;
        
        const step = this.currentTutorial.steps[this.currentStep];
        const progress = ((this.currentStep + 1) / this.currentTutorial.steps.length) * 100;
        
        overlay.innerHTML = `
            <h3 style="color: #49f7c2; margin: 0 0 15px 0; font-size: 18px;">
                ${this.currentTutorial.title}
            </h3>
            <div style="background: rgba(255, 255, 255, 0.1); height: 4px; border-radius: 2px; margin-bottom: 15px;">
                <div style="background: #49f7c2; height: 100%; width: ${progress}%; border-radius: 2px; transition: width 0.3s;"></div>
            </div>
            <p style="color: #e6f1ff; margin: 0 0 10px 0; font-size: 14px;">
                Step ${this.currentStep + 1}/${this.currentTutorial.steps.length}
            </p>
            <p style="color: #ffd36e; font-weight: bold; margin: 0 0 10px 0;">
                📌 ${step.instruction}
            </p>
            <p style="color: #8aa2b2; font-size: 13px; margin: 0 0 15px 0;">
                ${step.action}
            </p>
            <div style="display: flex; gap: 10px;">
                <button onclick="TutorialSystem.skipTutorial()" style="
                    padding: 8px 16px;
                    background: rgba(255, 107, 107, 0.2);
                    border: 1px solid #ff6b6b;
                    color: #ff6b6b;
                    border-radius: 6px;
                    cursor: pointer;
                ">Skip</button>
                <button onclick="TutorialSystem.nextStep()" style="
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #49f7c2, #2ecc71);
                    border: none;
                    color: #0a0e13;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    flex: 1;
                ">Next →</button>
            </div>
        `;
    },
    
    // Подсветить элемент
    highlightElement() {
        // Убираем старую подсветку
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        if (!this.currentTutorial) return;
        
        const step = this.currentTutorial.steps[this.currentStep];
        if (step.highlight) {
            const elements = document.querySelectorAll(step.highlight);
            elements.forEach(el => {
                el.classList.add('tutorial-highlight');
            });
        }
    },
    
    // Завершить туториал
    completeTutorial() {
        this.isActive = false;
        
        // Показываем поздравление
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <h3 style="color: #49f7c2; margin: 0 0 15px 0; font-size: 20px;">
                    🎉 Tutorial Complete!
                </h3>
                <p style="color: #e6f1ff; margin: 0 0 15px 0;">
                    You've mastered: ${this.currentTutorial.title}
                </p>
                <button onclick="TutorialSystem.closeTutorial()" style="
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #49f7c2, #2ecc71);
                    border: none;
                    color: #0a0e13;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            `;
            
            // Автоматически закрыть через 3 секунды
            setTimeout(() => this.closeTutorial(), 3000);
        }
        
        // Награда XP
        if (window.HackerLabApp?.Gamification) {
            window.HackerLabApp.Gamification.awardXP(50, 'Tutorial completed');
        }
    },
    
    // Пропустить туториал
    skipTutorial() {
        this.closeTutorial();
    },
    
    // Закрыть туториал
    closeTutorial() {
        this.isActive = false;
        this.currentTutorial = null;
        this.currentStep = 0;
        
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.remove();
        
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    },
    
    // Показать ошибку
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.2);
            border: 2px solid #ff6b6b;
            color: #ff6b6b;
            padding: 15px;
            border-radius: 8px;
            z-index: 10001;
            animation: shake 0.5s;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 2000);
    }
};

// Экспорт глобально для доступа из HTML
window.TutorialSystem = TutorialSystem;

// Добавляем стили для подсветки
const style = document.createElement('style');
style.textContent = `
    .tutorial-highlight {
        outline: 3px solid #49f7c2 !important;
        outline-offset: 2px;
        animation: tutorial-pulse 2s ease-in-out infinite;
    }
    
    @keyframes tutorial-pulse {
        0%, 100% { outline-color: #49f7c2; }
        50% { outline-color: #2ecc71; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
