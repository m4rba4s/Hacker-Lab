/**
 * 🔥 TIER 2 ENHANCED - Advanced Control Flow & Exploitation
 * Продвинутые уроки с детальными объяснениями
 */

export const Tier2Enhanced = [
    {
        id: '2.1',
        title: '🔴 Mastering Breakpoints & Debugging',
        difficulty: 'intermediate',
        xp: 150,
        skills: ['debugging', 'breakpoints', 'analysis'],
        
        description: `
            Master the art of debugging with breakpoints:
            • Set conditional breakpoints
            • Analyze register states at critical points
            • Trace execution flow
            • Identify vulnerabilities through debugging
        `,
        
        goal: 'Set breakpoint at CMP, analyze registers, then bypass the check',
        
        objectives: [
            'Set breakpoint at CMP instruction (Ctrl+Click)',
            'Run to breakpoint with F9',
            'Examine RAX value at breakpoint',
            'Patch JZ to JMP to bypass check',
            'Reach the success function'
        ],
        
        hints: {
            1: 'Click on line 3 (CMP instruction) to set breakpoint',
            2: 'When at breakpoint, check RAX value in registers panel',
            3: 'Use "patch 4 jmp 0x401030" to always jump'
        },
        
        sourceCode: `
int check_password(int input) {
    int secret = 0x1337;
    
    if (input == secret) {
        return SUCCESS;  // 0x42
    } else {
        return FAIL;     // 0x00
    }
}`,
        
        disasm: [
            { a: 0x401000, b: '48c7c000100000', s: 'mov rax, 0x1000' },
            { a: 0x401007, b: '48c7c337130000', s: 'mov rbx, 0x1337' },
            { a: 0x40100e, b: '4839d8', s: 'cmp rax, rbx' },
            { a: 0x401011, b: '7407', s: 'jz 0x40101a' },
            { a: 0x401013, b: '48c7c000000000', s: 'mov rax, 0x00' },
            { a: 0x40101a, b: 'c3', s: 'ret' },
            { a: 0x40101b, b: '48c7c042000000', s: 'mov rax, 0x42' },
            { a: 0x401022, b: 'c3', s: 'ret' }
        ],
        
        suggestedBreakpoints: [
            { addr: 0x40100e, reason: 'CMP instruction - check values here' },
            { addr: 0x401011, reason: 'Conditional jump - patch here' }
        ],
        
        check: (state) => {
            if (state.regs.rax === 0x42n) {
                return { 
                    pass: true, 
                    message: '🎉 Excellent! You bypassed the check using breakpoints!' 
                };
            }
            return { 
                pass: false, 
                message: 'RAX should be 0x42. Try patching the JZ instruction.' 
            };
        }
    },
    
    {
        id: '2.2',
        title: '🔄 Advanced Loop Optimization',
        difficulty: 'intermediate',
        xp: 200,
        skills: ['loops', 'optimization', 'performance'],
        
        description: `
            Learn how compilers optimize loops:
            • Loop unrolling techniques
            • Register allocation in loops
            • Branch prediction optimization
            • SIMD vectorization basics
        `,
        
        goal: 'Understand and modify optimized loop to calculate sum of 1-100',
        
        sourceCode: `
// Original C code
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;
}

// Compiler optimized with unrolling
int sum = 0;
for (int i = 1; i <= 100; i += 4) {
    sum += i;
    sum += i + 1;
    sum += i + 2;
    sum += i + 3;
}`,
        
        disasm: [
            { a: 0x401000, b: '48c7c000000000', s: 'mov rax, 0' },     // sum = 0
            { a: 0x401007, b: '48c7c101000000', s: 'mov rcx, 1' },     // i = 1
            { a: 0x40100e, b: '4883f964', s: 'cmp rcx, 100' },         // i <= 100?
            { a: 0x401012, b: '7f1a', s: 'jg 0x40102e' },              // exit if i > 100
            { a: 0x401014, b: '4801c8', s: 'add rax, rcx' },           // sum += i
            { a: 0x401017, b: '488d5101', s: 'lea rdx, [rcx+1]' },     // rdx = i+1
            { a: 0x40101b, b: '4801d0', s: 'add rax, rdx' },           // sum += i+1
            { a: 0x40101e, b: '488d5102', s: 'lea rdx, [rcx+2]' },     // rdx = i+2
            { a: 0x401022, b: '4801d0', s: 'add rax, rdx' },           // sum += i+2
            { a: 0x401025, b: '488d5103', s: 'lea rdx, [rcx+3]' },     // rdx = i+3
            { a: 0x401029, b: '4801d0', s: 'add rax, rdx' },           // sum += i+3
            { a: 0x40102c, b: '4883c104', s: 'add rcx, 4' },           // i += 4
            { a: 0x401030, b: 'ebdc', s: 'jmp 0x40100e' },             // loop
            { a: 0x40102e, b: 'c3', s: 'ret' }
        ],
        
        check: (state) => {
            // Sum of 1-100 = 5050
            if (state.regs.rax === 5050n) {
                return { 
                    pass: true, 
                    message: '✅ Perfect! Loop optimization understood!' 
                };
            }
            return { 
                pass: false, 
                message: `Expected sum = 5050, got ${state.regs.rax}` 
            };
        }
    },
    
    {
        id: '2.3',
        title: '💣 Stack Buffer Overflow Introduction',
        difficulty: 'intermediate',
        xp: 250,
        skills: ['buffer_overflow', 'stack', 'exploitation'],
        
        description: `
            Your first buffer overflow:
            • Identify vulnerable buffer
            • Calculate offset to return address
            • Overwrite return address
            • Redirect execution flow
        `,
        
        goal: 'Overflow buffer to set WIN flag (RAX = 0x1337)',
        
        vulnerability: 'Buffer[16] but we copy 24 bytes!',
        
        sourceCode: `
void vulnerable() {
    char buffer[16];
    gets(buffer);  // VULNERABLE!
    
    if (overflowed) {
        win();     // Never called normally
    }
}

void win() {
    RAX = 0x1337;  // Success!
}`,
        
        disasm: [
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: '4883ec10', s: 'sub rsp, 0x10' },        // 16 byte buffer
            { a: 0x401008, b: '48c7c018000000', s: 'mov rax, 24' },    // Copy 24 bytes!
            { a: 0x40100f, b: '488945f0', s: 'mov [rbp-0x10], rax' },  // Buffer overflow!
            { a: 0x401013, b: '488b45f8', s: 'mov rax, [rbp-0x8]' },   // Check overflow
            { a: 0x401017, b: '4885c0', s: 'test rax, rax' },
            { a: 0x40101a, b: '7405', s: 'jz 0x401021' },              // Skip win if no overflow
            { a: 0x40101c, b: 'e80a000000', s: 'call 0x40102b' },      // Call win()
            { a: 0x401021, b: '4889ec', s: 'mov rsp, rbp' },
            { a: 0x401024, b: '5d', s: 'pop rbp' },
            { a: 0x401025, b: 'c3', s: 'ret' },
            // Win function
            { a: 0x40102b, b: '48c7c037130000', s: 'mov rax, 0x1337' },
            { a: 0x401032, b: 'c3', s: 'ret' }
        ],
        
        exploitHint: 'The buffer is 16 bytes, but we write 24. This overwrites [rbp-0x8]!',
        
        check: (state) => {
            if (state.regs.rax === 0x1337n) {
                return { 
                    pass: true, 
                    message: '🎯 Buffer overflow successful! You called win()!' 
                };
            }
            return { 
                pass: false, 
                message: 'Overflow the buffer to trigger win function' 
            };
        }
    }
];

// Экспортируем для использования
export default Tier2Enhanced;
