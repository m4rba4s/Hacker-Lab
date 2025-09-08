/**
 * Comprehensive Reverse Engineering Lessons
 * Theory, examples, and practical exercises
 */

export const FULL_LESSONS = {
    "hello_world": {
        title: "Hello World Analysis",
        difficulty: "beginner",
        theory: `
            <h2>🎯 Introduction to Reverse Engineering</h2>
            
            <h3>What is Reverse Engineering?</h3>
            <p>Reverse Engineering (RE) is the process of analyzing a finished program to understand how it works without access to source code.</p>
            
            <h3>Essential Tools:</h3>
            <ul>
                <li><b>Disassembler</b> - converts machine code to assembly (IDA Pro, Ghidra, x64dbg)</li>
                <li><b>Debugger</b> - allows step-by-step program execution (GDB, x64dbg, WinDbg)</li>
                <li><b>Hex Editor</b> - for viewing and editing binary data</li>
                <li><b>Decompiler</b> - attempts to recover high-level code</li>
            </ul>
            
            <h3>Basic Assembly Example:</h3>
            <pre class="code-block">
section .data
    msg db 'Hello, World!', 0xa
    len equ $ - msg
    
section .text
    global _start
    
_start:
    mov rax, 1      ; write syscall
    mov rdi, 1      ; stdout
    mov rsi, msg    ; string address
    mov rdx, len    ; length
    syscall
    
    mov rax, 60     ; exit syscall
    xor rdi, rdi    ; return code 0
    syscall
            </pre>
        `,
        practice: `
            <h3>📝 Practical Assignment</h3>
            
            <ol>
                <li>Find the program entry point</li>
                <li>Identify output string</li>
                <li>Locate system calls</li>
                <li>Modify the output message</li>
            </ol>
        `,
        solution: `
            <h3>✅ Solution</h3>
            <p>Entry point at 0x401000, string in .rodata section, syscall instructions for write/exit.</p>
        `,
        tips: [
            "Use 'strings' command for quick string discovery",
            "F9 to run until breakpoint in x64dbg",
            "G key for jumping to specific address"
        ]
    },

    "variables": {
        title: "Understanding Variables",
        difficulty: "beginner",
        theory: `
            <h2>🔢 Variables in Memory</h2>
            
            <h3>Variable Storage Types:</h3>
            <table class="data-table">
                <tr><th>Type</th><th>Location</th><th>Lifetime</th></tr>
                <tr><td>Local</td><td>Stack</td><td>Function scope</td></tr>
                <tr><td>Global</td><td>.data/.bss</td><td>Program lifetime</td></tr>
                <tr><td>Dynamic</td><td>Heap</td><td>Until free()</td></tr>
            </table>
            
            <h3>Stack Variables Example:</h3>
            <pre class="code-block">
push rbp           ; save base pointer
mov rbp, rsp       ; establish frame
sub rsp, 0x20      ; allocate space

mov dword [rbp-0x4], 10   ; int a = 10
mov dword [rbp-0x8], 20   ; int b = 20
            </pre>
        `,
        practice: `<h3>📝 Practice</h3><p>Identify variable locations in disassembly.</p>`,
        solution: `<h3>✅ Solution</h3><p>Stack vars at [rbp-offset], globals at fixed addresses.</p>`,
        tips: ["Watch stack pointer changes", "Use data breakpoints for tracking"]
    },

    "control_flow": {
        title: "Control Flow Analysis", 
        difficulty: "intermediate",
        theory: `
            <h2>🔄 Control Flow Structures</h2>
            
            <h3>Conditional Jumps:</h3>
            <pre class="code-block">
cmp eax, 0     ; compare
je  label      ; jump if equal
jne label      ; jump if not equal
jg  label      ; jump if greater
            </pre>
            
            <h3>Loop Example:</h3>
            <pre class="code-block">
mov eax, 0          ; counter = 0
loop_start:
    cmp eax, 10     ; compare with limit
    jge loop_end    ; exit if >= 10
    inc eax         ; increment
    jmp loop_start  ; continue
loop_end:
            </pre>
        `,
        practice: `<h3>📝 Practice</h3><p>Identify loop types and conditions.</p>`,
        solution: `<h3>✅ Solution</h3><p>Look for compare-jump patterns.</p>`,
        tips: ["Follow jump arrows", "Use control flow graphs"]
    }
};

// Export for UI usage
window.FULL_LESSONS = FULL_LESSONS;
