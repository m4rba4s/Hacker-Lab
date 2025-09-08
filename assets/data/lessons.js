/**
 * Lesson Data
 * Contains all the interactive assembly lessons
 */
// Import tier lessons
import { Tier1Lessons } from './lessons_tier1.js';
import { Tier2Lessons } from './lessons_tier2.js';
import { Tier3Lessons } from './lessons_tier3.js';
import { Tier4Lessons } from './lessons_tier4.js';
import { BonusLessons } from './lessons_bonus.js';
import { Module3Lessons } from './lessons_module3.js';

// Original lessons (Module 0 - Tutorial)
const TutorialLessons = [
    // Module 0: Orientation
    {
        id: '0.1',
        title: 'Hello Assembly - First Steps',
        difficulty: 'beginner',
        base: 0x401000,
        goal: 'Step through 3 instructions and watch RIP advance',
        hint: 'Use F10 or "si" command to step through each instruction',
        disasm: [
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rsp: 0x7fffffffdff8n }, stack: [0n] },
            { ip: 2, regs: { rbp: 0x7fffffffdff8n } }
        ],
        bytes: new Uint8Array([0x55, 0x48, 0x89, 0xe5, 0xc3]),
        strings: [],
        check: (state) => state.ipIndex >= 2
    },
    
    {
        id: '0.2',
        title: 'MOV & ADD Basics',
        difficulty: 'beginner',
        base: 0x401000,
        goal: 'Make RAX equal 0x37 using MOV and ADD',
        hint: 'MOV copies values, ADD adds them together',
        sourceCode: `int main() {
    int a = 0x10;  // Load immediate value
    int b = 0x27;  // Load another value
    int result = a + b;  // Add them together
    return result; // Return 0x37
}`,
        compilationInfo: 'gcc -O0 -m64 basic_add.c',
        sourceMapping: [
            {
                sourceLine: 2,
                sourceText: 'int a = 0x10;',
                asmRange: [0, 0],
                explanation: 'Immediate value 0x10 loaded directly into RAX register'
            },
            {
                sourceLine: 3,
                sourceText: 'int b = 0x27;',
                asmRange: [1, 1],
                explanation: 'Immediate value 0x27 loaded into RBX register'
            },
            {
                sourceLine: 4,
                sourceText: 'int result = a + b;',
                asmRange: [2, 2],
                explanation: 'ADD instruction performs RBX + RAX, stores result in RAX'
            },
            {
                sourceLine: 5,
                sourceText: 'return result;',
                asmRange: [3, 3],
                explanation: 'Function returns with result in RAX (standard calling convention)'
            }
        ],
        disasm: [
            { a: 0x401000, b: '48c7c010000000', s: 'mov rax, 0x10' },
            { a: 0x401007, b: '48c7c327000000', s: 'mov rbx, 0x27' },
            { a: 0x40100e, b: '4801d8', s: 'add rax, rbx' },
            { a: 0x401011, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rax: 0n, rbx: 0n } },
            { ip: 1, regs: { rax: 0x10n } },
            { ip: 2, regs: { rbx: 0x27n } },
            { ip: 3, regs: { rax: 0x37n } }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc0, 0x10, 0x00, 0x00, 0x00, 0x48, 0xc7, 0xc3, 0x27, 0x00, 0x00, 0x00, 0x48, 0x01, 0xd8, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 0x37n
    },
    
    {
        id: '0.3',
        title: 'Memory Operations',
        difficulty: 'beginner',
        base: 0x401000,
        goal: 'Store value in memory and read it back',
        hint: '[rbp-0x10] refers to memory at rbp minus 16 bytes',
        disasm: [
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: '48c7c042000000', s: 'mov rax, 0x42' },
            { a: 0x40100b, b: '488945f0', s: 'mov [rbp-0x10], rax' },
            { a: 0x40100f, b: '488b45f0', s: 'mov rax, [rbp-0x10]' },
            { a: 0x401013, b: '5d', s: 'pop rbp' },
            { a: 0x401014, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rsp: 0x7fffffffdff8n, rbp: 0n }, stack: [0n] },
            { ip: 2, regs: { rbp: 0x7fffffffdff8n } },
            { ip: 3, regs: { rax: 0x42n } },
            { ip: 4, regs: { rax: 0x42n } },
            { ip: 5, regs: { rax: 0x42n } },
            { ip: 6, regs: { rbp: 0n, rsp: 0x7fffffffe000n }, stack: [] }
        ],
        bytes: new Uint8Array([0x55, 0x48, 0x89, 0xe5, 0x48, 0xc7, 0xc0, 0x42, 0x00, 0x00, 0x00, 0x48, 0x89, 0x45, 0xf0, 0x48, 0x8b, 0x45, 0xf0, 0x5d, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 0x42n && state.ipIndex >= 5
    },
    
    // Module 1: Control & Data
    {
        id: '1.1',
        title: 'Conditional Jumps',
        difficulty: 'intermediate',
        base: 0x401000,
        goal: 'Take the correct branch to set RAX to 0x42',
        hint: 'CMP sets flags, JZ jumps if the zero flag is set',
        disasm: [
            { a: 0x401000, b: '48c7c005000000', s: 'mov rax, 5' },
            { a: 0x401007, b: '4883f805', s: 'cmp rax, 5' },
            { a: 0x40100b, b: '7505', s: 'jz 0x401012' },
            { a: 0x40100d, b: '48c7c000000000', s: 'mov rax, 0' },
            { a: 0x401014, b: 'c3', s: 'ret' },
            { a: 0x401012, b: '48c7c042000000', s: 'mov rax, 0x42' },
            { a: 0x401019, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rax: 0n }, flags: { zf: 0 } },
            { ip: 1, regs: { rax: 5n } },
            { ip: 2, flags: { zf: 1 } },
            { ip: 5, regs: { rax: 5n } },
            { ip: 6, regs: { rax: 0x42n } }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc0, 0x05, 0x00, 0x00, 0x00, 0x48, 0x83, 0xf8, 0x05, 0x75, 0x05, 0x48, 0xc7, 0xc0, 0x00, 0x00, 0x00, 0x00, 0xc3, 0x48, 0xc7, 0xc0, 0x42, 0x00, 0x00, 0x00, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 0x42n
    },
    
    {
        id: '1.2',
        title: 'Loops with RCX',
        difficulty: 'intermediate',
        base: 0x401000,
        goal: 'Execute the loop until RCX reaches zero',
        hint: 'DEC decrements the counter, JNZ jumps if not zero',
        sourceCode: `int main() {
    int sum = 0;
    int counter = 3;
    
    // Simple loop that adds counter to sum
    while (counter > 0) {
        sum += counter;     // Add current counter value
        counter--;          // Decrement counter
    }
    
    return sum; // Returns 6 (3+2+1)
}`,
        compilationInfo: 'gcc -O1 -m64 loop_demo.c',
        sourceMapping: [
            {
                sourceLine: 2,
                sourceText: 'int counter = 3;',
                asmRange: [0, 0],
                explanation: 'Counter initialized to 3 in RCX register'
            },
            {
                sourceLine: 3,
                sourceText: 'int sum = 0;',
                asmRange: [1, 1],
                explanation: 'Sum variable initialized to 0 in RAX register'
            },
            {
                sourceLine: 6,
                sourceText: 'sum += counter;',
                asmRange: [2, 2],
                explanation: 'ADD instruction: RAX = RAX + RCX (sum += counter)'
            },
            {
                sourceLine: 7,
                sourceText: 'counter--;',
                asmRange: [3, 3],
                explanation: 'DEC decrements RCX by 1 (counter--)'
            },
            {
                sourceLine: 5,
                sourceText: 'while (counter > 0)',
                asmRange: [4, 4],
                explanation: 'JNZ jumps back to loop start if counter is not zero'
            }
        ],
        disasm: [
            { a: 0x401000, b: '48c7c103000000', s: 'mov rcx, 3' },
            { a: 0x401007, b: '48c7c000000000', s: 'mov rax, 0' },
            { a: 0x40100e, b: '4801c8', s: 'add rax, rcx' },
            { a: 0x401011, b: '48ffc9', s: 'dec rcx' },
            { a: 0x401014, b: '75f8', s: 'jnz 0x40100e' },
            { a: 0x401016, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rcx: 0n, rax: 0n } },
            { ip: 1, regs: { rcx: 3n } },
            { ip: 2, regs: { rax: 3n } },
            { ip: 3, regs: { rcx: 2n } },
            { ip: 2, regs: { rax: 5n } },
            { ip: 3, regs: { rcx: 1n } },
            { ip: 2, regs: { rax: 6n } },
            { ip: 3, regs: { rcx: 0n } },
            { ip: 5, regs: { rcx: 0n, rax: 6n } }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc1, 0x03, 0x00, 0x00, 0x00, 0x48, 0xc7, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x48, 0x01, 0xc8, 0x48, 0xff, 0xc9, 0x75, 0xf8, 0xc3]),
        strings: [],
        check: (state) => state.regs.rcx === 0n && state.regs.rax === 6n
    },
    
    {
        id: '1.3',
        title: 'String Length Pattern',
        difficulty: 'intermediate',
        base: 0x401000,
        goal: 'Find the length of the string "demo"',
        hint: 'Loop through bytes until you find a zero (null terminator)',
        sourceCode: `#include <stddef.h>

size_t strlen_demo(const char* str) {
    size_t length = 0;
    
    // Classic strlen implementation
    while (*str != '\0') {
        length++;    // Increment counter
        str++;       // Move to next character
    }
    
    return length;
}

int main() {
    const char* demo = "demo";  // String stored at 0x401000
    return strlen_demo(demo);   // Should return 4
}`,
        compilationInfo: 'gcc -O0 -m64 strlen.c',
        sourceMapping: [
            {
                sourceLine: 16,
                sourceText: 'const char* demo = "demo";',
                asmRange: [0, 0],
                explanation: 'RSI points to string start address (0x401000)'
            },
            {
                sourceLine: 4,
                sourceText: 'size_t length = 0;',
                asmRange: [1, 1],
                explanation: 'Length counter initialized to 0 in RCX'
            },
            {
                sourceLine: 7,
                sourceText: 'while (*str != \'\\0\') {',
                asmRange: [2, 4],
                explanation: 'Load byte from [RSI+RCX], test if zero (null terminator)'
            },
            {
                sourceLine: 8,
                sourceText: 'length++;',
                asmRange: [5, 5],
                explanation: 'Increment RCX (length counter)'
            },
            {
                sourceLine: 6,
                sourceText: '// Loop condition',
                asmRange: [6, 6],
                explanation: 'Jump back to loop start if character was not zero'
            }
        ],
        disasm: [
            { a: 0x401000, b: '48c7c600104000', s: 'mov rsi, 0x401000' },
            { a: 0x401007, b: '48c7c100000000', s: 'mov rcx, 0' },
            { a: 0x40100e, b: '8a0431', s: 'mov al, [rsi+rcx]' },
            { a: 0x401011, b: '84c0', s: 'test al, al' },
            { a: 0x401013, b: '7404', s: 'jz 0x401019' },
            { a: 0x401015, b: '48ffc1', s: 'inc rcx' },
            { a: 0x401018, b: 'ebf4', s: 'jmp 0x40100e' },
            { a: 0x40101a, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rsi: 0n, rcx: 0n } },
            { ip: 1, regs: { rsi: 0x401000n } },
            { ip: 2, regs: { rax: 0x64n } }, // 'd'
            { ip: 3, flags: { zf: 0 } },
            { ip: 5, regs: { rcx: 1n } },
            { ip: 2, regs: { rax: 0x65n } }, // 'e'
            { ip: 3, flags: { zf: 0 } },
            { ip: 5, regs: { rcx: 2n } },
            { ip: 2, regs: { rax: 0x6dn } }, // 'm'
            { ip: 3, flags: { zf: 0 } },
            { ip: 5, regs: { rcx: 3n } },
            { ip: 2, regs: { rax: 0x6fn } }, // 'o'
            { ip: 3, flags: { zf: 0 } },
            { ip: 5, regs: { rcx: 4n } },
            { ip: 2, regs: { rax: 0n } }, // null
            { ip: 3, flags: { zf: 1 } },
            { ip: 7, regs: { rcx: 4n } }
        ],
        bytes: new Uint8Array([0x64, 0x65, 0x6d, 0x6f, 0x00, 0x48, 0xc7, 0xc6, 0x00, 0x10, 0x40, 0x00, 0x48, 0xc7, 0xc1, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x04, 0x31, 0x84, 0xc0, 0x74, 0x04, 0x48, 0xff, 0xc1, 0xeb, 0xf4, 0xc3]),
        strings: ['demo'],
        check: (state) => state.regs.rcx === 4n
    },
    
    // Module 2: Advanced
    {
        id: '2.1',
        title: 'Function Calling',
        difficulty: 'advanced',
        base: 0x401000,
        goal: 'Call a function and return the result',
        hint: 'CALL pushes return address, RET pops it back',
        disasm: [
            { a: 0x401000, b: '48c7c705000000', s: 'mov rdi, 5' },
            { a: 0x401007, b: '48c7c603000000', s: 'mov rsi, 3' },
            { a: 0x40100e, b: 'e805000000', s: 'call 0x401018' },
            { a: 0x401013, b: 'c3', s: 'ret' },
            { a: 0x401018, b: '4889f8', s: 'mov rax, rdi' },
            { a: 0x40101b, b: '4801f0', s: 'add rax, rsi' },
            { a: 0x40101e, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rdi: 0n, rsi: 0n, rax: 0n, rsp: 0x7fffffffe000n } },
            { ip: 1, regs: { rdi: 5n } },
            { ip: 2, regs: { rsi: 3n } },
            { ip: 4, regs: { rsp: 0x7fffffffdff8n }, stack: [0x401013n] },
            { ip: 5, regs: { rax: 5n } },
            { ip: 6, regs: { rax: 8n } },
            { ip: 3, regs: { rsp: 0x7fffffffe000n }, stack: [] }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc7, 0x05, 0x00, 0x00, 0x00, 0x48, 0xc7, 0xc6, 0x03, 0x00, 0x00, 0x00, 0xe8, 0x05, 0x00, 0x00, 0x00, 0xc3, 0x48, 0x89, 0xf8, 0x48, 0x01, 0xf0, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 8n
    },
    
    {
        id: '2.2',
        title: 'Stack Manipulation',
        difficulty: 'advanced',
        base: 0x401000,
        goal: 'Push values and pop them in reverse order',
        hint: 'Stack is LIFO - Last In, First Out',
        disasm: [
            { a: 0x401000, b: '48c7c001000000', s: 'mov rax, 1' },
            { a: 0x401007, b: '50', s: 'push rax' },
            { a: 0x401008, b: '48c7c002000000', s: 'mov rax, 2' },
            { a: 0x40100f, b: '50', s: 'push rax' },
            { a: 0x401010, b: '48c7c003000000', s: 'mov rax, 3' },
            { a: 0x401017, b: '50', s: 'push rax' },
            { a: 0x401018, b: '58', s: 'pop rax' },
            { a: 0x401019, b: '5b', s: 'pop rbx' },
            { a: 0x40101a, b: '59', s: 'pop rcx' },
            { a: 0x40101b, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rax: 0n, rsp: 0x7fffffffe000n }, stack: [] },
            { ip: 1, regs: { rax: 1n } },
            { ip: 2, regs: { rsp: 0x7fffffffdff8n }, stack: [1n] },
            { ip: 3, regs: { rax: 2n } },
            { ip: 4, regs: { rsp: 0x7fffffffdff0n }, stack: [1n, 2n] },
            { ip: 5, regs: { rax: 3n } },
            { ip: 6, regs: { rsp: 0x7fffffffdfe8n }, stack: [1n, 2n, 3n] },
            { ip: 7, regs: { rax: 3n, rsp: 0x7fffffffdff0n }, stack: [1n, 2n] },
            { ip: 8, regs: { rbx: 2n, rsp: 0x7fffffffdff8n }, stack: [1n] },
            { ip: 9, regs: { rcx: 1n, rsp: 0x7fffffffe000n }, stack: [] }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc0, 0x01, 0x00, 0x00, 0x00, 0x50, 0x48, 0xc7, 0xc0, 0x02, 0x00, 0x00, 0x00, 0x50, 0x48, 0xc7, 0xc0, 0x03, 0x00, 0x00, 0x00, 0x50, 0x58, 0x5b, 0x59, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 3n && state.regs.rbx === 2n && state.regs.rcx === 1n
    },
    
    {
        id: '2.7', // <--- RENAMED FROM 2.3 to avoid conflict
        title: 'Simple XOR Cipher',
        difficulty: 'advanced',
        base: 0x401000,
        goal: 'XOR the value with key 0x13 to get 0x42',
        hint: 'XOR is reversible: A XOR B XOR B = A',
        disasm: [
            { a: 0x401000, b: '48c7c051000000', s: 'mov rax, 0x51' },
            { a: 0x401007, b: '48c7c313000000', s: 'mov rbx, 0x13' },
            { a: 0x40100e, b: '4831d8', s: 'xor rax, rbx' },
            { a: 0x401011, b: '4883f842', s: 'cmp rax, 0x42' },
            { a: 0x401015, b: '7405', s: 'jz 0x40101c' },
            { a: 0x401017, b: '48c7c000000000', s: 'mov rax, 0' },
            { a: 0x40101e, b: 'c3', s: 'ret' },
            { a: 0x40101c, b: '48c7c001000000', s: 'mov rax, 1' },
            { a: 0x401023, b: 'c3', s: 'ret' }
        ],
        trace: [
            { ip: 0, regs: { rax: 0n, rbx: 0n }, flags: { zf: 0 } },
            { ip: 1, regs: { rax: 0x51n } },
            { ip: 2, regs: { rbx: 0x13n } },
            { ip: 3, regs: { rax: 0x42n } },
            { ip: 4, flags: { zf: 1 } },
            { ip: 7, regs: { rax: 0x42n } },
            { ip: 8, regs: { rax: 1n } }
        ],
        bytes: new Uint8Array([0x48, 0xc7, 0xc0, 0x51, 0x00, 0x00, 0x00, 0x48, 0xc7, 0xc3, 0x13, 0x00, 0x00, 0x00, 0x48, 0x31, 0xd8, 0x48, 0x83, 0xf8, 0x42, 0x75, 0x05, 0x48, 0xc7, 0xc0, 0x00, 0x00, 0x00, 0x00, 0xc3, 0x48, 0xc7, 0xc0, 0x01, 0x00, 0x00, 0x00, 0xc3]),
        strings: [],
        check: (state) => state.regs.rax === 1n
    }
];

// Combine all lessons
export const Lessons = [
    ...TutorialLessons,
    ...Module3Lessons,
    ...Tier1Lessons,
    ...Tier2Lessons,
    ...Tier3Lessons,
    ...Tier4Lessons,
    ...BonusLessons
];