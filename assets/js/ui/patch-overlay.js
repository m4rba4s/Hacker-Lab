/**
 * 🎨 PATCH OVERLAY UI
 * Визуальный интерфейс для патчинга инструкций
 */

export const PatchOverlay = {
    // Текущий выбранный элемент
    selectedRow: null,
    selectedIndex: -1,
    
    // Инициализация
    init() {
        this.addStyles();
        this.bindEvents();
        console.log('✅ Patch overlay initialized');
    },
    
    // Добавить стили
    addStyles() {
        if (document.getElementById('patch-overlay-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'patch-overlay-styles';
        style.textContent = `
            @keyframes patch-notify {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes patch-fade-out {
                from { opacity: 1; }
                to { opacity: 0; transform: translateY(20px); }
            }
            
            .disasm-row.patchable {
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .disasm-row.patchable:hover {
                background: rgba(73, 247, 194, 0.1) !important;
                box-shadow: inset 0 0 20px rgba(73, 247, 194, 0.2);
            }
            
            .disasm-row.patched {
                background: rgba(255, 107, 107, 0.15) !important;
                border-left: 3px solid #ff6b6b;
            }
            
            .patch-indicator {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: #ff6b6b;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .patch-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1a1f2e, #0a0e13);
                border: 2px solid #49f7c2;
                border-radius: 12px;
                padding: 30px;
                min-width: 500px;
                z-index: 10001;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            }
            
            .patch-dialog h3 {
                color: #49f7c2;
                margin: 0 0 20px 0;
                font-size: 24px;
            }
            
            .patch-dialog label {
                color: #e6f1ff;
                display: block;
                margin-bottom: 10px;
            }
            
            .patch-dialog input[type="text"] {
                width: 100%;
                padding: 10px;
                background: rgba(16, 22, 32, 0.9);
                border: 1px solid #3a506b;
                border-radius: 6px;
                color: #e6f1ff;
                font-family: 'Fira Code', monospace;
                margin-bottom: 20px;
            }
            
            .patch-dialog input[type="text"]:focus {
                outline: none;
                border-color: #49f7c2;
                box-shadow: 0 0 15px rgba(73, 247, 194, 0.3);
            }
            
            .patch-dialog .buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .patch-dialog button {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .patch-dialog .btn-apply {
                background: linear-gradient(135deg, #49f7c2, #2ecc71);
                color: #0a0e13;
            }
            
            .patch-dialog .btn-apply:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(73, 247, 194, 0.5);
            }
            
            .patch-dialog .btn-cancel {
                background: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
                border: 1px solid #ff6b6b;
            }
            
            .patch-dialog .btn-cancel:hover {
                background: rgba(255, 107, 107, 0.3);
            }
            
            .patch-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Привязать события
    bindEvents() {
        // Клик по инструкции
        document.addEventListener('click', (e) => {
            const row = e.target.closest('.disasm-row');
            if (row && row.dataset.index) {
                this.handleRowClick(row, parseInt(row.dataset.index));
            }
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && e.ctrlKey && this.selectedRow) {
                e.preventDefault();
                this.openPatchDialog();
            }
            if (e.key === 'r' && e.ctrlKey && this.selectedRow) {
                e.preventDefault();
                this.restoreInstruction();
            }
        });
    },
    
    // Обработка клика по строке
    handleRowClick(row, index) {
        // Снимаем предыдущее выделение
        if (this.selectedRow && this.selectedRow !== row) {
            this.selectedRow.style.outline = '';
        }
        
        this.selectedRow = row;
        this.selectedIndex = index;
        
        // Выделяем текущую строку
        row.style.outline = '2px solid #49f7c2';
        
        // Показываем контекстное меню через 300ms
        clearTimeout(this.contextTimeout);
        this.contextTimeout = setTimeout(() => {
            this.showContextMenu(row, index);
        }, 300);
    },
    
    // Показать контекстное меню
    showContextMenu(row, index) {
        // Удаляем старое меню
        const oldMenu = document.querySelector('.patch-context-menu');
        if (oldMenu) oldMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'patch-context-menu';
        menu.style.cssText = `
            position: absolute;
            background: linear-gradient(135deg, #1a1f2e, #0a0e13);
            border: 1px solid #49f7c2;
            border-radius: 8px;
            padding: 10px;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        `;
        
        const rect = row.getBoundingClientRect();
        menu.style.left = `${rect.right + 10}px`;
        menu.style.top = `${rect.top}px`;
        
        const isPatched = window.HackerLabApp?.Patcher?.patched.has(index);
        
        menu.innerHTML = `
            <button onclick="PatchOverlay.openPatchDialog()" style="
                display: block;
                width: 100%;
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: #49f7c2;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
            ">✏️ Patch Instruction</button>
            ${isPatched ? `
            <button onclick="PatchOverlay.restoreInstruction()" style="
                display: block;
                width: 100%;
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: #ff6b6b;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
            ">↩️ Restore Original</button>
            ` : ''}
        `;
        
        document.body.appendChild(menu);
        
        // Автоудаление через 3 секунды
        setTimeout(() => menu.remove(), 3000);
    },
    
    // Открыть диалог патчинга
    openPatchDialog() {
        if (this.selectedIndex < 0) return;
        
        const backdrop = document.createElement('div');
        backdrop.className = 'patch-backdrop';
        
        const dialog = document.createElement('div');
        dialog.className = 'patch-dialog';
        
        const currentInstruction = window.HackerLabApp?.State?.currentLesson?.disasm?.[this.selectedIndex];
        const currentValue = currentInstruction?.s || '';
        
        dialog.innerHTML = `
            <h3>🔧 Patch Instruction #${this.selectedIndex}</h3>
            <label>Current: <code style="color: #ff6b6b">${currentValue}</code></label>
            <label>New instruction:</label>
            <input type="text" id="patch-input" value="${currentValue}" placeholder="nop, jmp 0x1337, mov eax, 0xdead">
            <div class="buttons">
                <button class="btn-cancel" onclick="PatchOverlay.closePatchDialog()">Cancel</button>
                <button class="btn-apply" onclick="PatchOverlay.applyPatch()">Apply Patch</button>
            </div>
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(dialog);
        
        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('patch-input');
            input.focus();
            input.select();
        }, 100);
    },
    
    // Применить патч
    applyPatch() {
        const input = document.getElementById('patch-input');
        if (!input) return;
        
        const newInstruction = input.value.trim();
        if (!newInstruction) {
            alert('Please enter a valid instruction');
            return;
        }
        
        // Применяем патч через Patcher модуль
        if (window.HackerLabApp?.Patcher) {
            const result = window.HackerLabApp.Patcher.patchInstruction(
                this.selectedIndex, 
                newInstruction
            );
            
            if (result.success) {
                // Помечаем строку как патченную
                if (this.selectedRow) {
                    this.selectedRow.classList.add('patched');
                    
                    // Добавляем индикатор
                    let indicator = this.selectedRow.querySelector('.patch-indicator');
                    if (!indicator) {
                        indicator = document.createElement('span');
                        indicator.className = 'patch-indicator';
                        this.selectedRow.style.position = 'relative';
                        this.selectedRow.appendChild(indicator);
                    }
                    indicator.textContent = 'PATCHED';
                }
            }
        }
        
        this.closePatchDialog();
    },
    
    // Восстановить инструкцию
    restoreInstruction() {
        if (this.selectedIndex < 0) return;
        
        if (window.HackerLabApp?.Patcher) {
            const result = window.HackerLabApp.Patcher.restoreInstruction(this.selectedIndex);
            
            if (result.success && this.selectedRow) {
                this.selectedRow.classList.remove('patched');
                const indicator = this.selectedRow.querySelector('.patch-indicator');
                if (indicator) indicator.remove();
            }
        }
        
        // Удаляем контекстное меню
        const menu = document.querySelector('.patch-context-menu');
        if (menu) menu.remove();
    },
    
    // Закрыть диалог
    closePatchDialog() {
        const backdrop = document.querySelector('.patch-backdrop');
        const dialog = document.querySelector('.patch-dialog');
        if (backdrop) backdrop.remove();
        if (dialog) dialog.remove();
    }
};

// Экспортируем в глобальную область для доступа из HTML
window.PatchOverlay = PatchOverlay;
