/**
 * 🚩 CTF FLAGS MODULE
 * Система флагов для заданий в стиле CTF
 */

export const CTF = {
    // Хранилище найденных флагов
    flags: new Set(),
    
    // База флагов и их заданий
    challenges: {
        'HTB{f1rst_bl00d}': {
            name: 'First Blood',
            points: 100,
            hint: 'Complete your first lesson'
        },
        'HTB{st4ck_m4st3r}': {
            name: 'Stack Master',
            points: 200,
            hint: 'Manipulate the stack correctly'
        },
        'HTB{r3g_h4ck3r}': {
            name: 'Register Hacker',
            points: 150,
            hint: 'Set RAX to 0x1337'
        },
        'HTB{jmp_n1nj4}': {
            name: 'Jump Ninja',
            points: 300,
            hint: 'Bypass the password check'
        },
        'HTB{buff3r_0v3rfl0w}': {
            name: 'Buffer Overflow',
            points: 500,
            hint: 'Overwrite the return address'
        }
    },
    
    // Проверка флага
    submitFlag(flag) {
        if (this.challenges[flag]) {
            if (!this.flags.has(flag)) {
                this.flags.add(flag);
                const challenge = this.challenges[flag];
                
                // Показываем успех
                this.showSuccess(challenge);
                
                // Добавляем XP
                if (window.HackerLabApp?.Gamification) {
                    window.HackerLabApp.Gamification.addXP(challenge.points, `CTF: ${challenge.name}`);
                }
                
                // Сохраняем прогресс
                this.saveProgress();
                
                return {
                    success: true,
                    message: `🎯 FLAG CAPTURED: ${challenge.name} (+${challenge.points} XP)`,
                    points: challenge.points
                };
            } else {
                return {
                    success: false,
                    message: '⚠️ You already have this flag!'
                };
            }
        } else {
            return {
                success: false,
                message: '❌ Invalid flag! Keep trying...'
            };
        }
    },
    
    // Показать красивое уведомление
    showSuccess(challenge) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0a0e13, #1a1f2e);
            border: 2px solid #49f7c2;
            border-radius: 12px;
            padding: 30px;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(73, 247, 194, 0.5);
            animation: ctf-success 0.5s ease;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">🚩</div>
            <h2 style="color: #49f7c2; margin: 10px 0;">FLAG CAPTURED!</h2>
            <p style="color: #e6f1ff; font-size: 18px; margin: 10px 0;">${challenge.name}</p>
            <p style="color: #ffd36e; font-size: 24px; font-weight: bold;">+${challenge.points} XP</p>
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'ctf-fade-out 0.5s ease';
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    },
    
    // Сохранение прогресса
    saveProgress() {
        localStorage.setItem('hl_ctf_flags', JSON.stringify([...this.flags]));
    },
    
    // Загрузка прогресса
    loadProgress() {
        const saved = localStorage.getItem('hl_ctf_flags');
        if (saved) {
            this.flags = new Set(JSON.parse(saved));
        }
    },
    
    // Получить статистику
    getStats() {
        const total = Object.keys(this.challenges).length;
        const found = this.flags.size;
        const points = [...this.flags].reduce((sum, flag) => {
            return sum + (this.challenges[flag]?.points || 0);
        }, 0);
        
        return { total, found, points };
    },
    
    // Инициализация
    init() {
        this.loadProgress();
        
        // Добавляем CSS для анимаций
        if (!document.getElementById('ctf-styles')) {
            const style = document.createElement('style');
            style.id = 'ctf-styles';
            style.textContent = `
                @keyframes ctf-success {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes ctf-fade-out {
                    to { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};
