/**
 * 🎓 TIER 3: ADVANCED LESSONS (Levels 11-15)
 * Elite Hacker
 */

export const Tier3Lessons = [
    // ========== LEVEL 11: SHELLCODE SHAMAN ==========
    {
        id: '11.1',
        title: '🐚 Writing Position-Independent Shellcode',
        desc: 'Craft shellcode that works anywhere',
        level: 11,
        xp: 1200,
        skills: ['shellcode', 'position_independent', 'exploitation'],
        content: `
# Position-Independent Code: Location, Location, Location! 📍

## The Challenge
Normal code assumes fixed addresses:
\`\`\`asm
mov rax, [0x401000]  ; Hardcoded address - BAD!
call 0x401050        ; Fixed address - BAD!
\`\`\`

## PIC Techniques

### 1. RIP-Relative Addressing (x64)
\`\`\`asm
lea rax, [rip + offset]  ; Current position + offset
mov rbx, [rip + data]    ; Access data relatively
\`\`\`

### 2. Call-Pop Trick (x86/x64)
\`\`\`asm
call get_rip
get_rip:
    pop rax              ; RAX = current RIP
    ; Now calculate relative addresses
\`\`\`

### 3. JMP-CALL-POP Pattern
\`\`\`asm
jmp shellcode
get_addr:
    pop rsi              ; Address of string
    ; ... use string ...
shellcode:
    call get_addr
    db "/bin/sh", 0
\`\`\`

PIC is essential for:
- Exploit payloads
- Shared libraries
- ASLR bypass
- Code injection

No fixed addresses = Works everywhere! 🌍
`,
        code: `
section .text
global _start

_start:
    ; Position-independent shellcode
    ; Goal: Print "PWN" without hardcoded addresses
    
    ; Get current position
    call get_rip
get_rip:
    pop rbx              ; RBX = address after call
    
    ; Calculate string address
    add rbx, (message - get_rip)
    
    ; Syscall write(1, message, 3)
    mov rax, 1           ; sys_write
    mov rdi, 1           ; stdout
    mov rsi, rbx         ; message address
    mov rdx, 3           ; length
    syscall
    
    ; Exit cleanly
    mov rax, 60          ; sys_exit
    xor rdi, rdi         ; status = 0
    syscall
    
message:
    db "PWN"
    
    ; Challenge: Make this work at any address
    ; Hint: Already position-independent!
    
    ret
`,
        objective: 'Create working position-independent shellcode',
        hints: [
            'Code is already position-independent',
            'Uses call-pop to get current address',
            'Calculates string address relatively'
        ],
        check: (state) => true // Would check syscall output
    },
    
    {
        id: '11.2',
        title: '💉 Syscall Shellcode',
        desc: 'Direct kernel communication',
        level: 11,
        xp: 1300,
        skills: ['syscalls', 'kernel', 'shellcode'],
        content: `
# Syscalls: Talking to the Kernel 🐧

## Linux x64 Syscall Convention
\`\`\`
Syscall Number: RAX
Arguments:      RDI, RSI, RDX, R10, R8, R9
Return Value:   RAX
Instruction:    syscall
\`\`\`

## Common Syscalls
\`\`\`
0   = read(fd, buf, count)
1   = write(fd, buf, count)
2   = open(filename, flags, mode)
59  = execve(filename, argv, envp)
60  = exit(status)
\`\`\`

## Shellcode Example: execve("/bin/sh")
\`\`\`asm
; Clear registers
xor rsi, rsi
xor rdx, rdx

; Push "/bin/sh\0"
mov rax, 0x68732f6e69622f   ; "/bin/sh" backwards
push rax
mov rdi, rsp                ; Filename

; Syscall
mov rax, 59                 ; execve
syscall
\`\`\`

Syscalls are the gateway to:
- File operations
- Network access
- Process control
- Everything!

Master syscalls, control the system! 👑
`,
        code: `
section .text
global _start

_start:
    ; Shellcode: Open and read /etc/passwd
    
    ; Push filename
    xor rax, rax
    push rax                 ; Null terminator
    mov rax, 0x64777373      ; "sswd"
    push rax
    mov rax, 0x6170632f6374  ; "tc/pa"
    push rax
    mov rax, 0x652f2f2f2f2f  ; "////e"
    push rax
    
    ; open("/////etc/passwd", O_RDONLY)
    mov rdi, rsp             ; Filename
    xor rsi, rsi             ; O_RDONLY = 0
    mov rax, 2               ; sys_open
    syscall
    
    ; Check if open succeeded
    test rax, rax
    js failed
    
    ; Success!
    mov rax, 0x1337
    jmp done
    
failed:
    mov rax, 0xDEAD
    
done:
    ; Challenge: Read first 64 bytes of file
    ; Use read() syscall
    
    ret
`,
        objective: 'Read data from opened file using syscalls',
        hints: [
            'File descriptor is in RAX after open',
            'Use syscall 0 (read)',
            'Need buffer for data'
        ],
        check: (state) => state.regs.rax > 0n
    },
    
    // ========== LEVEL 12: FORMAT STRING FU ==========
    {
        id: '12.1',
        title: '📝 Format String Exploitation',
        desc: 'printf() gone wrong',
        level: 12,
        xp: 1400,
        skills: ['format_string', 'memory_leak', 'exploitation'],
        content: `
# Format String Bugs: printf's Dark Side 🖨️

## The Vulnerability
\`\`\`c
char buffer[100];
gets(buffer);
printf(buffer);  // BUG! Should be printf("%s", buffer)
\`\`\`

## Format Specifiers as Weapons
- **%x**: Leak stack values
- **%s**: Read from arbitrary address
- **%n**: WRITE to address!
- **%p**: Leak pointers (ASLR bypass)

## Exploitation Techniques

### 1. Information Leak
\`\`\`
Input: %x %x %x %x %x
Output: 41414141 42424242 deadbeef ...
\`\`\`

### 2. Arbitrary Read
\`\`\`
Input: %7$s       ; Read 7th stack argument as string
\`\`\`

### 3. Arbitrary Write
\`\`\`
Input: %100x%7$n  ; Write 100 to address at arg 7
\`\`\`

Format strings can:
- Leak memory (bypass ASLR)
- Read anywhere
- Write anywhere
- Full system compromise!

printf: Your friendly neighborhood exploit! 🕷️
`,
        code: `
section .data
    secret: dq 0xDEADBEEFCAFEBABE
    target: dq 0
    
    ; Simulated format string
    fmt: db "Stack: %llx %llx %llx %llx", 10, 0
    
section .text
global _start

; Simulated vulnerable printf
vulnerable_printf:
    ; In real exploit, this would be printf()
    ; Here we simulate the leak
    
    ; Load values that would be on stack
    mov rax, 0x4141414141414141
    mov rbx, 0x4242424242424242
    mov rcx, [secret]           ; Secret value!
    mov rdx, 0x4444444444444444
    
    ; "Print" them (store in target)
    mov [target], rcx           ; Leaked secret!
    
    ret

_start:
    ; Clear target
    mov qword [target], 0
    
    ; Call vulnerable function
    call vulnerable_printf
    
    ; Check if secret was leaked
    mov rax, [target]
    cmp rax, [secret]
    je leak_success
    
    mov rax, 0
    jmp done
    
leak_success:
    mov rax, 0x1337
    
done:
    ; Challenge: Use format string to write value
    ; Simulate %n format specifier
    
    ret
`,
        objective: 'Exploit format string to leak secret value',
        hints: [
            'Format strings can read stack values',
            '%x prints values in hex',
            'Positional parameters like %3$x access specific arguments'
        ],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    // ========== LEVEL 13: HEAP HACKER ==========
    {
        id: '13.1',
        title: '🏗️ Heap Exploitation Basics',
        desc: 'Beyond the stack - heap corruption',
        level: 13,
        xp: 1500,
        skills: ['heap', 'use_after_free', 'exploitation'],
        content: `
# Heap Exploitation: Dynamic Memory Mayhem 💥

## Heap vs Stack
\`\`\`
Stack: Local vars, fixed size, LIFO
Heap:  Dynamic alloc, variable size, complex
\`\`\`

## Common Heap Vulnerabilities

### 1. Heap Overflow
\`\`\`c
char *buf = malloc(64);
strcpy(buf, user_input);  // Overflow into next chunk!
\`\`\`

### 2. Use-After-Free (UAF)
\`\`\`c
free(ptr);
// ... later ...
*ptr = value;  // Writing to freed memory!
\`\`\`

### 3. Double Free
\`\`\`c
free(ptr);
free(ptr);  // Corrupts heap metadata!
\`\`\`

## Heap Metadata (glibc)
\`\`\`
┌─────────────┐
│ prev_size   │
├─────────────┤
│ size | AMP  │ ← Metadata
├─────────────┤
│ User Data   │ ← malloc returns here
│   ...       │
└─────────────┘
\`\`\`

Heap exploitation enables:
- Code execution
- Information leaks
- Privilege escalation

The heap: Where free() doesn't mean safe! 🔓
`,
        code: `
section .data
    ; Simulated heap chunks
    chunk1_size: dq 0x20
    chunk1_data: times 24 db 'A'
    
    chunk2_size: dq 0x20
    chunk2_data: times 24 db 'B'
    
    ; Freed chunk list (simulated)
    free_list: dq 0
    
section .text
global _start

; Simulated malloc
my_malloc:
    ; For demo, return fixed addresses
    mov rax, chunk1_data
    ret

; Simulated free
my_free:
    ; Add to free list (simplified)
    mov [free_list], rdi
    ret

_start:
    ; Allocate chunk
    call my_malloc
    mov rbx, rax         ; Save pointer
    
    ; Use chunk
    mov qword [rbx], 0x41414141
    
    ; Free chunk
    mov rdi, rbx
    call my_free
    
    ; Use-After-Free bug!
    mov qword [rbx], 0x1337   ; Writing to freed chunk
    
    ; In real exploit, this could control execution
    mov rax, [rbx]
    
    ; Challenge: Exploit UAF to control data
    
    ret
`,
        objective: 'Exploit use-after-free vulnerability',
        hints: [
            'Freed memory might be reused',
            'UAF allows writing to "freed" memory',
            'Control what gets allocated next'
        ],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    // ========== LEVEL 14: ROP ROCKSTAR ==========
    {
        id: '14.1',
        title: '⛓️ Return-Oriented Programming',
        desc: 'Code reuse attacks - bypass DEP/NX',
        level: 14,
        xp: 1800,
        skills: ['rop', 'gadgets', 'dep_bypass'],
        content: `
# ROP: Programming Without Programming 🎪

## The Problem: DEP/NX
- Stack is non-executable
- Can't run shellcode directly
- Need new technique!

## The Solution: ROP
Use existing code snippets ("gadgets") ending in RET:
\`\`\`asm
pop rdi     ; Gadget 1
ret         ; Returns to next gadget

pop rsi     ; Gadget 2  
ret

syscall     ; Gadget 3
ret
\`\`\`

## Building ROP Chains
\`\`\`
Stack after overflow:
[Gadget1 addr] → pop rdi; ret
["/bin/sh"]    → Value for RDI
[Gadget2 addr] → pop rsi; ret
[0]            → Value for RSI
[Gadget3 addr] → pop rax; ret
[59]           → execve syscall number
[Gadget4 addr] → syscall
\`\`\`

## Finding Gadgets
- ROPgadget tool
- rp++ tool
- Manual search in .text

ROP chains: Turning defense (code) into offense! 🛡️→⚔️
`,
        code: `
section .text
global _start

; Gadgets (in real exploit, these are found in binary)
gadget_pop_rdi:
    pop rdi
    ret

gadget_pop_rsi:
    pop rsi
    ret

gadget_pop_rax:
    pop rax
    ret

gadget_syscall:
    syscall
    ret

; Vulnerable function
vulnerable:
    push rbp
    mov rbp, rsp
    sub rsp, 64
    
    ; Simulated overflow with ROP chain
    ; In real exploit, this comes from input
    lea rax, [rop_chain]
    lea rdi, [rbp-64]
    mov rcx, 120         ; Overflow!
    rep movsb
    
    mov rsp, rbp
    pop rbp
    ret                  ; Return to ROP chain!

section .data
    binsh: db "/bin/sh", 0
    
    ; ROP chain
    rop_chain:
        times 64 db 'A'  ; Fill buffer
        times 8 db 'B'   ; Overwrite saved RBP
        
        ; ROP chain starts here
        dq gadget_pop_rax
        dq 0x1337        ; Value for RAX
        dq gadget_pop_rdi
        dq 0xDEAD        ; Value for RDI
        
_start:
    xor rax, rax
    
    call vulnerable
    
    ; If ROP chain executed: RAX = 0x1337
    
    ret
`,
        objective: 'Execute ROP chain to control registers',
        hints: [
            'Each gadget pops a value and returns',
            'Chain gadgets together via stack',
            'Control execution without new code!'
        ],
        check: (state) => state.regs.rax === 0x1337n
    },
    
    // ========== LEVEL 15: KERNEL KAMIKAZE ==========
    {
        id: '15.1',
        title: '👑 Kernel Exploitation Intro',
        desc: 'Ring 0 - The ultimate target',
        level: 15,
        xp: 2000,
        skills: ['kernel', 'ring0', 'privilege_escalation'],
        content: `
# Kernel Exploitation: God Mode 🎮

## Privilege Rings
\`\`\`
Ring 0: Kernel (full control)
Ring 1: Device drivers (rarely used)
Ring 2: Device drivers (rarely used)  
Ring 3: User applications (restricted)
\`\`\`

## Kernel vs Userland
| Userland | Kernel |
|----------|---------|
| Limited memory access | All memory accessible |
| Can't execute privileged instructions | All instructions allowed |
| Process isolation | No isolation |
| Crashes = app dies | Crashes = system dies |

## Common Kernel Vulnerabilities
1. **Race Conditions**: TOCTOU bugs
2. **Integer Overflows**: Size calculations
3. **Buffer Overflows**: Stack/heap corruption
4. **Logic Bugs**: Permission checks

## Exploitation Goals
- Privilege escalation (uid=0)
- Disable security features
- Install rootkits
- Complete system control

## Kernel Shellcode
\`\`\`asm
; Elevate privileges
xor rdi, rdi        ; uid = 0
call commit_creds
call prepare_kernel_cred
\`\`\`

Remember: With great power comes kernel panic! 💥
`,
        code: `
section .text
global _start

; Simulated kernel structures
struc cred
    .uid:    resq 1
    .gid:    resq 1
    .caps:   resq 1
endstruc

section .data
    ; Current process creds (simulated)
    current_cred:
        istruc cred
            at cred.uid, dq 1000    ; Regular user
            at cred.gid, dq 1000
            at cred.caps, dq 0
        iend

section .text
; Simulated kernel functions
commit_creds:
    ; Would update process credentials
    ret

prepare_kernel_cred:
    ; Would prepare root credentials
    xor rax, rax     ; Return root cred
    ret

; Kernel exploit payload
kernel_payload:
    ; Get root credentials
    xor rdi, rdi
    call prepare_kernel_cred
    
    ; Apply to current process
    mov rdi, rax
    call commit_creds
    
    ; Update our simulated creds
    mov qword [current_cred + cred.uid], 0
    mov qword [current_cred + cred.gid], 0
    
    ret

_start:
    ; Check current privileges
    mov rax, [current_cred + cred.uid]
    cmp rax, 0
    je already_root
    
    ; Exploit kernel vulnerability
    call kernel_payload
    
    ; Check if we got root
    mov rax, [current_cred + cred.uid]
    cmp rax, 0
    je got_root
    
    mov rax, 0xFAIL
    jmp done
    
already_root:
    mov rax, 0xALREADY
    jmp done
    
got_root:
    mov rax, 0x31337    ; Elite status!
    
done:
    ret
`,
        objective: 'Escalate privileges to root (uid=0)',
        hints: [
            'Kernel exploits modify credential structures',
            'commit_creds applies new credentials',
            'uid=0 means root privileges'
        ],
        check: (state) => state.regs.rax === 0x31337n
    }
];
