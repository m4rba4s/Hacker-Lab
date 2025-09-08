import { State } from './state.js';
import { Progress } from './storage.js';

/**
 * Assembly Simulator Core
 * Handles instruction execution, breakpoints, and trace processing
 */
export const Simulator = {
    // Execute one step
    step() {
        return State.step();
    },
    
    // Continue execution until breakpoint or end
    continue() {
        return State.continue();
    },
    
    // Add/remove breakpoint
    toggleBreakpoint(address) {
        return State.toggleBreakpoint(address);
    },
    
    // Show current breakpoints
    showBreakpoints() {
        if (State.breakpoints.length === 0) {
            return 'No breakpoints set';
        }
        
        let output = 'Breakpoints:\n';
        State.breakpoints.forEach(addr => {
            output += `  ${State.formatHex(addr)}\n`;
        });
        return output;
    },
    
    // Reset simulator state
    reset() {
        if (!State.currentLesson) {
            return 'No lesson loaded';
        }
        
        State.loadLesson(State.currentLesson);
        return 'Simulator reset';
    },
    
    // Check lesson completion
    check() {
        if (!State.currentLesson) {
            return { passed: false, message: 'No lesson loaded' };
        }
        
        const passed = State.checkLesson();
        if (passed) {
            Progress.save(State.currentLesson.id, true);
            return { passed: true, message: '✓ PASS: Goal achieved!' };
        } else {
            return { passed: false, message: '✗ FAIL: Goal not achieved' };
        }
    },
    
    // Show success animation
    showSuccess() {
        // Simple confetti effect
        const confetti = document.createElement('div');
        confetti.innerHTML = '🎉';
        confetti.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            pointer-events: none;
            z-index: 9999;
            animation: confetti 2s ease-out forwards;
        `;
        
        // Add keyframes if not exists
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1) translateY(-100px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(confetti);
        setTimeout(() => document.body.removeChild(confetti), 2000);
    },
    
    // Format instruction for display
    formatInstruction(instr) {
        if (!instr) return 'N/A';
        return `${State.formatHex(instr.a)}: ${instr.s}`;
    },
    
    // Get disassembly around current IP
    getDisasmContext(count = 8) {
        if (!State.currentLesson || !State.currentLesson.disasm) {
            return [];
        }
        
        const disasm = State.currentLesson.disasm;
        const current = State.ipIndex;
        const start = Math.max(0, current - Math.floor(count / 2));
        const end = Math.min(disasm.length, start + count);
        
        return disasm.slice(start, end).map((instr, i) => ({
            ...instr,
            isCurrent: start + i === current,
            isBreakpoint: State.breakpoints.includes(instr.a)
        }));
    }
};