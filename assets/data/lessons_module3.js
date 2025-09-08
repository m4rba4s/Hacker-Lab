/**
 * 🎯 MODULE 3: REAL WORLD EXPLOITATION
 * Advanced Buffer Overflow & ROP Techniques
 * ret2 systems killer pack! 💀
 */

export const Module3Lessons = [
    // ========== 3.1: ROP BASICS ==========
    {
        id: '3.1',
        title: '⛓️ Return-Oriented Programming Basics',
        difficulty: 'expert',
        base: 0x401000,
        goal: 'Build your first ROP chain to bypass NX/DEP',
        hint: 'Chain together code gadgets ending in RET to execute without injecting new code',
        sourceCode: `// Vulnerable function with NX enabled
#include <string.h>
#include <unistd.h>

void vulnerable_function() {
    char buffer[64];
    
    // No bounds checking - classic overflow
    read(0, buffer, 200);  // Can read 200 bytes into 64-byte buffer!
    
    printf("Echo: %s\\n", buffer);
}

// Available gadgets in the binary:
// 0x401234: pop rdi; ret
// 0x401245: pop rsi; ret  
// 0x401256: pop rdx; ret
// 0x401267: syscall; ret
// 0x401278: "/bin/sh" string

int main() {
    vulnerable_function();
    return 0;
}`,
        compilationInfo: 'gcc -fno-stack-protector -z execstack vulnerable.c -o vuln',
        sourceMapping: [
            {
                sourceLine: 6,
                sourceText: 'read(0, buffer, 200);',
                asmRange: [3, 5], 
                explanation: 'Buffer overflow: reading 200 bytes into 64-byte buffer allows stack corruption'
            }
        ],
        disasm: [
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: '4883ec40', s: 'sub rsp, 0x40' }, // 64-byte buffer
            { a: 0x401008, b: '488d45c0', s: 'lea rax, [rbp-0x40]' }, // buffer address
            { a: 0x40100c, b: '4889c6', s: 'mov rsi, rax' }, // buffer as 2nd arg
            { a: 0x40100f, b: 'ba c8000000', s: 'mov edx, 200' }, // 200 bytes! 
            { a: 0x401014, b: 'bf00000000', s: 'mov edi, 0' }, // stdin
            { a: 0x401019, b: 'e800000000', s: 'call read' }, // VULNERABILITY!
            { a: 0x40101e, b: 'c9', s: 'leave' },
            { a: 0x40101f, b: 'c3', s: 'ret' }, // Return address can be controlled!
            
            // Available ROP gadgets
            { a: 0x401234, b: '5f', s: 'pop rdi' },
            { a: 0x401235, b: 'c3', s: 'ret' },
            { a: 0x401245, b: '5e', s: 'pop rsi' },
            { a: 0x401246, b: 'c3', s: 'ret' },
            { a: 0x401256, b: '5a', s: 'pop rdx' },
            { a: 0x401257, b: 'c3', s: 'ret' },
            { a: 0x401267, b: '0f05', s: 'syscall' },
            { a: 0x401269, b: 'c3', s: 'ret' }
        ],
        trace: [
            // Initial state
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rsp: 0x7fffffffdff8n, rbp: 0n }, stack: [0n] },
            { ip: 2, regs: { rbp: 0x7fffffffdff8n } },
            { ip: 3, regs: { rsp: 0x7fffffffdfb8n } }, // Stack space for buffer
            
            // Buffer overflow simulation - ROP chain execution
            { ip: 10, regs: { rdi: 0x401278n } }, // pop rdi (points to "/bin/sh")
            { ip: 12, regs: { rsi: 0n } }, // pop rsi (NULL for argv)  
            { ip: 14, regs: { rdx: 0n } }, // pop rdx (NULL for envp)
            { ip: 15, regs: { rax: 59n } }, // execve syscall number
            // Syscall execve("/bin/sh", NULL, NULL) would execute here
        ],
        bytes: new Uint8Array([
            0x55, 0x48, 0x89, 0xe5, 0x48, 0x83, 0xec, 0x40,
            0x48, 0x8d, 0x45, 0xc0, 0x48, 0x89, 0xc6, 
            0xba, 0xc8, 0x00, 0x00, 0x00, 0xbf, 0x00, 0x00, 0x00, 0x00,
            0xe8, 0x00, 0x00, 0x00, 0x00, 0xc9, 0xc3,
            // ROP gadgets
            0x5f, 0xc3,  // pop rdi; ret
            0x5e, 0xc3,  // pop rsi; ret
            0x5a, 0xc3,  // pop rdx; ret
            0x0f, 0x05, 0xc3  // syscall; ret
        ]),
        strings: [
            '/bin/sh',
            'ROP chain activated!',
            'DEP/NX bypassed',
            'pop rdi; ret',
            'syscall; ret'
        ],
        cfg: {
            nodes: [
                { id: 'start', label: 'vulnerable_function', addr: 0x401000 },
                { id: 'overflow', label: 'Buffer Overflow', addr: 0x401019 },
                { id: 'rop1', label: 'pop rdi; ret', addr: 0x401234 },
                { id: 'rop2', label: 'pop rsi; ret', addr: 0x401245 },
                { id: 'rop3', label: 'pop rdx; ret', addr: 0x401256 },
                { id: 'rop4', label: 'syscall; ret', addr: 0x401267 },
                { id: 'pwned', label: 'Shell Execution!', addr: 0x0 }
            ],
            edges: [
                { from: 'start', to: 'overflow' },
                { from: 'overflow', to: 'rop1', label: 'ROP Chain' },
                { from: 'rop1', to: 'rop2' },
                { from: 'rop2', to: 'rop3' },
                { from: 'rop3', to: 'rop4' },
                { from: 'rop4', to: 'pwned', label: 'execve()' }
            ]
        },
        check: (state) => state.regs.rax === 59n && state.regs.rdi === 0x401278n
    },

    // ========== 3.2: ret2libc ATTACK ==========
    {
        id: '3.2', 
        title: '📚 ret2libc Attack Vector',
        difficulty: 'expert',
        base: 0x401000,
        goal: 'Execute system("/bin/sh") via ret2libc without shellcode',
        hint: 'Return to library functions instead of injected code - bypass NX protection',
        sourceCode: `// ret2libc target - no shellcode needed!
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void vulnerable() {
    char buffer[128];
    printf("Enter command: ");
    
    // Classic gets() vulnerability  
    gets(buffer);  // NEVER use gets()!
    
    printf("You entered: %s\\n", buffer);
}

// Functions available in libc:
// system() at 0x7ffff7a52390
// exit() at 0x7ffff7a05630  
// "/bin/sh" string at 0x7ffff7b99d57

int main() {
    vulnerable();
    return 0;
}`,
        compilationInfo: 'gcc -fno-stack-protector -no-pie vulnerable.c -o ret2libc',
        sourceMapping: [
            {
                sourceLine: 8,
                sourceText: 'gets(buffer);',
                asmRange: [4, 4],
                explanation: 'gets() has no bounds checking - classic overflow vector for ret2libc'
            }
        ],
        disasm: [
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: '4881ec90000000', s: 'sub rsp, 0x90' }, // 144 bytes local space
            { a: 0x40100b, b: '488d8570ffffff', s: 'lea rax, [rbp-0x90]' }, // buffer 
            { a: 0x401012, b: '4889c7', s: 'mov rdi, rax' }, // buffer as argument
            { a: 0x401015, b: 'e800000000', s: 'call gets' }, // VULNERABILITY!
            { a: 0x40101a, b: 'c9', s: 'leave' },
            { a: 0x40101b, b: 'c3', s: 'ret' }, // Controlled return address
            
            // ret2libc gadgets (simulated libc addresses)
            { a: 0x7ffff7a52390, b: '', s: 'system' }, // system() function
            { a: 0x7ffff7a05630, b: '', s: 'exit' }, // exit() function  
            { a: 0x7ffff7b99d57, b: '', s: '"/bin/sh"' } // shell string
        ],
        trace: [
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rsp: 0x7fffffffdff8n }, stack: [0n] },
            { ip: 2, regs: { rbp: 0x7fffffffdff8n } },
            { ip: 3, regs: { rsp: 0x7fffffffdf68n } }, // Stack space (144 bytes)
            
            // Overflow simulation - ret2libc chain
            { ip: 6, regs: { rsp: 0x7fffffffdff8n } }, // leave instruction
            // ret2libc payload execution:
            // 1. Return to system()
            // 2. system() reads "/bin/sh" from stack  
            // 3. Executes shell
            { ip: 7, regs: { rdi: 0x7ffff7b99d57n, rip: 0x7ffff7a52390n } } // system("/bin/sh")
        ],
        bytes: new Uint8Array([
            0x55, 0x48, 0x89, 0xe5, 0x48, 0x81, 0xec, 0x90, 0x00, 0x00, 0x00,
            0x48, 0x8d, 0x85, 0x70, 0xff, 0xff, 0xff, 0x48, 0x89, 0xc7,
            0xe8, 0x00, 0x00, 0x00, 0x00, 0xc9, 0xc3
        ]),
        strings: [
            'Enter command: ',
            'You entered: ',
            '/bin/sh',
            'system',
            'ret2libc attack!',
            'No shellcode needed'
        ],
        cfg: {
            nodes: [
                { id: 'main', label: 'main()', addr: 0x400800 },
                { id: 'vuln', label: 'vulnerable()', addr: 0x401000 },
                { id: 'gets', label: 'gets() overflow', addr: 0x401015 },
                { id: 'system', label: 'system()', addr: 0x7ffff7a52390 },
                { id: 'shell', label: '/bin/sh execution', addr: 0x0 }
            ],
            edges: [
                { from: 'main', to: 'vuln' },
                { from: 'vuln', to: 'gets' },
                { from: 'gets', to: 'system', label: 'ret2libc' },
                { from: 'system', to: 'shell', label: 'execve' }
            ]
        },
        check: (state) => state.regs.rdi === 0x7ffff7b99d57n && state.regs.rip === 0x7ffff7a52390n
    },

    // ========== 3.3: ASLR BYPASS ==========
    {
        id: '3.3',
        title: '🎭 ASLR Bypass Techniques', 
        difficulty: 'expert',
        base: 0x401000,
        goal: 'Defeat Address Space Layout Randomization',
        hint: 'Leak addresses first, then build ROP chain with real addresses',
        sourceCode: `// ASLR bypass demonstration
#include <stdio.h>
#include <unistd.h>

void leak_addresses() {
    // Information leak vulnerability
    printf("Stack leak: %p\\n", __builtin_frame_address(0));
    printf("Libc leak: %p\\n", printf);
    printf("Code leak: %p\\n", leak_addresses);
}

void vulnerable() {
    char buffer[64];
    
    // First, leak addresses  
    leak_addresses();
    
    // Then exploit with known addresses
    printf("Enter payload: ");
    read(0, buffer, 200); // Buffer overflow with leaked addresses
}

int main() {
    // ASLR is enabled, but we defeat it!
    vulnerable();
    return 0;
}`,
        compilationInfo: 'gcc -fPIE -fstack-protector-strong vulnerable.c -o aslr_bypass',
        sourceMapping: [
            {
                sourceLine: 8,
                sourceText: 'printf("Stack leak: %p\\n", __builtin_frame_address(0));',
                asmRange: [5, 7],
                explanation: 'Information leak reveals stack address - defeats stack ASLR'
            },
            {
                sourceLine: 9, 
                sourceText: 'printf("Libc leak: %p\\n", printf);',
                asmRange: [8, 10],
                explanation: 'Function pointer leak reveals libc base - defeats libc ASLR'
            }
        ],
        disasm: [
            // leak_addresses function
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            
            // Stack address leak
            { a: 0x401004, b: '4889e6', s: 'mov rsi, rbp' }, // Stack pointer
            { a: 0x401007, b: '488d3d00000000', s: 'lea rdi, [format_str]' },
            { a: 0x40100e, b: 'e800000000', s: 'call printf' }, // Leak stack!
            
            // Libc address leak  
            { a: 0x401013, b: '488d3500000000', s: 'lea rsi, [printf]' }, // printf address
            { a: 0x40101a, b: '488d3d00000000', s: 'lea rdi, [format_str2]' },
            { a: 0x401021, b: 'e800000000', s: 'call printf' }, // Leak libc!
            
            // Code address leak
            { a: 0x401026, b: '488d3500000000', s: 'lea rsi, [leak_addresses]' },
            { a: 0x40102d, b: '488d3d00000000', s: 'lea rdi, [format_str3]' },
            { a: 0x401034, b: 'e800000000', s: 'call printf' }, // Leak code!
            
            { a: 0x401039, b: '5d', s: 'pop rbp' },
            { a: 0x40103a, b: 'c3', s: 'ret' },
            
            // vulnerable function  
            { a: 0x401040, b: '55', s: 'push rbp' },
            { a: 0x401041, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401044, b: '4883ec40', s: 'sub rsp, 0x40' },
            { a: 0x401048, b: 'e8b3ffffff', s: 'call leak_addresses' },
            { a: 0x40104d, b: '488d45c0', s: 'lea rax, [rbp-0x40]' },
            { a: 0x401051, b: '4889c6', s: 'mov rsi, rax' },
            { a: 0x401054, b: 'bac8000000', s: 'mov edx, 200' }, // Overflow!
            { a: 0x401059, b: 'bf00000000', s: 'mov edi, 0' },
            { a: 0x40105e, b: 'e800000000', s: 'call read' },
            { a: 0x401063, b: 'c9', s: 'leave' },
            { a: 0x401064, b: 'c3', s: 'ret' }
        ],
        trace: [
            // Initial execution
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rbp: 0x7fffffffe000n } },
            
            // Address leaks
            { ip: 2, regs: { rsi: 0x7fffffffe000n } }, // Stack address leaked
            { ip: 5, leaked_stack: 0x7fffffffe000n },
            
            { ip: 6, regs: { rsi: 0x7ffff7a52390n } }, // printf address leaked  
            { ip: 9, leaked_libc: 0x7ffff7a52390n },
            
            { ip: 10, regs: { rsi: 0x401000n } }, // Code address leaked
            { ip: 13, leaked_code: 0x401000n },
            
            // Now attacker knows all addresses for ROP chain!
            { ip: 20, aslr_defeated: true }
        ],
        bytes: new Uint8Array([
            // leak_addresses
            0x55, 0x48, 0x89, 0xe5, 0x48, 0x89, 0xe6,
            0x48, 0x8d, 0x3d, 0x00, 0x00, 0x00, 0x00,
            0xe8, 0x00, 0x00, 0x00, 0x00,
            // More leak code...
            0x5d, 0xc3,
            
            // vulnerable  
            0x55, 0x48, 0x89, 0xe5, 0x48, 0x83, 0xec, 0x40,
            0xe8, 0xb3, 0xff, 0xff, 0xff,
            0x48, 0x8d, 0x45, 0xc0, 0x48, 0x89, 0xc6,
            0xba, 0xc8, 0x00, 0x00, 0x00, 0xbf, 0x00, 0x00, 0x00, 0x00,
            0xe8, 0x00, 0x00, 0x00, 0x00, 0xc9, 0xc3
        ]),
        strings: [
            'Stack leak: %p',
            'Libc leak: %p', 
            'Code leak: %p',
            'Enter payload: ',
            'ASLR bypassed!',
            'Addresses leaked successfully'
        ],
        cfg: {
            nodes: [
                { id: 'main', label: 'main()', addr: 0x401100 },
                { id: 'vuln', label: 'vulnerable()', addr: 0x401040 },
                { id: 'leak', label: 'leak_addresses()', addr: 0x401000 },
                { id: 'stack_leak', label: 'Stack Address Leak', addr: 0x401007 },
                { id: 'libc_leak', label: 'Libc Address Leak', addr: 0x401021 },
                { id: 'overflow', label: 'Buffer Overflow', addr: 0x40105e },
                { id: 'rop', label: 'ROP with Known Addresses', addr: 0x0 }
            ],
            edges: [
                { from: 'main', to: 'vuln' },
                { from: 'vuln', to: 'leak' },
                { from: 'leak', to: 'stack_leak' },
                { from: 'leak', to: 'libc_leak' },
                { from: 'vuln', to: 'overflow' },
                { from: 'overflow', to: 'rop', label: 'ASLR Defeated' }
            ]
        },
        check: (state) => state.leaked_stack && state.leaked_libc && state.aslr_defeated
    },

    // ========== 3.4: STACK PIVOT & CHAIN ==========
    {
        id: '3.4',
        title: '🌀 Stack Pivot & Advanced ROP Chains',
        difficulty: 'expert', 
        base: 0x401000,
        goal: 'Master stack pivoting and complex ROP chain construction',
        hint: 'When stack space is limited, pivot to a controlled memory region',
        sourceCode: `// Advanced ROP: Stack pivoting scenario
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char global_buffer[1024];  // Controlled memory region

void tiny_overflow() {
    char small_buffer[16];   // Very small buffer
    
    // Tiny overflow - only enough to control RIP
    read(0, small_buffer, 32);  // 16 byte overflow
    
    // Not enough space for full ROP chain!
    // Solution: Stack pivot to global_buffer
}

void setup_rop_data() {
    // Attacker controls this global buffer
    printf("ROP data at: %p\\n", global_buffer);
    
    // In real attack, this would be filled via another vulnerability
    strcpy(global_buffer, "ROPCHAIN_PLACEHOLDER");
}

int main() {
    setup_rop_data();
    tiny_overflow();
    return 0; 
}`,
        compilationInfo: 'gcc -fno-stack-protector -z norelro vulnerable.c -o stack_pivot',
        sourceMapping: [
            {
                sourceLine: 9,
                sourceText: 'read(0, small_buffer, 32);',
                asmRange: [3, 5],
                explanation: 'Small buffer overflow - only controls return address, not enough space for ROP chain'
            },
            {
                sourceLine: 16,
                sourceText: 'printf("ROP data at: %p\\n", global_buffer);',
                asmRange: [10, 12], 
                explanation: 'Leak global buffer address for stack pivot target'
            }
        ],
        disasm: [
            // tiny_overflow function
            { a: 0x401000, b: '55', s: 'push rbp' },
            { a: 0x401001, b: '4889e5', s: 'mov rbp, rsp' },
            { a: 0x401004, b: '4883ec10', s: 'sub rsp, 0x10' }, // Only 16 bytes!
            { a: 0x401008, b: '488d45f0', s: 'lea rax, [rbp-0x10]' },
            { a: 0x40100c, b: '4889c6', s: 'mov rsi, rax' },
            { a: 0x40100f, b: 'ba20000000', s: 'mov edx, 32' }, // 32-16=16 overflow
            { a: 0x401014, b: 'bf00000000', s: 'mov edi, 0' },
            { a: 0x401019, b: 'e800000000', s: 'call read' }, 
            { a: 0x40101e, b: 'c9', s: 'leave' },
            { a: 0x40101f, b: 'c3', s: 'ret' }, // Only this address controllable!
            
            // Stack pivot gadgets
            { a: 0x401100, b: '5c', s: 'pop rsp' }, // Stack pivot gadget
            { a: 0x401101, b: 'c3', s: 'ret' },
            
            { a: 0x401110, b: '4889e0', s: 'mov rax, rsp' }, // Stack manipulation
            { a: 0x401113, b: '4883c008', s: 'add rax, 8' },
            { a: 0x401117, b: '4889c4', s: 'mov rsp, rax' },
            { a: 0x40111a, b: 'c3', s: 'ret' },
            
            // Full ROP chain gadgets (available after pivot)
            { a: 0x401200, b: '5f', s: 'pop rdi' },
            { a: 0x401201, b: 'c3', s: 'ret' },
            { a: 0x401210, b: '5e', s: 'pop rsi' },
            { a: 0x401211, b: 'c3', s: 'ret' },
            { a: 0x401220, b: '5a', s: 'pop rdx' },
            { a: 0x401221, b: 'c3', s: 'ret' },
            { a: 0x401230, b: '58', s: 'pop rax' },
            { a: 0x401231, b: 'c3', s: 'ret' },
            { a: 0x401240, b: '0f05', s: 'syscall' },
            { a: 0x401242, b: 'c3', s: 'ret' }
        ],
        trace: [
            // Initial tiny overflow
            { ip: 0, regs: { rsp: 0x7fffffffe000n, rbp: 0n } },
            { ip: 1, regs: { rbp: 0x7fffffffe000n } },
            { ip: 2, regs: { rsp: 0x7fffffffdfF0n } }, // Small stack frame
            
            // Buffer overflow with limited space
            { ip: 7, buffer_overflow: true, controlled_bytes: 16 },
            
            // Stack pivot execution
            { ip: 8, regs: { rsp: 0x601000n } }, // Pivot to global_buffer
            
            // Now we have full control over ROP chain in global memory
            { ip: 16, regs: { rdi: 0x601100n } }, // "/bin/sh" from global buffer
            { ip: 18, regs: { rsi: 0n } }, // NULL argv
            { ip: 20, regs: { rdx: 0n } }, // NULL envp
            { ip: 22, regs: { rax: 59n } }, // execve syscall
            // Full ROP chain executed successfully!
        ],
        bytes: new Uint8Array([
            // tiny_overflow
            0x55, 0x48, 0x89, 0xe5, 0x48, 0x83, 0xec, 0x10,
            0x48, 0x8d, 0x45, 0xf0, 0x48, 0x89, 0xc6,
            0xba, 0x20, 0x00, 0x00, 0x00, 0xbf, 0x00, 0x00, 0x00, 0x00,
            0xe8, 0x00, 0x00, 0x00, 0x00, 0xc9, 0xc3,
            
            // Stack pivot gadgets
            0x5c, 0xc3,  // pop rsp; ret
            0x48, 0x89, 0xe0, 0x48, 0x83, 0xc0, 0x08, 0x48, 0x89, 0xc4, 0xc3,
            
            // ROP gadgets
            0x5f, 0xc3,  // pop rdi; ret
            0x5e, 0xc3,  // pop rsi; ret  
            0x5a, 0xc3,  // pop rdx; ret
            0x58, 0xc3,  // pop rax; ret
            0x0f, 0x05, 0xc3  // syscall; ret
        ]),
        strings: [
            'ROP data at: %p',
            'ROPCHAIN_PLACEHOLDER',
            'Stack pivot successful!',
            'pop rsp; ret',
            'Advanced ROP chain',
            'Global buffer control'
        ],
        cfg: {
            nodes: [
                { id: 'main', label: 'main()', addr: 0x400900 },
                { id: 'setup', label: 'setup_rop_data()', addr: 0x400800 },
                { id: 'tiny', label: 'tiny_overflow()', addr: 0x401000 },
                { id: 'overflow', label: 'Small Overflow', addr: 0x401019 },
                { id: 'pivot', label: 'Stack Pivot', addr: 0x401100 },
                { id: 'global', label: 'Global Buffer', addr: 0x601000 },
                { id: 'rop_chain', label: 'Full ROP Chain', addr: 0x601008 },
                { id: 'syscall', label: 'execve()', addr: 0x401240 }
            ],
            edges: [
                { from: 'main', to: 'setup' },
                { from: 'main', to: 'tiny' },
                { from: 'tiny', to: 'overflow' },
                { from: 'overflow', to: 'pivot', label: 'Limited Space' },
                { from: 'pivot', to: 'global', label: 'RSP = global_buffer' },
                { from: 'global', to: 'rop_chain' },
                { from: 'rop_chain', to: 'syscall', label: 'Unlimited ROP' }
            ]
        },
        check: (state) => state.regs.rsp === 0x601000n && state.regs.rax === 59n
    }
];
