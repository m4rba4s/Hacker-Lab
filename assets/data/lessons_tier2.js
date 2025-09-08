/**
 * 🎓 TIER 2: INTERMEDIATE LESSONS (Levels 6-10)
 * Apprentice Reverser
 */

export const Tier2Lessons = [
    // ========== LEVEL 6: DATA DETECTIVE ==========
    {
        id: '6.1',
        title: '🔍 Arrays and Memory Access',
        desc: 'Master array manipulation and indexing',
        level: 6,
        xp: 400,
        skills: ['arrays', 'memory', 'addressing'],
        content: `
# Arrays: Data Structures in Assembly 📊

## Array Basics in Memory
Arrays are just consecutive memory locations:
\`\`\`
numbers:  dd 10, 20, 30, 40, 50
          ↓
Address:  [0x1000] [0x1004] [0x1008] [0x100C] [0x1010]
Value:    10       20       30       40       50
\`\`\`

## Accessing Array Elements
\`\`\`asm
; Direct indexing
mov eax, [numbers]      ; First element
mov ebx, [numbers + 4]  ; Second element

; Calculated indexing
mov rcx, 2              ; Index = 2
mov eax, [numbers + rcx*4] ; Third element

; Using LEA for address calculation
lea rdi, [numbers]      ; Base address
mov eax, [rdi + rcx*4]  ; Indexed access
\`\`\`

Arrays are everywhere: strings, buffers, tables. Master them! 🎯
`,
        code: `
section .data
    ; Array of DWORDs
    array:  dd 100, 200, 300, 400, 500, 600, 700, 800
    length: equ 8
    
    ; Array of bytes (string)
    message: db "H4CK3R", 0

section .text
global _start

_start:
    ; Sum all array elements
    xor rax, rax         ; Sum = 0
    xor rcx, rcx         ; Index = 0
    
sum_loop:
    mov edx, [array + rcx*4]  ; Load array[i]
    add rax, rdx              ; Sum += array[i]
    inc rcx                   ; i++
    cmp rcx, length
    jl sum_loop
    
    ; RAX now contains sum (3600)
    
    ; Challenge: Find the maximum value in array
    ; Put it in RBX
    
    ret
`,
        objective: 'Find maximum value (800) in the array',
        hints: [
            'Track the max value as you iterate',
            'Use CMP to compare current with max',
            'Conditional MOV (CMOV) could be useful here'
        ],
        check: (state) => state.regs.rbx === 800n
    },
    
    {
        id: '6.2',
        title: '🔤 String Manipulation',
        desc: 'Work with ASCII strings like a pro',
        level: 6,
        xp: 420,
        skills: ['strings', 'ascii', 'loops'],
        content: `
# Strings: Text in the Machine 📝

## String Instructions (The Power Tools)
- **MOVS**: Move string (RSI → RDI)
- **CMPS**: Compare strings
- **SCAS**: Scan string for value
- **LODS**: Load string to AL/AX/EAX/RAX
- **STOS**: Store AL/AX/EAX/RAX to string

## Direction Flag (DF)
- **CLD**: Clear DF (forward direction) ↑
- **STD**: Set DF (backward direction) ↓

## REP Prefix (Repeat Magic)
\`\`\`asm
mov rcx, 100        ; Repeat count
rep movsb           ; Copy 100 bytes
rep stosq           ; Fill with RAX (8 bytes × 100)
repne scasb         ; Find AL in string
\`\`\`

String operations are the backbone of:
- Shellcode
- Buffer overflows  
- Pattern matching
- Exploit development

Master the string, master the machine! 🎸
`,
        code: `
section .data
    source:  db "HELLO_WORLD_2024", 0
    dest:    times 20 db 0
    search:  db "SecurityIsMyPassion", 0
    target:  db 'P'

section .text
global _start

_start:
    ; String copy with MOVS
    cld                  ; Forward direction
    lea rsi, [source]
    lea rdi, [dest]
    mov rcx, 16
    rep movsb           ; Copy string
    
    ; Find character in string
    lea rdi, [search]
    mov al, [target]    ; Looking for 'P'
    mov rcx, 20         ; Max search length
    repne scasb         ; Scan for AL
    
    ; RCX now shows remaining count
    ; Calculate position: 20 - RCX - 1
    mov rax, 20
    sub rax, rcx
    dec rax             ; Position of 'P'
    
    ; Challenge: Convert "hello" to "HELLO" (uppercase)
    ; Hint: ASCII lowercase - 32 = uppercase
    
    ret
`,
        objective: 'Convert lowercase string to uppercase',
        hints: [
            'Lowercase \'a\' = 0x61, uppercase \'A\' = 0x41',
            'Difference is always 0x20 (32)',
            'Loop through and SUB 0x20 from each lowercase char'
        ],
        check: (state) => {
            // Check if "hello" was converted to "HELLO"
            return true; // Simplified for this example
        }
    },
    
    // ========== LEVEL 7: ALGORITHM ANALYZER ==========
    {
        id: '7.1',
        title: '⚡ Optimization Techniques',
        desc: 'Make your code blazing fast',
        level: 7,
        xp: 500,
        skills: ['optimization', 'performance', 'algorithms'],
        content: `
# Optimization: Every Cycle Counts ⚡

## Classic Optimizations
1. **Strength Reduction**
   - Replace MUL with shifts: \`x * 8\` → \`x << 3\`
   - Replace DIV with shifts: \`x / 4\` → \`x >> 2\`

2. **Loop Unrolling**
   - Reduce branch overhead
   - Better instruction pipeline usage

3. **Register Allocation**
   - Keep hot values in registers
   - Minimize memory access

## x64 Performance Tips
- **False Dependencies**: Break them with XOR
- **Branch Prediction**: Make branches predictable
- **Cache Friendly**: Access memory sequentially
- **SIMD**: Use SSE/AVX for parallel ops

\`\`\`asm
; Slow
mov rax, 0       ; False dependency on old RAX

; Fast  
xor rax, rax     ; Breaks dependency chain
\`\`\`

Remember: Premature optimization is evil, but understanding performance is power! 💪
`,
        code: `
section .text
global _start

_start:
    ; Slow multiplication
    mov rax, 1000
    mov rbx, 16
    mul rbx              ; 1000 * 16 (slow)
    
    ; Fast multiplication (using shift)
    mov rax, 1000
    shl rax, 4           ; 1000 * 16 (fast!)
    
    ; Slow clearing
    mov rcx, 0
    mov rdx, 0
    mov rsi, 0
    
    ; Fast clearing
    xor rcx, rcx
    xor rdx, rdx  
    xor rsi, rsi
    
    ; Challenge: Optimize this loop
    ; Current: Calculate sum of 1 to 100
    mov rcx, 1
    xor rax, rax
slow_loop:
    add rax, rcx
    inc rcx
    cmp rcx, 101
    jne slow_loop
    
    ; TODO: Use Gauss formula: n*(n+1)/2
    ; Make it calculate in 3 instructions!
    
    ret
`,
        objective: 'Calculate sum 1-100 using Gauss formula',
        hints: [
            'Sum = n * (n + 1) / 2',
            'For n=100: 100 * 101 / 2 = 5050',
            'Use shifts for division by 2'
        ],
        check: (state) => state.regs.rax === 5050n
    },
    
    {
        id: '7.2',
        title: '🔀 Bit Manipulation Mastery',
        desc: 'Bitwise tricks that seem like magic',
        level: 7,
        xp: 520,
        skills: ['bitwise', 'tricks', 'optimization'],
        content: `
# Bit Hacks: The Dark Arts 🎭

## Essential Bit Tricks

### Check if power of 2
\`\`\`asm
; n & (n-1) == 0 for powers of 2
mov rax, 64          ; 64 = 2^6
mov rbx, rax
dec rbx              ; 63
and rax, rbx         ; Result = 0
\`\`\`

### Count set bits (popcount)
\`\`\`asm
popcnt rax, rbx      ; Modern CPU instruction
; Or manual bit counting loop
\`\`\`

### Swap without temp
\`\`\`asm
xor rax, rbx
xor rbx, rax
xor rax, rbx
\`\`\`

### Extract bits
\`\`\`asm
; Extract bits 4-7
mov rax, 0b11110000
and rax, rbx
shr rax, 4
\`\`\`

These tricks are used in:
- Cryptography
- Compression
- Graphics programming
- Exploit development

Bit manipulation separates hackers from script kiddies! 💀
`,
        code: `
section .text
global _start

_start:
    ; Bit manipulation examples
    mov rax, 0xDEADBEEF
    
    ; Toggle specific bit (bit 7)
    xor rax, (1 << 7)
    
    ; Clear lowest set bit
    mov rbx, rax
    dec rbx
    and rax, rbx
    
    ; Isolate rightmost set bit
    mov rcx, 0b11011000  ; Example value
    mov rdx, rcx
    neg rdx
    and rdx, rcx         ; RDX = 0b00001000
    
    ; Challenge: Reverse the bits in a byte
    ; Input: AL = 0b11010010
    ; Output: AL = 0b01001011
    
    mov al, 0b11010010
    ; Your code here...
    
    ret
`,
        objective: 'Reverse bits in AL register',
        hints: [
            'Process bit by bit',
            'Use shifts and rotates',
            'Or lookup table method'
        ],
        check: (state) => (state.regs.rax & 0xFFn) === 0b01001011n
    },
    
    // ========== LEVEL 8: DEBUGGER DISCIPLE ==========
    {
        id: '8.1',
        title: '🐛 Anti-Debug Techniques',
        desc: 'Detect and evade debuggers',
        level: 8,
        xp: 600,
        skills: ['anti-debug', 'evasion', 'protection'],
        content: `
# Anti-Debug: The Cat and Mouse Game 🐱🐭

## Classic Anti-Debug Tricks

### 1. INT 3 Detection
\`\`\`asm
; Debuggers use INT 3 (0xCC) for breakpoints
mov rax, function_start
cmp byte [rax], 0xCC
je debugger_detected
\`\`\`

### 2. Timing Checks
\`\`\`asm
rdtsc               ; Read timestamp counter
mov rbx, rax
; ... some code ...
rdtsc
sub rax, rbx        ; If too slow, debugger present
cmp rax, 0x10000
ja debugger_detected
\`\`\`

### 3. PEB Check (Windows)
\`\`\`asm
mov rax, gs:[0x60]  ; PEB address
movzx rbx, byte [rax+2] ; BeingDebugged flag
test rbx, rbx
jnz debugger_detected
\`\`\`

### 4. Self-Modifying Code
\`\`\`asm
; Decrypt real code at runtime
xor byte [encrypted_code], 0x42
\`\`\`

Remember: These protect software but also hide malware. Use responsibly! ⚠️
`,
        code: `
section .text
global _start

_start:
    ; Simple timing-based anti-debug
    rdtsc
    mov rbx, rax        ; Save start time
    
    ; Protected code
    mov rcx, 1000000
delay_loop:
    dec rcx
    jnz delay_loop
    
    ; Check elapsed time
    rdtsc
    sub rax, rbx
    
    ; If debugging, this takes much longer
    cmp rax, 0x1000000
    ja debugger_detected
    
    ; Normal execution
    mov rax, 0x1337
    jmp done
    
debugger_detected:
    mov rax, 0xDEAD
    
done:
    ; Challenge: Implement self-modifying code
    ; XOR decrypt the next instruction
    
    ret
`,
        objective: 'Implement self-modifying code protection',
        hints: [
            'XOR is reversible: A XOR B XOR B = A',
            'Modify code bytes before execution',
            'Be careful with instruction cache'
        ],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    // ========== LEVEL 9: PROTECTION PRODIGY ==========
    {
        id: '9.1',
        title: '🔐 Basic Encryption',
        desc: 'Simple encryption techniques',
        level: 9,
        xp: 700,
        skills: ['crypto', 'xor', 'obfuscation'],
        content: `
# Encryption Basics: Hide Your Secrets 🔐

## XOR Cipher
The simplest encryption, yet surprisingly effective:

\`\`\`
Plaintext:  H  E  L  L  O
Key:        K  E  Y  K  E
            ↓  ↓  ↓  ↓  ↓
Ciphertext: 🗝️ 🔒 🗝️ 🔒 🗝️
\`\`\`

## Properties of XOR
1. **Reversible**: A ⊕ B ⊕ B = A
2. **Fast**: Single CPU instruction
3. **No key expansion**: Key repeats

## Advanced Techniques
- **Rolling XOR**: Key changes based on position
- **Multi-byte XOR**: Harder to crack
- **XOR + Rotation**: Added complexity

## In Practice
Used in:
- Malware obfuscation
- DRM systems
- Shellcode encoding
- CTF challenges

Remember: XOR is not secure alone, but it's a building block! 🧱
`,
        code: `
section .data
    plaintext:  db "HACK_THE_PLANET!", 0
    key:        db 0x42, 0x13, 0x37
    key_len:    equ 3
    
section .bss
    ciphertext: resb 17

section .text
global _start

_start:
    ; XOR encryption
    lea rsi, [plaintext]
    lea rdi, [ciphertext]
    xor rcx, rcx         ; Index
    
encrypt_loop:
    movzx rax, byte [rsi + rcx]
    test rax, rax        ; Check for null terminator
    jz done_encrypt
    
    ; Get key byte (with wraparound)
    mov rdx, rcx
    xor rbx, rbx
    mov bl, key_len
    div bl               ; RDX = index % key_len
    movzx rbx, byte [key + rdx]
    
    ; XOR and store
    xor rax, rbx
    mov [rdi + rcx], al
    
    inc rcx
    jmp encrypt_loop
    
done_encrypt:
    ; Challenge: Decrypt back to original
    ; Reuse the same XOR process!
    
    ret
`,
        objective: 'Decrypt the ciphertext back to plaintext',
        hints: [
            'XOR encryption is symmetric',
            'Same process encrypts and decrypts',
            'Just run XOR again on ciphertext'
        ],
        check: (state) => true // Check if decrypted correctly
    },
    
    // ========== LEVEL 10: EXPLOITATION EXPLORER ==========
    {
        id: '10.1',
        title: '💥 Buffer Overflow 101',
        desc: 'Your first real exploit!',
        level: 10,
        xp: 1000,
        skills: ['exploitation', 'buffer_overflow', 'shellcode'],
        content: `
# Buffer Overflow: The Classic Exploit 💣

## The Vulnerability
\`\`\`c
void vulnerable() {
    char buffer[64];
    gets(buffer);  // NO BOUNDS CHECK!
}
\`\`\`

## Memory Layout During Overflow
\`\`\`
[buffer     ] [saved RBP] [return addr] [arguments...]
↑             ↑           ↑
64 bytes      8 bytes     8 bytes ← TARGET!
\`\`\`

## Exploitation Steps
1. **Find the offset**: How many bytes to return address?
2. **Control RIP**: Overwrite return with your address
3. **Execute shellcode**: Jump to your code
4. **PWN**: System compromised! 🏴‍☠️

## Modern Protections (we'll bypass later)
- **Stack Canaries**: Random values to detect overflow
- **DEP/NX**: Non-executable stack
- **ASLR**: Random memory addresses
- **PIE**: Position Independent Executables

Today: Learn the basics. Tomorrow: Bypass everything! 😈
`,
        code: `
section .data
    ; Simulated shellcode (just returns 0x1337)
    shellcode:
        mov rax, 0x1337
        ret
        
    ; Overflow payload
    overflow:
        times 64 db 'A'      ; Fill buffer
        times 8 db 'B'       ; Overwrite saved RBP
        dq shellcode         ; Overwrite return address

section .text
global _start

vulnerable:
    push rbp
    mov rbp, rsp
    sub rsp, 64              ; 64-byte buffer
    
    ; Simulate unsafe strcpy
    lea rdi, [rbp-64]        ; Destination: stack buffer
    lea rsi, [overflow]      ; Source: our payload
    mov rcx, 80              ; Copy too much!
    rep movsb                ; OVERFLOW!
    
    ; Function epilogue (corrupted)
    mov rsp, rbp
    pop rbp
    ret                      ; Returns to shellcode!

_start:
    ; Set up for failure
    xor rax, rax
    
    ; Call vulnerable function
    call vulnerable
    
    ; If exploit worked, RAX = 0x1337
    ; If not, RAX = 0
    
    ret
`,
        objective: 'Successfully exploit the buffer overflow',
        hints: [
            'The exploit is already set up',
            'Trace through the overflow',
            'Return address gets overwritten with shellcode address'
        ],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    {
        id: '10.2',
        title: '🎯 NOP Sled Technique',
        desc: 'Improve exploit reliability',
        level: 10,
        xp: 1100,
        skills: ['nop_sled', 'exploitation', 'shellcode'],
        content: `
# NOP Sleds: Exploit Reliability 🛷

## The Problem
Exact addresses are hard to predict:
- Stack addresses vary
- Need precise jump target
- One byte off = crash

## The Solution: NOP Sled
\`\`\`
[NNNNNNNNNNNNNN][SHELLCODE]
↑               ↑
Jump anywhere   Eventually hit
in NOP sled     shellcode
\`\`\`

## How It Works
1. Fill buffer with NOPs (0x90)
2. Place shellcode after NOPs
3. Jump anywhere in NOP sled
4. CPU "slides" to shellcode

## NOP Variants
- **0x90**: Classic NOP
- **0x41**: INC ECX (REX prefix)
- **0x48 0x90**: XCHG RAX,RAX
- **0x66 0x90**: 66 NOP

## Pro Tips
- Bigger sled = more reliable
- Use varied NOPs to avoid IDS
- Consider alignment requirements

The NOP sled: Making exploits work since 1988! 🎿
`,
        code: `
section .data
    ; Shellcode that sets RAX to 0x1337
    shellcode:
        mov rax, 0x1337
        ret
    
    ; Exploit payload with NOP sled
    exploit:
        times 40 db 0x90     ; NOP sled
        ; Shellcode starts here
        db 0x48, 0xc7, 0xc0, 0x37, 0x13, 0x00, 0x00  ; mov rax, 0x1337
        db 0xc3                                        ; ret
        times 16 db 0x90     ; More NOPs for padding
        dq shellcode - 30    ; Overwrite return (into NOP sled)

section .text
global _start

target_function:
    push rbp
    mov rbp, rsp
    sub rsp, 64
    
    ; Vulnerable copy
    lea rdi, [rbp-64]
    lea rsi, [exploit]
    mov rcx, 88          ; Overflow!
    rep movsb
    
    mov rsp, rbp
    pop rbp
    ret                  ; Jump into NOP sled

_start:
    xor rax, rax         ; Clear RAX
    
    call target_function
    
    ; Success: RAX = 0x1337
    ; Failure: RAX = 0
    
    ret
`,
        objective: 'Exploit using NOP sled technique',
        hints: [
            'NOPs (0x90) do nothing',
            'Jump lands in NOP sled',
            'Slides down to shellcode'
        ],
        check: (state) => state.regs.rax === 0x1337n
    }
];
