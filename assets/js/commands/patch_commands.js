/**
 * 🔧 PATCH COMMANDS
 * Терминальные команды для патчинга инструкций
 */

export const PatchCommands = {
    // Патчить инструкцию
    'patch': {
        description: 'Patch instruction at index or address',
        usage: 'patch <index|address> <new_instruction>',
        execute: (args, app) => {
            if (args.length < 2) {
                return { 
                    output: 'Usage: patch <index|address> <new_instruction>\nExample: patch 5 nop', 
                    type: 'error' 
                };
            }
            
            // Парсим индекс или адрес
            let index;
            const first = args[0];
            
            if (first.startsWith('0x')) {
                // Адрес в hex
                const addr = parseInt(first, 16);
                const disasm = app.State?.currentLesson?.disasm;
                if (!disasm) {
                    return { output: 'No lesson loaded', type: 'error' };
                }
                
                index = disasm.findIndex(instr => instr.a === addr);
                if (index === -1) {
                    return { output: `Address ${first} not found`, type: 'error' };
                }
            } else {
                // Прямой индекс
                index = parseInt(first);
                if (isNaN(index)) {
                    return { output: 'Invalid index', type: 'error' };
                }
            }
            
            // Собираем новую инструкцию
            const newInstruction = args.slice(1).join(' ');
            
            // Применяем патч
            if (!app.Patcher) {
                return { output: 'Patcher module not loaded', type: 'error' };
            }
            
            const result = app.Patcher.patchInstruction(index, newInstruction);
            
            if (result.success) {
                return { 
                    output: `✅ ${result.message}`, 
                    type: 'success' 
                };
            } else {
                return { 
                    output: `❌ ${result.message}`, 
                    type: 'error' 
                };
            }
        }
    },
    
    // Восстановить инструкцию
    'restore': {
        description: 'Restore original instruction',
        usage: 'restore <index|address>',
        execute: (args, app) => {
            if (args.length < 1) {
                return { 
                    output: 'Usage: restore <index|address>', 
                    type: 'error' 
                };
            }
            
            // Парсим индекс или адрес
            let index;
            const first = args[0];
            
            if (first.startsWith('0x')) {
                // Адрес в hex
                const addr = parseInt(first, 16);
                const disasm = app.State?.currentLesson?.disasm;
                if (!disasm) {
                    return { output: 'No lesson loaded', type: 'error' };
                }
                
                index = disasm.findIndex(instr => instr.a === addr);
                if (index === -1) {
                    return { output: `Address ${first} not found`, type: 'error' };
                }
            } else {
                // Прямой индекс
                index = parseInt(first);
                if (isNaN(index)) {
                    return { output: 'Invalid index', type: 'error' };
                }
            }
            
            // Восстанавливаем
            if (!app.Patcher) {
                return { output: 'Patcher module not loaded', type: 'error' };
            }
            
            const result = app.Patcher.restoreInstruction(index);
            
            if (result.success) {
                return { 
                    output: `✅ ${result.message}`, 
                    type: 'success' 
                };
            } else {
                return { 
                    output: `❌ ${result.message}`, 
                    type: 'error' 
                };
            }
        }
    },
    
    // Восстановить все
    'restore-all': {
        description: 'Restore all patched instructions',
        usage: 'restore-all',
        execute: (args, app) => {
            if (!app.Patcher) {
                return { output: 'Patcher module not loaded', type: 'error' };
            }
            
            const result = app.Patcher.restoreAll();
            
            if (result && result.success) {
                return { 
                    output: '✅ All patches restored', 
                    type: 'success' 
                };
            } else {
                return { 
                    output: '❌ Failed to restore patches', 
                    type: 'error' 
                };
            }
        }
    },
    
    // Показать патчи
    'patches': {
        description: 'Show all active patches',
        usage: 'patches',
        execute: (args, app) => {
            if (!app.Patcher) {
                return { output: 'Patcher module not loaded', type: 'error' };
            }
            
            const patches = app.Patcher.patched;
            
            if (patches.size === 0) {
                return { output: 'No active patches', type: 'normal' };
            }
            
            let output = `🔧 Active patches (${patches.size}):\n`;
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            
            patches.forEach((instruction, index) => {
                const original = app.Patcher.original[index];
                if (original) {
                    output += `[${index}] ${original.s} → ${instruction}\n`;
                }
            });
            
            return { output, type: 'success' };
        }
    },
    
    // NOP sled
    'nop-sled': {
        description: 'Create a NOP sled from start to end index',
        usage: 'nop-sled <start> <end>',
        execute: (args, app) => {
            if (args.length < 2) {
                return { 
                    output: 'Usage: nop-sled <start> <end>\nExample: nop-sled 5 10', 
                    type: 'error' 
                };
            }
            
            const start = parseInt(args[0]);
            const end = parseInt(args[1]);
            
            if (isNaN(start) || isNaN(end)) {
                return { output: 'Invalid range', type: 'error' };
            }
            
            if (start > end) {
                return { output: 'Start must be less than end', type: 'error' };
            }
            
            if (!app.Patcher) {
                return { output: 'Patcher module not loaded', type: 'error' };
            }
            
            let patched = 0;
            for (let i = start; i <= end; i++) {
                const result = app.Patcher.patchInstruction(i, 'nop');
                if (result.success) patched++;
            }
            
            return { 
                output: `🔥 NOP sled created! Patched ${patched} instructions [${start}-${end}]`, 
                type: 'success' 
            };
        }
    }
};

// Экспортируем для регистрации в терминале
export function registerPatchCommands(terminal) {
    Object.entries(PatchCommands).forEach(([name, cmd]) => {
        terminal.registerCommand(name, cmd);
    });
}
