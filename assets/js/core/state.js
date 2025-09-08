import { Progress } from './storage.js';

/**
 * Application State Management
 */
export const State = {
    // Current lesson
    currentLesson: null,
    
    // Simulator state
    ipIndex: 0,
    regs: {
        rax: 0n, rbx: 0n, rcx: 0n, rdx: 0n,
        rdi: 0n, rsi: 0n, rbp: 0n, rsp: 0n, rip: 0n
    },
    flags: {
        zf: 0, sf: 0, of: 0, cf: 0
    },
    stack: [],
    
    // UI state
    activeTab: 'disasm',
    breakpoints: [],
    hits: [],
    
    // Progress
    progress: {},
    
    // Initialize state
    init() {
        this.progress = Progress.load();
        this.resetSimulator();
    },
    
    // Reset simulator to default state
    resetSimulator() {
        this.ipIndex = 0;
        this.regs = {
            rax: 0n, rbx: 0n, rcx: 0n, rdx: 0n,
            rdi: 0n, rsi: 0n, rbp: 0n, rsp: 0n, rip: 0n
        };
        this.flags = { zf: 0, sf: 0, of: 0, cf: 0 };
        this.stack = [];
        this.breakpoints = [];
        this.hits = [];
    },
    
    // Load a lesson
    loadLesson(lesson) {
        this.currentLesson = lesson;
        this.resetSimulator();
        
        // Set initial state from lesson trace
        if (lesson.trace && lesson.trace.length > 0) {
            const initialState = lesson.trace[0];
            if (initialState.regs) {
                Object.assign(this.regs, this.mapBigInt(initialState.regs));
            }
            if (initialState.flags) {
                Object.assign(this.flags, initialState.flags);
            }
            if (initialState.stack) {
                this.stack = [...initialState.stack];
            }
        }
        
        // Set RIP to lesson base
        this.regs.rip = BigInt(lesson.base || 0x401000);
    },
    
    // Get current instruction
    getCurrentInstruction() {
        if (!this.currentLesson || !this.currentLesson.disasm) {
            return null;
        }
        return this.currentLesson.disasm[this.ipIndex] || null;
    },
    
    // Step execution
    step() {
        if (!this.currentLesson || !this.currentLesson.trace) {
            return 'no-lesson';
        }
        
        const trace = this.currentLesson.trace;
        if (this.ipIndex >= trace.length - 1) {
            return 'end';
        }
        
        // Save previous state for comparison
        const prevState = this.cloneState();
        
        // Apply next step
        this.ipIndex++;
        const step = trace[this.ipIndex];
        
        if (step.ip !== undefined) {
            // Update instruction pointer in disasm
            this.ipIndex = step.ip;
        }
        
        if (step.regs) {
            Object.assign(this.regs, this.mapBigInt(step.regs));
        }
        
        if (step.flags) {
            Object.assign(this.flags, step.flags);
        }
        
        if (step.stack) {
            this.stack = [...step.stack];
        }
        
        // Update RIP to current instruction address
        const currentInstr = this.getCurrentInstruction();
        if (currentInstr) {
            this.regs.rip = BigInt(currentInstr.a);
        }
        
        // Check breakpoints
        if (currentInstr && this.breakpoints.includes(currentInstr.a)) {
            this.hits.push(currentInstr.a);
            return 'breakpoint';
        }
        
        return 'ok';
    },
    
    // Continue execution
    continue() {
        let result = 'ok';
        let steps = 0;
        const maxSteps = 1000; // Safety guard
        
        while (result === 'ok' && steps < maxSteps) {
            result = this.step();
            steps++;
        }
        
        return result;
    },
    
    // Add/remove breakpoint
    toggleBreakpoint(address) {
        const index = this.breakpoints.indexOf(address);
        if (index === -1) {
            this.breakpoints.push(address);
            return true; // Added
        } else {
            this.breakpoints.splice(index, 1);
            return false; // Removed
        }
    },
    
    // Check lesson completion
    checkLesson() {
        if (!this.currentLesson || !this.currentLesson.check) {
            return false;
        }
        return this.currentLesson.check(this);
    },
    
    // Utility functions
    mapBigInt(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = BigInt(value);
        }
        return result;
    },
    
    cloneState() {
        return {
            ipIndex: this.ipIndex,
            regs: { ...this.regs },
            flags: { ...this.flags },
            stack: [...this.stack]
        };
    },
    
    // Format helpers
    formatHex(value, bits = 64) {
        const bigValue = BigInt(value);
        const hex = bigValue.toString(16).padStart(bits / 4, '0');
        return '0x' + hex;
    },
    
    formatReg(name) {
        const value = this.regs[name];
        if (value === undefined) return '0x0000000000000000';
        return this.formatHex(value);
    }
};

// State is now initialized by App.js
// State.init();