/**
 * 🎓 TIER 1: FOUNDATION LESSONS (Levels 1-5)
 * From Script Kiddie to Padawan
 */

export const Tier1Lessons = [
    // ========== LEVEL 1: BINARY BASICS ==========
    {
        id: '1.1',
        title: '🔢 Binary & Hex Fundamentals',
        desc: 'Master number systems like a true hacker',
        level: 1,
        xp: 100,
        skills: ['binary', 'hex', 'conversion'],
        content: `
# Binary & Hex: The Language of Machines 💻

Welcome to the machine realm! Before we hack, we must speak their language.

## Why Binary Matters
Computers only understand 0s and 1s. Every exploit, every hack, every piece of data - it's all binary underneath.

## Your Mission
Convert between decimal, binary, and hexadecimal. This is your first step to thinking like a computer.

### Quick Reference:
- **Decimal**: 0-9 (human counting)
- **Binary**: 0-1 (machine language)  
- **Hex**: 0-F (hacker's shorthand)

Example: 42 (dec) = 0b101010 (bin) = 0x2A (hex)
`,
        code: `
section .text
global _start

_start:
    ; Your first hex values!
    mov rax, 0x42      ; Load hex 42 (decimal 66)
    mov rbx, 0b101010  ; Load binary (decimal 42)
    mov rcx, 1337      ; Load decimal
    
    ; Convert and compare
    cmp rax, 66        ; Is 0x42 == 66?
    je  success        ; Jump if equal
    
    ; Failed
    mov rax, 0
    ret
    
success:
    mov rax, 1         ; Success!
    ret
`,
        objective: 'Set RAX to 0x1337 (decimal 4919)',
        hints: [
            'Hexadecimal uses base 16 (0-9, A-F)',
            '0x1337 is a famous number in hacker culture',
            'Use: mov rax, 0x1337'
        ],
        
        // Pre-recorded trace for simulation
        trace: [
            { ip: 0, regs: { rax: 0x42n } },
            { ip: 1, regs: { rbx: 0x2An } },
            { ip: 2, regs: { rcx: 0x539n } },
            { ip: 3, flags: { zf: 1 } },
            { ip: 5, regs: { rax: 1n } }
        ],
        
        bytes: new Uint8Array([
            0x48, 0xc7, 0xc0, 0x42, 0x00, 0x00, 0x00, // mov rax, 0x42
            0x48, 0xc7, 0xc3, 0x2a, 0x00, 0x00, 0x00, // mov rbx, 0x2A
            0x48, 0xc7, 0xc1, 0x39, 0x05, 0x00, 0x00, // mov rcx, 1337
            0x48, 0x83, 0xf8, 0x42,                   // cmp rax, 66
            0x74, 0x07,                               // je success
            0x48, 0xc7, 0xc0, 0x00, 0x00, 0x00, 0x00, // mov rax, 0
            0xc3,                                     // ret
            0x48, 0xc7, 0xc0, 0x01, 0x00, 0x00, 0x00, // mov rax, 1
            0xc3                                      // ret
        ]),
        
        strings: ['Welcome to the Matrix', '0xDEADBEEF', 'l33t h4x0r'],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    {
        id: '1.2',
        title: '📍 Memory Addresses',
        desc: 'Understanding where data lives',
        level: 1,
        xp: 120,
        skills: ['memory', 'addressing', 'pointers'],
        content: `
# Memory: The Hacker's Playground 🎮

Every byte has an address. Every exploit needs to know where to strike.

## Memory Layout Basics
\`\`\`
High Addresses
┌─────────────┐ 0xFFFFFFFF
│   Kernel    │ (Off limits... for now 😈)
├─────────────┤
│    Stack    │ ← Local variables, return addresses
├─────────────┤
│      ↓      │ (Stack grows down)
│      ↑      │ (Heap grows up)
├─────────────┤
│    Heap     │ ← Dynamic memory (malloc)
├─────────────┤
│     BSS     │ ← Uninitialized globals
├─────────────┤
│    Data     │ ← Initialized globals
├─────────────┤
│    Text     │ ← Your code lives here
└─────────────┘ 0x00000000
Low Addresses
\`\`\`

## Your Mission
Load values from memory addresses. This is how we read data, find secrets, and exploit vulnerabilities.
`,
        code: `
section .data
    secret_value dd 0xC0FFEE    ; 32-bit value at an address
    target_addr  dq secret_value ; Pointer to secret_value

section .text
global _start

_start:
    ; Direct addressing
    mov eax, [secret_value]      ; Load value at address
    
    ; Indirect addressing
    mov rbx, [target_addr]       ; Load address
    mov ecx, [rbx]              ; Load value at that address
    
    ; Calculate with addresses
    lea rdx, [secret_value]      ; Load Effective Address
    
    ; Your turn: Load 0xC0FFEE into RAX
    ; Hint: Use the right addressing mode!
    
    ret
`,
        objective: 'Load the secret value (0xC0FFEE) into RAX',
        hints: [
            'Square brackets [] mean "value at this address"',
            'Without brackets = the address itself',
            'Try: mov eax, [secret_value]'
        ],
        check: (state) => (state.regs.rax & 0xFFFFFFFFn) === 0xC0FFEEn
    },
    
    // ========== LEVEL 2: REGISTER RODEO ==========
    {
        id: '2.1',
        title: '📦 x64 Register Deep Dive',
        desc: 'Master all 16 general-purpose registers',
        level: 2,
        xp: 150,
        skills: ['registers', 'x64', 'calling_convention'],
        content: `
# x64 Registers: Your Swiss Army Knife 🔪

## The Register Family
\`\`\`
64-bit | 32-bit | 16-bit | 8-bit high | 8-bit low | Purpose
-------|--------|--------|------------|-----------|----------
RAX    | EAX    | AX     | AH         | AL        | Accumulator
RBX    | EBX    | BX     | BH         | BL        | Base
RCX    | ECX    | CX     | CH         | CL        | Counter
RDX    | EDX    | DX     | DH         | DL        | Data
RSI    | ESI    | SI     | -          | SIL       | Source Index
RDI    | EDI    | DI     | -          | DIL       | Destination
RBP    | EBP    | BP     | -          | BPL       | Base Pointer
RSP    | ESP    | SP     | -          | SPL       | Stack Pointer
R8-R15 | R8D-R15D | R8W-R15W | -       | R8B-R15B  | New in x64!
\`\`\`

## Calling Convention (System V AMD64)
- First 6 args: RDI, RSI, RDX, RCX, R8, R9
- Return value: RAX
- Preserved: RBX, RBP, R12-R15
- Scratch: Everything else

Remember: Choosing the right register can make or break your exploit!
`,
        code: `
section .text
global _start

_start:
    ; Playing with different register sizes
    mov rax, 0x1122334455667788
    mov eax, 0xAABBCCDD  ; Clears upper 32 bits!
    mov ax, 0xEEFF       ; Only affects lower 16 bits
    mov al, 0x42         ; Only affects lowest 8 bits
    
    ; Special purpose registers in action
    mov rcx, 5           ; Loop counter
    mov rsi, 0xDEAD      ; Source for string ops
    mov rdi, 0xBEEF      ; Destination
    
    ; Challenge: Set RAX to 0x00000000DEADBEEF
    ; without using mov rax, ...
    
    ret
`,
        objective: 'Set RAX to exactly 0x00000000DEADBEEF',
        hints: [
            'Moving to 32-bit register zeros the upper 32 bits',
            'Think about the order of operations',
            'Try: mov eax, 0xDEADBEEF'
        ],
        check: (state) => state.regs.rax === 0xDEADBEEFn
    },
    
    {
        id: '2.2',
        title: '➕ Arithmetic Operations',
        desc: 'ADD, SUB, MUL, DIV - Math for hackers',
        level: 2,
        xp: 160,
        skills: ['arithmetic', 'flags', 'overflow'],
        content: `
# Hacker Math: Exploiting Numbers 🧮

## Arithmetic Instructions
- **ADD/SUB**: Basic operations (affect flags!)
- **INC/DEC**: Increment/Decrement (no carry flag)
- **MUL/IMUL**: Unsigned/Signed multiplication
- **DIV/IDIV**: Division (watch for div-by-zero!)
- **NEG**: Two's complement negation

## The Flags Register (RFLAGS)
\`\`\`
CF (Carry)    : Unsigned overflow
OF (Overflow) : Signed overflow  
ZF (Zero)     : Result is zero
SF (Sign)     : Result is negative
\`\`\`

These flags are CRUCIAL for:
- Conditional jumps
- Overflow exploits
- Timing attacks

Pro tip: Integer overflow is the root of many exploits! 🚨
`,
        code: `
section .text
global _start

_start:
    ; Basic arithmetic
    mov rax, 100
    add rax, 37      ; 100 + 37 = 137
    
    ; Overflow example
    mov rbx, 0x7FFFFFFFFFFFFFFF  ; Max signed 64-bit
    add rbx, 1                   ; Overflow!
    
    ; Multiplication
    mov rax, 1337
    mov rcx, 2
    mul rcx          ; Result in RDX:RAX
    
    ; Your challenge: Calculate (1337 * 13) + 37
    ; Result should be in RAX
    
    ret
`,
        objective: 'Calculate (1337 * 13) + 37 = 17418',
        hints: [
            'MUL uses RDX:RAX for the result',
            'For small numbers, result fits in RAX',
            'Don\'t forget to add 37 at the end!'
        ],
        check: (state) => state.regs.rax === 17418n
    },
    
    // ========== LEVEL 3: STACK SURFER ==========
    {
        id: '3.1',
        title: '📚 Stack Fundamentals',
        desc: 'PUSH, POP, and the art of stack manipulation',
        level: 3,
        xp: 200,
        skills: ['stack', 'push_pop', 'rsp'],
        content: `
# The Stack: Your Temporary Storage 📦

The stack is where the magic happens:
- Function calls
- Local variables  
- Return addresses (exploit goldmine! 💰)

## Stack Rules
1. **Grows DOWN** (towards lower addresses)
2. **RSP** points to the top
3. **PUSH** decrements RSP, then stores
4. **POP** loads, then increments RSP

\`\`\`
High Memory
┌─────────────┐
│   Previous  │
│   Frame     │
├─────────────┤ ← RBP (Frame Pointer)
│   Saved RBP │
├─────────────┤
│   Local Var │
├─────────────┤
│   Local Var │
├─────────────┤ ← RSP (Stack Pointer)
│   (free)    │
└─────────────┘
Low Memory
\`\`\`

Master the stack, master the exploit! 🎯
`,
        code: `
section .text
global _start

_start:
    ; Stack operations
    push 0x1337      ; Push value
    push 0xDEAD
    push 0xBEEF
    
    ; RSP now points to 0xBEEF
    
    pop rax          ; RAX = 0xBEEF
    pop rbx          ; RBX = 0xDEAD
    
    ; Stack math
    sub rsp, 16      ; Allocate 16 bytes
    mov qword [rsp], 0xC0FFEE
    mov qword [rsp+8], 0xBABE
    
    ; Challenge: Get 0x1337 into RCX using the stack
    
    ret
`,
        objective: 'Load 0x1337 into RCX using stack operations',
        hints: [
            'What\'s still on the stack?',
            'Remember LIFO (Last In, First Out)',
            'One more POP should do it!'
        ],
        check: (state) => state.regs.rcx === 0x1337n
    },
    
    {
        id: '3.2',
        title: '🏗️ Stack Frames',
        desc: 'Function prologue, epilogue, and local variables',
        level: 3,
        xp: 220,
        skills: ['stack_frame', 'rbp', 'functions'],
        content: `
# Stack Frames: Function Architecture 🏛️

Every function gets its own stack frame. Understanding frames is crucial for:
- Buffer overflows
- ROP chains
- Stack pivoting

## The Sacred Prologue & Epilogue

\`\`\`asm
; Function Prologue (entry)
push rbp         ; Save old frame pointer
mov rbp, rsp     ; Set up new frame
sub rsp, 0x20    ; Allocate locals

; ... function body ...

; Function Epilogue (exit)
mov rsp, rbp     ; Restore stack pointer
pop rbp          ; Restore frame pointer
ret              ; Return to caller
\`\`\`

## Local Variables
- Addressed relative to RBP: [rbp-8], [rbp-16], etc.
- Compiler usually aligns to 16 bytes
- Buffer overflows can overwrite return address!

This is where the fun begins... 😈
`,
        code: `
section .text
global _start

_start:
    ; Set up a stack frame
    push rbp
    mov rbp, rsp
    sub rsp, 32       ; 32 bytes for locals
    
    ; Use local variables
    mov qword [rbp-8], 0x41414141   ; Local var 1
    mov qword [rbp-16], 0x42424242  ; Local var 2
    mov dword [rbp-20], 0x1337      ; Local var 3
    
    ; Access locals
    mov rax, [rbp-8]
    add rax, [rbp-16]
    
    ; Clean up and return
    mov rsp, rbp
    pop rbp
    
    ; Challenge: Calculate sum of all 3 locals
    
    ret
`,
        objective: 'Sum all three local variables into RAX',
        hints: [
            'Don\'t forget the third variable at [rbp-20]',
            'It\'s a dword (32-bit), use movzx or just mov eax',
            'Final sum should be 0x83838383 + 0x1337'
        ],
        check: (state) => state.regs.rax === 0x838384BAn
    },
    
    // ========== LEVEL 4: CONTROL FLOW CADET ==========
    {
        id: '4.1',
        title: '🎯 Jumps and Branches',
        desc: 'JMP, JE, JNE - Control the flow!',
        level: 4,
        xp: 250,
        skills: ['jumps', 'conditions', 'control_flow'],
        content: `
# Control Flow: Choose Your Own Adventure 🗺️

## Unconditional Jumps
- **JMP**: Always jump (like goto)
- **CALL**: Jump and save return address
- **RET**: Return to saved address

## Conditional Jumps (the fun ones!)
\`\`\`
JE/JZ    : Jump if Equal/Zero (ZF=1)
JNE/JNZ  : Jump if Not Equal (ZF=0)
JL/JNGE  : Jump if Less (SF≠OF)
JG/JNLE  : Jump if Greater (ZF=0 and SF=OF)
JB/JC    : Jump if Below/Carry (CF=1)
JA       : Jump if Above (CF=0 and ZF=0)
\`\`\`

## Pro Tips
- Conditional jumps check FLAGS
- CMP/TEST instructions set flags
- Jump distances: short (±128), near (±2GB), far (anywhere)

Control flow hijacking = Game Over for security! 🎮
`,
        code: `
section .text
global _start

_start:
    mov rax, 42
    mov rbx, 1337
    
    ; Compare and branch
    cmp rax, 50
    jl too_small      ; Jump if less than 50
    jg too_big        ; Jump if greater than 50
    
    ; Exactly 50
    mov rcx, 0x50
    jmp done
    
too_small:
    mov rcx, 0xBAD
    jmp done
    
too_big:
    mov rcx, 0x600D   ; "GOOD"
    
done:
    ; Challenge: Make RCX = 0x1337
    ; Hint: Change the comparison value!
    
    ret
`,
        objective: 'Manipulate control flow to set RCX = 0x1337',
        hints: [
            'What value would take a different branch?',
            'You need to avoid all current paths',
            'Maybe add another branch?'
        ],
        check: (state) => state.regs.rcx === 0x1337n
    },
    
    {
        id: '4.2',
        title: '🔄 Loops and Iterations',
        desc: 'Master the art of repetition',
        level: 4,
        xp: 280,
        skills: ['loops', 'counters', 'optimization'],
        content: `
# Loops: Doing More with Less 🔁

## Loop Instructions
- **LOOP**: Decrement RCX, jump if not zero
- **LOOPE/LOOPZ**: Loop while equal/zero
- **LOOPNE/LOOPNZ**: Loop while not equal

## Manual Loop Patterns
\`\`\`asm
; For loop (count up)
    xor rcx, rcx      ; i = 0
for_loop:
    ; ... loop body ...
    inc rcx
    cmp rcx, 10       ; i < 10
    jl for_loop

; While loop
while_loop:
    ; ... check condition ...
    jz exit_loop
    ; ... loop body ...
    jmp while_loop
exit_loop:

; Do-while loop
do_while:
    ; ... loop body ...
    ; ... check condition ...
    jnz do_while
\`\`\`

Tight loops are beautiful. Infinite loops are bugs... or features? 😏
`,
        code: `
section .text
global _start

_start:
    ; Sum numbers from 1 to 10
    xor rax, rax      ; Sum = 0
    mov rcx, 1        ; Counter = 1
    
sum_loop:
    add rax, rcx      ; Sum += Counter
    inc rcx           ; Counter++
    cmp rcx, 11       ; Counter <= 10?
    jle sum_loop      ; Continue if yes
    
    ; RAX should now be 55 (1+2+...+10)
    
    ; Challenge: Calculate factorial of 5 (5!)
    ; Result should be 120 in RBX
    
    ret
`,
        objective: 'Calculate 5! (factorial) = 120 in RBX',
        hints: [
            'Factorial: 5! = 5 * 4 * 3 * 2 * 1',
            'Start with RBX = 1, RCX = 5',
            'Use MUL or IMUL in your loop'
        ],
        check: (state) => state.regs.rbx === 120n
    },
    
    // ========== LEVEL 5: FUNCTION FUNDAMENTALS ==========
    {
        id: '5.1',
        title: '📞 CALL and RET',
        desc: 'Function calls, the hacker way',
        level: 5,
        xp: 300,
        skills: ['functions', 'calling_convention', 'stack'],
        content: `
# Functions: Modular Hacking 🧩

## The CALL Instruction
When you CALL:
1. Push return address (next instruction)
2. Jump to target function

## The RET Instruction  
When you RET:
1. Pop return address from stack
2. Jump to that address

## x64 Calling Convention (System V)
\`\`\`
Arguments: RDI, RSI, RDX, RCX, R8, R9, then stack
Return:    RAX (RDX:RAX for 128-bit)
Preserve:  RBX, RBP, R12-R15 (callee-saved)
Scratch:   RAX, RCX, RDX, RSI, RDI, R8-R11
\`\`\`

## Stack After CALL
\`\`\`
[RSP]    → Return Address
[RSP+8]  → First stack argument (if any)
[RSP+16] → Second stack argument
...
\`\`\`

Master functions, master exploitation! 🎯
`,
        code: `
section .text
global _start

; Simple function: add two numbers
add_numbers:
    ; RDI = first arg, RSI = second arg
    mov rax, rdi
    add rax, rsi
    ret              ; Return sum in RAX

; Function with local variables
calculate:
    push rbp
    mov rbp, rsp
    sub rsp, 16      ; Space for locals
    
    mov [rbp-8], rdi ; Save first arg
    mov [rbp-16], rsi; Save second arg
    
    ; Do calculation
    mov rax, [rbp-8]
    imul rax, 2      ; Double first arg
    add rax, [rbp-16]; Add second arg
    
    mov rsp, rbp
    pop rbp
    ret

_start:
    ; Call add_numbers(10, 20)
    mov rdi, 10
    mov rsi, 20
    call add_numbers ; RAX = 30
    
    ; Call calculate(100, 37)
    mov rdi, 100
    mov rsi, 37
    call calculate   ; RAX = 237
    
    ; Challenge: Write a function that returns RDI * RDI (square)
    ; Call it with RDI = 12, result should be 144
    
    ret
`,
        objective: 'Create a square function and get 144 in RAX',
        hints: [
            'Create a new function label',
            'Use IMUL RDI, RDI or similar',
            'Don\'t forget to CALL your function!'
        ],
        check: (state) => state.regs.rax === 144n
    },
    
    {
        id: '5.2',
        title: '🎭 Function Epilogue Hijacking',
        desc: 'Your first taste of exploitation!',
        level: 5,
        xp: 350,
        skills: ['exploitation', 'buffer_overflow', 'security'],
        content: `
# Function Exploitation 101 💀

## The Vulnerability
What happens if we write past a buffer's bounds?

\`\`\`
Stack Layout:
┌─────────────────┐
│ Return Address  │ ← Overwrite this!
├─────────────────┤
│ Saved RBP       │
├─────────────────┤
│ Buffer[16]      │ ← Write starts here
└─────────────────┘
\`\`\`

## The Classic Buffer Overflow
\`\`\`c
void vulnerable() {
    char buffer[16];
    gets(buffer);  // DANGEROUS! No bounds check
}
\`\`\`

If we write more than 16 bytes:
- Bytes 0-15: Fill buffer
- Bytes 16-23: Overwrite saved RBP
- Bytes 24-31: Overwrite return address! 🎯

## Exploitation Steps
1. Find the overflow
2. Calculate offset to return address
3. Overwrite with your target
4. PWN! 🏴‍☠️

Welcome to the dark side... 😈
`,
        code: `
section .data
    ; Simulated "user input" that overflows
    payload: times 16 db 'A'      ; Fill buffer
             db 'BBBBBBBB'        ; Overwrite saved RBP
             dq win_function      ; Overwrite return address!

section .text
global _start

win_function:
    ; You win if you reach here!
    mov rax, 0x1337
    ret

vulnerable_function:
    push rbp
    mov rbp, rsp
    sub rsp, 16          ; 16-byte buffer
    
    ; Simulate strcpy(buffer, payload)
    ; In real exploit, this would be user input!
    lea rdi, [rbp-16]    ; Destination: buffer
    lea rsi, [payload]   ; Source: our payload
    mov rcx, 32          ; Copy too much! 
    rep movsb            ; Buffer overflow!
    
    ; Function epilogue
    mov rsp, rbp
    pop rbp
    ret                  ; This will jump to win_function!

_start:
    call vulnerable_function
    ; If exploit works, RAX = 0x1337
    
    ret
`,
        objective: 'Exploit the buffer overflow to set RAX = 0x1337',
        hints: [
            'The overflow is already set up for you',
            'Trace through what happens during the epilogue',
            'The overwritten return address points to win_function'
        ],
        check: (state) => state.regs.rax === 0x1337n
    }
];


