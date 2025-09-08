/**
 * 🔧 INSTRUCTION PATCHER MODULE
 * Интерактивное изменение инструкций в реальном времени
 */

export const Patcher = {
    // Оригинальные инструкции
    original: [],
    
    // Патченные инструкции
    patched: new Map(),
    
    // Инициализация
    init() {
        console.log('✅ Patcher module initialized');
    },
    
    // Патчить инструкцию
    patchInstruction(index, newInstruction) {
        if (!this.app?.State?.currentLesson?.disasm) {
            return { success: false, message: 'No lesson loaded' };
        }
        
        const disasm = this.app.State.currentLesson.disasm;
        if (index < 0 || index >= disasm.length) {
            return { success: false, message: 'Invalid instruction index' };
        }
        
        // Сохраняем оригинал
        if (!this.original[index]) {
            this.original[index] = { ...disasm[index] };
        }
        
        // Применяем патч
        this.patched.set(index, newInstruction);
        disasm[index].s = newInstruction;
        
        // Обновляем UI
        if (this.app?.updateUI) {
            this.app.updateUI();
        }
        
        // Проверяем достижения
        this.checkPatchAchievements(newInstruction);
        
        return { 
            success: true, 
            message: `Patched instruction ${index}: ${newInstruction}` 
        };
    },
    
    // Восстановить оригинал
    restoreInstruction(index) {
        if (this.original[index] && this.app?.State?.currentLesson?.disasm) {
            const disasm = this.app.State.currentLesson.disasm;
            disasm[index] = { ...this.original[index] };
            this.patched.delete(index);
            
            if (this.app?.updateUI) {
                this.app.updateUI();
            }
            
            return { success: true, message: 'Instruction restored' };
        }
        return { success: false, message: 'No patch to restore' };
    },
    
    // Восстановить все
    restoreAll() {
        if (!this.app?.State?.currentLesson?.disasm) return;
        
        const disasm = this.app.State.currentLesson.disasm;
        this.patched.forEach((_, index) => {
            if (this.original[index]) {
                disasm[index] = { ...this.original[index] };
            }
        });
        
        this.patched.clear();
        this.original = [];
        
        if (this.app?.updateUI) {
            this.app.updateUI();
        }
        
        return { success: true, message: 'All patches restored' };
    },
    
    // Проверка достижений
    checkPatchAchievements(instruction) {
        // NOP sled achievement
        if (instruction === 'nop' && this.patched.size >= 5) {
            this.unlockAchievement('NOP_SLED', 'Created a NOP sled!');
        }
        
        // Jump bypass achievement
        if (instruction.startsWith('jmp') || instruction === 'nop') {
            const bypassed = Array.from(this.patched.values()).filter(i => 
                i.startsWith('jmp') || i === 'nop'
            ).length;
            
            if (bypassed >= 3) {
                this.unlockAchievement('JUMP_MASTER', 'Bypassed multiple checks!');
            }
        }
        
        // Register manipulation
        if (instruction.includes('0x1337') || instruction.includes('0xdead')) {
            this.unlockAchievement('L33T_H4X0R', 'Used elite values!');
        }
    },
    
    // Разблокировать достижение
    unlockAchievement(id, message) {
        // Отправляем CTF флаг если есть
        const flags = {
            'NOP_SLED': 'HTB{n0p_sl3d_m4st3r}',
            'JUMP_MASTER': 'HTB{jmp_bypass_pr0}',
            'L33T_H4X0R': 'HTB{31337_h4x0r}'
        };
        
        if (flags[id] && window.HackerLabApp?.CTF) {
            window.HackerLabApp.CTF.submitFlag(flags[id]);
        }
        
        // Показываем уведомление
        this.showNotification('🏆 Achievement Unlocked', message);
    },
    
    // Показать уведомление
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1f2e, #0a0e13);
            border: 2px solid #49f7c2;
            border-radius: 12px;
            padding: 20px;
            min-width: 300px;
            z-index: 10000;
            animation: patch-notify 0.5s ease;
        `;
        
        notification.innerHTML = `
            <h4 style="color: #49f7c2; margin: 0 0 10px 0;">${title}</h4>
            <p style="color: #e6f1ff; margin: 0;">${message}</p>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'patch-fade-out 0.5s ease';
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    },
    
    // Привязка к приложению
    setApp(app) {
        this.app = app;
    }
};
