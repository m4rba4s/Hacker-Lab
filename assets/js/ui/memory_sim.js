/**
 * 💾 MEMORY SIMULATION MODULE
 * Визуализация стека, кучи и сегментов памяти
 */

export const MemorySim = {
    container: null,
    
    // Симуляция памяти
    memory: {
        stack: [],
        heap: [],
        text: [],
        data: []
    },
    
    // Инициализация
    init(container) {
        this.container = container;
        this.render();
    },
    
    // Рендер визуализации памяти
    render() {
        if (!this.container) return;
        
        let html = `
            <div class="memory-sim-container">
                <h3 style="color: #49f7c2; margin-bottom: 20px;">
                    <span>💾</span> Memory Layout Visualization
                </h3>
                
                <div class="memory-layout">
                    ${this.renderSegment('Stack', 'stack', 0x7FFFFFFFF000, 'grows down ↓')}
                    <div class="memory-gap">... unmapped ...</div>
                    ${this.renderSegment('Heap', 'heap', 0x000000404000, 'grows up ↑')}
                    ${this.renderSegment('Data', 'data', 0x000000402000)}
                    ${this.renderSegment('Text', 'text', 0x000000401000, 'code')}
                </div>
                
                <div class="memory-controls">
                    <button onclick="MemorySim.pushStack()">Push to Stack</button>
                    <button onclick="MemorySim.popStack()">Pop from Stack</button>
                    <button onclick="MemorySim.allocHeap()">Malloc</button>
                    <button onclick="MemorySim.freeHeap()">Free</button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Добавим стили если их нет
        this.addStyles();
    },
    
    // Рендер сегмента памяти
    renderSegment(name, type, baseAddr, info = '') {
        const data = this.memory[type];
        const color = {
            stack: '#ffd36e',
            heap: '#4df3a3',
            data: '#7ea8ff',
            text: '#ff79c6'
        }[type];
        
        return `
            <div class="memory-segment" style="border-left: 3px solid ${color};">
                <div class="segment-header">
                    <span style="color: ${color}; font-weight: bold;">${name}</span>
                    <span style="color: #8aa2b2; font-size: 11px;">
                        ${this.formatAddr(baseAddr)} ${info}
                    </span>
                </div>
                <div class="segment-content" id="segment-${type}">
                    ${this.renderMemoryCells(data, type, baseAddr)}
                </div>
            </div>
        `;
    },
    
    // Рендер ячеек памяти
    renderMemoryCells(data, type, baseAddr) {
        if (data.length === 0) {
            return '<div style="color: #6272a4; font-style: italic;">Empty</div>';
        }
        
        return data.map((value, index) => {
            const addr = type === 'stack' 
                ? baseAddr - (index * 8)
                : baseAddr + (index * 8);
            
            return `
                <div class="memory-cell">
                    <span class="cell-addr">${this.formatAddr(addr)}</span>
                    <span class="cell-value">${this.formatValue(value)}</span>
                    <span class="cell-ascii">${this.toAscii(value)}</span>
                </div>
            `;
        }).join('');
    },
    
    // Stack operations
    pushStack(value = Math.random() * 0xFFFFFFFF | 0) {
        this.memory.stack.push(value);
        this.updateSegment('stack');
        this.showOperation('PUSH', value, 'stack');
    },
    
    popStack() {
        if (this.memory.stack.length > 0) {
            const value = this.memory.stack.pop();
            this.updateSegment('stack');
            this.showOperation('POP', value, 'stack');
        }
    },
    
    // Heap operations
    allocHeap(size = 16) {
        const block = {
            size: size,
            data: new Array(size/8).fill(0),
            free: false
        };
        this.memory.heap.push(block);
        this.updateSegment('heap');
        this.showOperation('MALLOC', size, 'heap');
    },
    
    freeHeap() {
        if (this.memory.heap.length > 0) {
            const last = this.memory.heap[this.memory.heap.length - 1];
            last.free = true;
            this.updateSegment('heap');
            this.showOperation('FREE', last.size, 'heap');
        }
    },
    
    // Обновить отображение сегмента
    updateSegment(type) {
        const container = document.getElementById(`segment-${type}`);
        if (container) {
            const baseAddr = {
                stack: 0x7FFFFFFFF000,
                heap: 0x000000404000,
                data: 0x000000402000,
                text: 0x000000401000
            }[type];
            
            container.innerHTML = this.renderMemoryCells(this.memory[type], type, baseAddr);
        }
    },
    
    // Показать операцию
    showOperation(op, value, segment) {
        const notification = document.createElement('div');
        notification.className = 'memory-op-notification';
        notification.textContent = `${op}: ${this.formatValue(value)} → ${segment}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1f2e;
            border: 1px solid #49f7c2;
            padding: 10px 20px;
            border-radius: 8px;
            color: #49f7c2;
            animation: slide-in 0.3s ease;
            z-index: 1000;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 2000);
    },
    
    // Форматирование
    formatAddr(addr) {
        return '0x' + addr.toString(16).padStart(12, '0');
    },
    
    formatValue(value) {
        if (typeof value === 'object') {
            return `[${value.size} bytes]`;
        }
        return '0x' + (value >>> 0).toString(16).padStart(8, '0');
    },
    
    toAscii(value) {
        if (typeof value === 'object') return '';
        
        let ascii = '';
        for (let i = 0; i < 4; i++) {
            const byte = (value >> (i * 8)) & 0xFF;
            ascii += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        }
        return ascii;
    },
    
    // Добавить стили
    addStyles() {
        if (!document.getElementById('memory-sim-styles')) {
            const style = document.createElement('style');
            style.id = 'memory-sim-styles';
            style.textContent = `
                .memory-sim-container {
                    padding: 20px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                }
                .memory-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                }
                .memory-segment {
                    background: rgba(255,255,255,0.02);
                    padding: 10px;
                    border-radius: 6px;
                }
                .segment-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .memory-cell {
                    display: grid;
                    grid-template-columns: 150px 120px 60px;
                    gap: 15px;
                    padding: 3px 10px;
                    font-family: monospace;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                .memory-cell:hover {
                    background: rgba(73, 247, 194, 0.1);
                }
                .cell-addr { color: #7ea8ff; }
                .cell-value { color: #e6f1ff; }
                .cell-ascii { color: #6272a4; }
                .memory-gap {
                    text-align: center;
                    color: #6272a4;
                    font-style: italic;
                    padding: 5px;
                }
                .memory-controls {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                .memory-controls button {
                    background: #49f7c2;
                    color: #0a0e1a;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                }
                .memory-controls button:hover {
                    background: #4df3a3;
                    transform: translateY(-2px);
                }
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Экспорт для глобального доступа
window.MemorySim = MemorySim;
